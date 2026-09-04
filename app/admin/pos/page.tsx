'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStore, saveStore, generateId, nextInvoiceNumber } from '@/app/lib/admin/store';
import { useAuth } from '@/app/lib/admin/auth-context';
import type { Customer, Product, InvoiceItem, PaymentMethod, EyeTest } from '@/app/lib/admin/types';
import { can, getMaxDiscount } from '@/app/lib/admin/permissions';
import { Search, Plus, Trash2, ShoppingCart, CheckCircle, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';

function fmt(n: number) { return '₹' + n.toLocaleString('en-IN'); }

function POSContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [step, setStep] = useState<'customer' | 'products' | 'payment' | 'done'>('customer');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedEyeTest, setSelectedEyeTest] = useState<EyeTest | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productTab, setProductTab] = useState<'all' | 'frame' | 'lens' | 'sunglass' | 'service'>('all');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [hasOrder, setHasOrder] = useState(true);
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [discountWarning, setDiscountWarning] = useState('');
  const [createdInvoiceId, setCreatedInvoiceId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const store = getStore();
    setCustomers(store.customers);
    setProducts(store.products.filter((p) => p.status === 'active'));

    const cid = params.get('customerId');
    if (cid) {
      const c = store.customers.find((c) => c.id === cid);
      if (c) {
        setSelectedCustomer(c);
        setStep('products');

        const etId = params.get('eyeTestId');
        if (etId) {
          const test = store.eyeTests.find((e) => e.id === etId);
          if (test) setSelectedEyeTest(test);
        } else {
          const latestTest = store.eyeTests.filter((e) => e.customerId === c.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          if (latestTest) setSelectedEyeTest(latestTest);
        }
      }
    }
  }, [params]);

  // Customer search
  useEffect(() => {
    if (!customerSearch.trim() || selectedCustomer) { setCustomerResults([]); return; }
    const q = customerSearch.toLowerCase();
    setCustomerResults(customers.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 6));
  }, [customerSearch, customers, selectedCustomer]);

  const filteredProducts = products.filter((p) => {
    const matchTab = productTab === 'all' || p.category === productTab;
    const q = productSearch.toLowerCase();
    return matchTab && (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q));
  });

  const addToCart = (product: Product) => {
    if (product.category !== 'service' && product.stock <= 0) return;
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      setCart((c) => c.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } : i));
    } else {
      const item: InvoiceItem = {
        id: generateId('ii'),
        productId: product.id,
        productName: product.name,
        productCode: product.productCode,
        category: product.category,
        quantity: 1,
        unitPrice: product.sellingPrice,
        discount: 0,
        total: product.sellingPrice,
      };
      setCart((c) => [...c, item]);
    }
  };

  const removeFromCart = (itemId: string) => setCart((c) => c.filter((i) => i.id !== itemId));

  const updateQty = (itemId: string, qty: number) => {
    if (qty < 1) return;
    setCart((c) => c.map((i) => i.id === itemId ? { ...i, quantity: qty, total: qty * i.unitPrice } : i));
  };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const maxDiscount = user ? getMaxDiscount(user.role) : 0;

  const handleDiscountChange = (val: number) => {
    setDiscountPercent(val);
    if (val > maxDiscount) {
      setDiscountWarning(`Your role allows max ${maxDiscount}% discount. Manager approval required.`);
    } else {
      setDiscountWarning('');
    }
  };

  const discountAmt = Math.round(subtotal * Math.min(discountPercent, 100) / 100);
  const total = subtotal - discountAmt;
  const paid = parseFloat(amountPaid) || 0;
  const balance = total - paid;

  const handleComplete = async () => {
    if (!selectedCustomer) return;
    if (cart.length === 0) { alert('Add at least one item.'); return; }
    if (paid <= 0 && balance === total) {
      if (!confirm('No payment received. Create invoice as PENDING?')) return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const store = getStore();
    const invoiceNumber = nextInvoiceNumber();
    const frameItem = cart.find((i) => i.category === 'frame');
    const lensItem = cart.find((i) => i.category === 'lens');
    const needsOrder = hasOrder && (frameItem || lensItem);

    const newInvoice = {
      id: generateId('inv'),
      invoiceNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      items: cart,
      subtotal,
      discountAmount: discountAmt,
      discountPercent,
      total,
      paid,
      balance: total - paid,
      status: (paid === 0 ? 'pending' : paid < total ? 'partially_paid' : 'paid') as 'paid' | 'partially_paid' | 'pending',
      payments: paid > 0 ? [{
        id: generateId('pay'),
        amount: paid,
        method: paymentMethod,
        date: new Date().toISOString(),
        receivedBy: user?.name ?? '',
      }] : [],
      orderStatus: needsOrder ? 'new' as const : undefined,
      frameProduct: frameItem?.productName,
      lensProduct: lensItem?.productName,
      eyeTestId: selectedEyeTest?.id || undefined,
      expectedDate: needsOrder ? expectedDate : undefined,
      createdBy: user?.name ?? '',
      createdAt: new Date().toISOString(),
      notes: notes || undefined,
    };

    store.invoices.unshift(newInvoice);

    // Update stock
    for (const item of cart) {
      if (item.category === 'service') continue;
      const pi = store.products.findIndex((p) => p.id === item.productId);
      if (pi !== -1) store.products[pi].stock -= item.quantity;
      store.stockMovements.unshift({
        id: generateId('sm'),
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        type: 'sale',
        quantity: -item.quantity,
        reference: invoiceNumber,
        createdBy: user?.name ?? '',
        createdAt: new Date().toISOString(),
      });
    }

    // Update customer last visit
    const ci = store.customers.findIndex((c) => c.id === selectedCustomer.id);
    if (ci !== -1) store.customers[ci].lastVisit = new Date().toISOString();

    store.auditLogs.unshift({
      id: generateId('al'),
      action: 'INVOICE_CREATED',
      entity: 'Invoice',
      entityId: newInvoice.id,
      details: `Invoice ${invoiceNumber} — ${fmt(total)} — ${selectedCustomer.name}`,
      performedBy: user?.name ?? '',
      performedByRole: user?.role ?? 'staff',
      createdAt: new Date().toISOString(),
    });

    saveStore(store);
    setCreatedInvoiceId(newInvoice.id);
    setSaving(false);
    setStep('done');
  };

  // DONE screen
  if (step === 'done') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#16a34a' }}>
            <CheckCircle width={32} height={32} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Sale Complete!</div>
          <div style={{ color: '#64748b', marginBottom: 24 }}>
            Invoice created · {fmt(total)} total · {fmt(paid)} received · {balance > 0 ? fmt(balance) + ' pending' : 'Fully paid'}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/admin/invoices/${createdInvoiceId}`} className="adm-btn adm-btn-primary">View Invoice</Link>
            <Link href="/admin/orders" className="adm-btn adm-btn-secondary">View Orders</Link>
            <button onClick={() => { setStep('customer'); setSelectedCustomer(null); setCart([]); setDiscountPercent(0); setAmountPaid(''); setNotes(''); setCreatedInvoiceId(''); }} className="adm-btn adm-btn-secondary">
              New Sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">POS / Billing</div>
        {/* Steps */}
        <div style={{ display: 'flex', gap: 6, fontSize: 12.5, fontWeight: 600 }}>
          {(['customer', 'products', 'payment'] as const).map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span style={{ color: '#d1d5db' }}>›</span>}
              <span style={{ color: step === s ? '#fc5a06' : ['customer', 'products', 'payment'].indexOf(step) > i ? '#16a34a' : '#94a3b8', textTransform: 'capitalize' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'start' }}>
        {/* Left Panel */}
        <div>
          {/* Step 1 — Customer */}
          <div className="adm-card" style={{ marginBottom: 16 }}>
            <div className="adm-card-header">
              <span style={{ width: 22, height: 22, background: step === 'customer' || selectedCustomer ? '#fc5a06' : '#f1f5f9', color: step === 'customer' || selectedCustomer ? 'white' : '#94a3b8', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>1</span>
              <span className="adm-card-title">Customer</span>
              {selectedCustomer && <button onClick={() => { setSelectedCustomer(null); setStep('customer'); }} className="adm-btn adm-btn-ghost adm-btn-sm"><X width={12} height={12} /></button>}
            </div>
            <div className="adm-card-body">
              {selectedCustomer ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fc5a061a', color: '#fc5a06', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                      {selectedCustomer.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedCustomer.name}</div>
                      <div style={{ fontSize: 12.5, color: '#64748b' }}>{selectedCustomer.phone} · {selectedCustomer.customerId}</div>
                    </div>
                    <button onClick={() => setStep('products')} className="adm-btn adm-btn-primary adm-btn-sm" style={{ marginLeft: 'auto' }}>Add Products →</button>
                  </div>

                  {selectedEyeTest && (
                    <div style={{ marginTop: 12, padding: '10px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 12 }}>
                      <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: 4 }}>
                        👁️ Attached Prescription ({new Date(selectedEyeTest.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
                      </div>
                      <div style={{ display: 'flex', gap: 16, color: '#1e3a8a', flexWrap: 'wrap' }}>
                        <span><strong>OD (Right):</strong> SPH {selectedEyeTest.rightEye.sph || '0.00'} / CYL {selectedEyeTest.rightEye.cyl || '0.00'} / AXIS {selectedEyeTest.rightEye.axis || '0'}</span>
                        <span><strong>OS (Left):</strong> SPH {selectedEyeTest.leftEye.sph || '0.00'} / CYL {selectedEyeTest.leftEye.cyl || '0.00'} / AXIS {selectedEyeTest.leftEye.axis || '0'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div className="adm-search-wrap">
                    <Search />
                    <input className="adm-input" placeholder="Search by name or phone…" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
                  </div>
                  {customerResults.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, marginTop: 4, overflow: 'hidden' }}>
                      {customerResults.map((c) => (
                        <button key={c.id} onClick={() => { setSelectedCustomer(c); setStep('products'); setCustomerResults([]); }}
                          style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #f1f5f9', fontFamily: 'inherit' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                        >
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.phone} · {c.customerId}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  <Link href="/admin/customers/new" className="adm-btn adm-btn-secondary" style={{ marginTop: 10 }}>
                    <Plus width={13} height={13} /> New Customer
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Step 2 — Products */}
          {(step === 'products' || step === 'payment') && (
            <div className="adm-card" style={{ marginBottom: 16 }}>
              <div className="adm-card-header">
                <span style={{ width: 22, height: 22, background: '#fc5a06', color: 'white', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>2</span>
                <span className="adm-card-title">Products</span>
              </div>
              <div className="adm-card-body">
                <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                  <div className="adm-search-wrap" style={{ flex: 1, minWidth: 200 }}>
                    <Search />
                    <input className="adm-input" placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                  </div>
                  <div className="adm-tabs">
                    {(['all', 'frame', 'lens', 'sunglass', 'service'] as const).map((t) => (
                      <button key={t} className={`adm-tab${productTab === t ? ' active' : ''}`} onClick={() => setProductTab(t)} style={{ fontSize: 12 }}>
                        {t === 'sunglass' ? 'Sunglasses' : t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, maxHeight: 280, overflowY: 'auto' }}>
                  {filteredProducts.map((p) => (
                    <button key={p.id} onClick={() => addToCart(p)}
                      disabled={p.category !== 'service' && p.stock <= 0}
                      style={{
                        border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: p.stock <= 0 && p.category !== 'service' ? '#f8fafc' : 'white',
                        cursor: p.stock <= 0 && p.category !== 'service' ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: p.stock <= 0 && p.category !== 'service' ? 0.5 : 1,
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease', fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => { if (!(p.stock <= 0)) (e.currentTarget as HTMLButtonElement).style.borderColor = '#fc5a06'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{p.productCode}</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', lineHeight: 1.3, marginBottom: 6 }}>{p.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <span style={{ fontWeight: 700, color: '#fc5a06', fontSize: 14 }}>{fmt(p.sellingPrice)}</span>
                        {p.category !== 'service' && (
                          <span style={{ fontSize: 11, color: p.stock <= 3 ? '#dc2626' : '#94a3b8' }}>
                            {p.stock <= 0 ? 'Out' : `${p.stock} left`}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {cart.length > 0 && (
                  <button onClick={() => setStep('payment')} className="adm-btn adm-btn-primary" style={{ marginTop: 14 }}>
                    Proceed to Payment →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3 — Payment */}
          {step === 'payment' && (
            <div className="adm-card">
              <div className="adm-card-header">
                <span style={{ width: 22, height: 22, background: '#fc5a06', color: 'white', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>3</span>
                <span className="adm-card-title">Payment</span>
              </div>
              <div className="adm-card-body">
                <div className="adm-grid-2" style={{ marginBottom: 14 }}>
                  <div className="adm-field">
                    <label className="adm-label">Discount %</label>
                    <input className="adm-input" type="number" min={0} max={100} value={discountPercent} onChange={(e) => handleDiscountChange(Number(e.target.value))} />
                    {discountWarning && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: '#d97706' }}>
                        <AlertCircle width={12} height={12} />{discountWarning}
                      </div>
                    )}
                  </div>
                  <div className="adm-field">
                    <label className="adm-label">Payment Method</label>
                    <select className="adm-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                      <option value="cash">Cash</option>
                      <option value="upi">UPI / Google Pay</option>
                      <option value="card">Card</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="adm-field" style={{ marginBottom: 14 }}>
                  <label className="adm-label">Amount Received (₹)</label>
                  <input className="adm-input" type="number" placeholder={`Full amount: ${total}`} value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
                  {balance > 0 && parseFloat(amountPaid) > 0 && (
                    <div style={{ marginTop: 6, fontSize: 12.5, color: '#d97706', fontWeight: 600 }}>⚠ Balance remaining: {fmt(balance)}</div>
                  )}
                </div>

                {/* Order info */}
                {cart.some((i) => i.category === 'frame' || i.category === 'lens') && (
                  <div style={{ padding: '12px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, marginBottom: 14 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 8 }}>
                      <input type="checkbox" checked={hasOrder} onChange={(e) => setHasOrder(e.target.checked)} />
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0369a1' }}>Create order (lens needs processing)</span>
                    </label>
                    {hasOrder && (
                      <div className="adm-field">
                        <label className="adm-label">Expected Delivery Date</label>
                        <input className="adm-input" type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
                      </div>
                    )}
                  </div>
                )}

                <div className="adm-field">
                  <label className="adm-label">Notes</label>
                  <textarea className="adm-textarea" style={{ minHeight: 60 }} placeholder="Any notes about this sale…" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel — Cart */}
        <div>
          <div className="adm-card" style={{ position: 'sticky', top: 0 }}>
            <div className="adm-card-header">
              <ShoppingCart width={14} height={14} style={{ color: '#fc5a06' }} />
              <span className="adm-card-title">Cart ({cart.length})</span>
            </div>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: '#94a3b8', fontSize: 13 }}>
                  No items added yet.<br />Click a product to add it.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productName}</div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{item.productCode}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="adm-btn adm-btn-ghost adm-btn-sm" style={{ padding: '2px 4px', color: '#dc2626' }}>
                        <Trash2 width={12} height={12} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>-</button>
                        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>+</button>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{fmt(item.total)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary */}
            {cart.length > 0 && (
              <div style={{ padding: '14px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                {discountAmt > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#dc2626' }}>
                    <span>Discount ({discountPercent}%)</span><span>−{fmt(discountAmt)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#0f172a', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                  <span>Total</span><span>{fmt(total)}</span>
                </div>
                {paid > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#16a34a' }}>
                      <span>Paid</span><span>{fmt(paid)}</span>
                    </div>
                    {balance > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#d97706', fontWeight: 700 }}>
                        <span>Balance</span><span>{fmt(balance)}</span>
                      </div>
                    )}
                  </>
                )}

                {step === 'payment' ? (
                  <button onClick={handleComplete} disabled={saving} className="adm-btn adm-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6, height: 44 }}>
                    {saving ? 'Processing…' : <><CheckCircle width={15} height={15} /> Complete Sale</>}
                  </button>
                ) : (
                  <button onClick={() => { if (selectedCustomer) setStep('payment'); }} disabled={!selectedCustomer} className="adm-btn adm-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>
                    Continue to Payment →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function POSPage() {
  return (
    <Suspense>
      <POSContent />
    </Suspense>
  );
}
