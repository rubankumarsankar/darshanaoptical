'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getStore, saveStore, generateId, nextInvoiceNumber } from '@/app/lib/admin/store';
import { useAuth } from '@/app/lib/admin/auth-context';
import type { Customer, Product, Invoice, InvoiceItem, PaymentMethod } from '@/app/lib/admin/types';
import {
  Zap, User, Eye, Glasses, CreditCard, CheckCircle, Printer, ArrowRight,
  Phone, Plus, Search, ChevronRight, Calendar, AlertCircle
} from 'lucide-react';

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function QuickCounterPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Step 1: Customer
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [phoneMatches, setPhoneMatches] = useState<Customer[]>([]);

  // Step 2: Eye Test
  const [includeEyeTest, setIncludeEyeTest] = useState(true);
  const [odSph, setOdSph] = useState('');
  const [odCyl, setOdCyl] = useState('');
  const [odAxis, setOdAxis] = useState('');
  const [odAdd, setOdAdd] = useState('');
  const [osSph, setOsSph] = useState('');
  const [osCyl, setOsCyl] = useState('');
  const [osAxis, setOsAxis] = useState('');
  const [osAdd, setOsAdd] = useState('');
  const [pd, setPd] = useState('');

  // Step 3: Items
  const [selectedFrame, setSelectedFrame] = useState<Product | null>(null);
  const [customFrameName, setCustomFrameName] = useState('');
  const [framePrice, setFramePrice] = useState<number>(0);

  const [selectedLens, setSelectedLens] = useState<Product | null>(null);
  const [customLensName, setCustomLensName] = useState('Anti-Glare Blue Cut Lens');
  const [lensPrice, setLensPrice] = useState<number>(1200);

  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState<number>(0);

  // Step 4: Payment
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('upi');
  const [advancePaid, setAdvancePaid] = useState<number>(500);
  const [deliveryDays, setDeliveryDays] = useState(3);
  const [notes, setNotes] = useState('');

  // Result state
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const store = getStore();
    setCustomers(store.customers);
    setProducts(store.products.filter((p) => p.status === 'active'));
  }, []);

  // Live match customer by phone
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (val.length >= 3) {
      const matches = customers.filter((c) => c.phone.includes(val) || c.name.toLowerCase().includes(val.toLowerCase()));
      setPhoneMatches(matches);
      if (matches.length === 1 && matches[0].phone === val) {
        selectExistingCustomer(matches[0]);
      }
    } else {
      setPhoneMatches([]);
    }
  };

  const selectExistingCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setPhone(c.phone);
    setName(c.name);
    setAddress(c.address || '');
    setPhoneMatches([]);

    // Check if customer has a previous eye test
    const store = getStore();
    const prevTest = store.eyeTests.filter((e) => e.customerId === c.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (prevTest) {
      setOdSph(prevTest.rightEye.sph || '');
      setOdCyl(prevTest.rightEye.cyl || '');
      setOdAxis(prevTest.rightEye.axis || '');
      setOdAdd(prevTest.rightEye.add || '');
      setOsSph(prevTest.leftEye.sph || '');
      setOsCyl(prevTest.leftEye.cyl || '');
      setOsAxis(prevTest.leftEye.axis || '');
      setOsAdd(prevTest.leftEye.add || '');
      setPd(prevTest.rightEye.pd || '');
    }
  };

  const frames = products.filter((p) => p.category === 'frame');
  const lenses = products.filter((p) => p.category === 'lens');

  // Calculation
  const totalAmount = Number(framePrice || 0) + Number(lensPrice || 0) + Number(customItemPrice || 0);
  const paidAmount = Math.min(Number(advancePaid || 0), totalAmount);
  const balanceAmount = Math.max(0, totalAmount - paidAmount);

  const handleFullPayment = () => {
    setAdvancePaid(totalAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter Customer Name');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter Customer Mobile Number');
      return;
    }
    if (totalAmount <= 0) {
      alert('Total amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    const store = getStore();

    // 1. Resolve or create customer
    let cust = selectedCustomer;
    if (!cust) {
      cust = {
        id: generateId('cust'),
        customerId: `DO-2026-${String(store.customers.length + 1).padStart(3, '0')}`,
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
      };
      store.customers.push(cust);
    } else {
      const idx = store.customers.findIndex((c) => c.id === cust!.id);
      if (idx !== -1) {
        store.customers[idx].lastVisit = new Date().toISOString();
        if (address && !store.customers[idx].address) store.customers[idx].address = address;
      }
    }

    // 2. Record Eye Test if included
    let eyeTestId: string | undefined = undefined;
    if (includeEyeTest && (odSph || osSph || odCyl || osCyl)) {
      const newTest = {
        id: generateId('et'),
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        date: new Date().toISOString().slice(0, 10),
        testedBy: user?.name ?? 'Counter Staff',
        rightEye: { sph: odSph, cyl: odCyl, axis: odAxis, add: odAdd, pd },
        leftEye: { sph: osSph, cyl: osCyl, axis: osAxis, add: osAdd, pd },
        createdAt: new Date().toISOString(),
      };
      store.eyeTests.push(newTest);
      eyeTestId = newTest.id;
    }

    // 3. Build Invoice Items
    const items: InvoiceItem[] = [];
    if (framePrice > 0) {
      items.push({
        id: generateId('ii'),
        productId: selectedFrame?.id || generateId('p'),
        productName: selectedFrame ? selectedFrame.name : (customFrameName || 'Spectacle Frame'),
        productCode: selectedFrame?.productCode || 'FRM-MANUAL',
        category: 'frame',
        quantity: 1,
        unitPrice: framePrice,
        discount: 0,
        total: framePrice,
      });
      // Deduct stock if from catalog
      if (selectedFrame) {
        const pIdx = store.products.findIndex((p) => p.id === selectedFrame.id);
        if (pIdx !== -1 && store.products[pIdx].stock > 0) store.products[pIdx].stock -= 1;
      }
    }

    if (lensPrice > 0) {
      items.push({
        id: generateId('ii'),
        productId: selectedLens?.id || generateId('p'),
        productName: selectedLens ? selectedLens.name : (customLensName || 'Optical Lenses Pair'),
        productCode: selectedLens?.productCode || 'LNS-MANUAL',
        category: 'lens',
        quantity: 1,
        unitPrice: lensPrice,
        discount: 0,
        total: lensPrice,
      });
    }

    if (customItemPrice > 0) {
      items.push({
        id: generateId('ii'),
        productId: generateId('p'),
        productCode: 'SRV-001',
        productName: customItemItemSafe(customItemName),
        category: 'service',
        quantity: 1,
        unitPrice: customItemPrice,
        discount: 0,
        total: customItemPrice,
      });
    }

    function customItemItemSafe(s: string) {
      return s.trim() || 'Accessories / Service';
    }

    // 4. Expected Delivery Date
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + deliveryDays);

    // 5. Create Invoice
    const invoiceId = generateId('inv');
    const invNumber = nextInvoiceNumber();
    const invoiceStatus = balanceAmount === 0 ? 'paid' : (paidAmount > 0 ? 'partially_paid' : 'pending');

    const paymentList = paidAmount > 0 ? [{
      id: generateId('pmt'),
      amount: paidAmount,
      method: paymentMode,
      date: new Date().toISOString(),
      notes: paidAmount === totalAmount ? 'Full settlement at counter' : 'Advance received at counter',
      receivedBy: user?.name ?? 'Counter Staff',
    }] : [];

    const newInvoice: Invoice = {
      id: invoiceId,
      invoiceNumber: invNumber,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      items,
      subtotal: totalAmount,
      discountAmount: 0,
      discountPercent: 0,
      total: totalAmount,
      paid: paidAmount,
      balance: balanceAmount,
      status: invoiceStatus,
      payments: paymentList,
      notes: notes.trim() || undefined,
      eyeTestId,
      frameProduct: selectedFrame ? selectedFrame.name : customFrameName,
      lensProduct: selectedLens ? selectedLens.name : customLensName,
      orderStatus: 'lens_ordered',
      expectedDate: expDate.toISOString().slice(0, 10),
      createdBy: user?.name ?? 'Counter Staff',
      createdAt: new Date().toISOString(),
    };

    // Record stock movements for sales
    for (const item of items) {
      if (item.category === 'service') continue;
      store.stockMovements.unshift({
        id: generateId('sm'),
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        type: 'sale',
        quantity: -item.quantity,
        reference: invNumber,
        createdBy: user?.name ?? 'Counter Staff',
        createdAt: new Date().toISOString(),
      });
    }

    store.invoices.unshift(newInvoice);

    saveStore(store);
    setCompletedInvoice(newInvoice);
    setSubmitting(false);
  };

  // If completed, show success screen with Print / WhatsApp
  if (completedInvoice) {
    return (
      <div style={{ maxWidth: 640, margin: '20px auto' }}>
        <div className="adm-card" style={{ padding: '36px 32px', textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle width={36} height={36} />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            Bill Created Successfully!
          </h1>
          <div style={{ fontSize: 15, color: '#64748b', marginBottom: 24 }}>
            Invoice <strong style={{ color: '#fc5a06' }}>{completedInvoice.invoiceNumber}</strong> · {completedInvoice.customerName}
          </div>

          {/* Quick Receipt Summary */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#64748b' }}>Total Bill:</span>
              <strong style={{ color: '#0f172a', fontSize: 16 }}>{fmt(completedInvoice.total)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#64748b' }}>Advance Paid ({completedInvoice.payments[0]?.method?.toUpperCase() || 'CASH'}):</span>
              <strong style={{ color: '#16a34a' }}>{fmt(completedInvoice.paid)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: 8 }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Balance to Collect:</span>
              <strong style={{ color: completedInvoice.balance > 0 ? '#dc2626' : '#16a34a', fontSize: 16 }}>
                {completedInvoice.balance > 0 ? fmt(completedInvoice.balance) : 'Nil (Full Paid)'}
              </strong>
            </div>
            {completedInvoice.expectedDate && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: '#eff6ff', borderRadius: 8, color: '#1d4ed8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar width={14} height={14} /> Expected Delivery: {new Date(completedInvoice.expectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.print()}
              className="adm-btn adm-btn-secondary"
              style={{ minWidth: 140, height: 44, fontSize: 14 }}
            >
              <Printer width={16} height={16} /> Print Receipt
            </button>
            <Link
              href={`/admin/invoices/${completedInvoice.id}`}
              className="adm-btn adm-btn-primary"
              style={{ minWidth: 140, height: 44, fontSize: 14 }}
            >
              View Full Invoice
            </Link>
            <button
              onClick={() => {
                setCompletedInvoice(null);
                setPhone('');
                setName('');
                setAddress('');
                setSelectedCustomer(null);
                setFramePrice(0);
                setCustomFrameName('');
                setLensPrice(1200);
                setAdvancePaid(500);
              }}
              className="adm-btn adm-btn-ghost"
              style={{ minWidth: 140, height: 44, fontSize: 14, color: '#fc5a06' }}
            >
              ⚡ Next Customer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fc5a06', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap width={18} height={18} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Express Walk-in Counter
            </h1>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 40px' }}>
            Complete Customer + Prescription + Bill in 1 simple screen (under 1 minute)
          </p>
        </div>
        <Link href="/admin/dashboard" className="adm-btn adm-btn-ghost adm-btn-sm">
          Back to Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        {/* STEP 1: CUSTOMER */}
        <div className="adm-card" style={{ marginBottom: 16 }}>
          <div className="adm-card-header" style={{ background: '#f8fafc' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fc5a06', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>1</span>
            <span className="adm-card-title">Customer Information</span>
            {selectedCustomer && (
              <span className="adm-badge adm-badge-success">Existing Customer Found</span>
            )}
          </div>
          <div className="adm-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ position: 'relative' }}>
                <label className="adm-label">Mobile Number *</label>
                <div style={{ position: 'relative' }}>
                  <Phone width={15} height={15} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
                  <input
                    type="tel"
                    className="adm-input"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    required
                    style={{ paddingLeft: 36, fontWeight: 600, fontSize: 15 }}
                  />
                </div>

                {/* Autocomplete dropdown for existing customers */}
                {phoneMatches.length > 0 && !selectedCustomer && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', borderRadius: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 40, marginTop: 4, maxHeight: 180, overflowY: 'auto' }}>
                    {phoneMatches.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => selectExistingCustomer(m)}
                        style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f8fafc'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'white'; }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>{m.name}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{m.phone}</div>
                        </div>
                        <span style={{ fontSize: 11, color: '#fc5a06', fontWeight: 600 }}>Select ↵</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="adm-label">Customer Name *</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="e.g. S. Murugan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ fontWeight: 600 }}
                />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label className="adm-label">Address / Village (Optional)</label>
              <input
                type="text"
                className="adm-input"
                placeholder="e.g. Main Road, Harur"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* STEP 2: EYE TEST / PRESCRIPTION */}
        <div className="adm-card" style={{ marginBottom: 16 }}>
          <div className="adm-card-header" style={{ background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>2</span>
              <span className="adm-card-title">Eye Prescription (OD / OS)</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#475569', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={includeEyeTest}
                onChange={(e) => setIncludeEyeTest(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#2563eb' }}
              />
              Include Prescription in this bill
            </label>
          </div>

          {includeEyeTest && (
            <div className="adm-card-body">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'center' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', borderRadius: '6px 0 0 6px' }}>Eye</th>
                      <th style={{ padding: '8px' }}>Spherical (SPH)</th>
                      <th style={{ padding: '8px' }}>Cylindrical (CYL)</th>
                      <th style={{ padding: '8px' }}>Axis</th>
                      <th style={{ padding: '8px', borderRadius: '0 6px 6px 0' }}>Addition (ADD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563eb' }}>Right (OD)</td>
                      <td style={{ padding: '6px' }}><input className="adm-input" style={{ textAlign: 'center' }} placeholder="-1.50" value={odSph} onChange={(e) => setOdSph(e.target.value)} /></td>
                      <td style={{ padding: '6px' }}><input className="adm-input" style={{ textAlign: 'center' }} placeholder="-0.50" value={odCyl} onChange={(e) => setOdCyl(e.target.value)} /></td>
                      <td style={{ padding: '6px' }}><input className="adm-input" style={{ textAlign: 'center' }} placeholder="90" value={odAxis} onChange={(e) => setOdAxis(e.target.value)} /></td>
                      <td style={{ padding: '6px' }}><input className="adm-input" style={{ textAlign: 'center' }} placeholder="+2.00" value={odAdd} onChange={(e) => setOdAdd(e.target.value)} /></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#16a34a' }}>Left (OS)</td>
                      <td style={{ padding: '6px' }}><input className="adm-input" style={{ textAlign: 'center' }} placeholder="-1.25" value={osSph} onChange={(e) => setOsSph(e.target.value)} /></td>
                      <td style={{ padding: '6px' }}><input className="adm-input" style={{ textAlign: 'center' }} placeholder="-0.50" value={osCyl} onChange={(e) => setOsCyl(e.target.value)} /></td>
                      <td style={{ padding: '6px' }}><input className="adm-input" style={{ textAlign: 'center' }} placeholder="90" value={osAxis} onChange={(e) => setOsAxis(e.target.value)} /></td>
                      <td style={{ padding: '6px' }}><input className="adm-input" style={{ textAlign: 'center' }} placeholder="+2.00" value={osAdd} onChange={(e) => setOsAdd(e.target.value)} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* STEP 3: FRAME & LENS */}
        <div className="adm-card" style={{ marginBottom: 16 }}>
          <div className="adm-card-header" style={{ background: '#f8fafc' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#16a34a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>3</span>
            <span className="adm-card-title">Select Frame & Lens</span>
          </div>
          <div className="adm-card-body">
            {/* Frame Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="adm-label">Spectacle Frame</label>
                <select
                  className="adm-select"
                  value={selectedFrame?.id || ''}
                  onChange={(e) => {
                    const found = frames.find((f) => f.id === e.target.value);
                    if (found) {
                      setSelectedFrame(found);
                      setFramePrice(found.sellingPrice);
                      setCustomFrameName(found.name);
                    } else {
                      setSelectedFrame(null);
                    }
                  }}
                >
                  <option value="">-- Choose Frame or Enter Below --</option>
                  {frames.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.brand} - {f.name} ({fmt(f.sellingPrice)}) · Stock: {f.stock}
                    </option>
                  ))}
                </select>
                {!selectedFrame && (
                  <input
                    type="text"
                    className="adm-input"
                    style={{ marginTop: 6 }}
                    placeholder="Or type manual frame name (e.g. Fastrack Metal Rectangular)"
                    value={customFrameName}
                    onChange={(e) => setCustomFrameName(e.target.value)}
                  />
                )}
              </div>
              <div>
                <label className="adm-label">Frame Price (₹)</label>
                <input
                  type="number"
                  className="adm-input"
                  placeholder="0"
                  value={framePrice || ''}
                  onChange={(e) => setFramePrice(Number(e.target.value))}
                  style={{ fontWeight: 700, fontSize: 15 }}
                />
              </div>
            </div>

            {/* Lens Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="adm-label">Lenses (Type / Coating)</label>
                <select
                  className="adm-select"
                  value={selectedLens?.id || ''}
                  onChange={(e) => {
                    const found = lenses.find((l) => l.id === e.target.value);
                    if (found) {
                      setSelectedLens(found);
                      setLensPrice(found.sellingPrice);
                      setCustomLensName(found.name);
                    } else {
                      setSelectedLens(null);
                    }
                  }}
                >
                  <option value="">-- Quick Lens Options --</option>
                  {lenses.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({fmt(l.sellingPrice)})
                    </option>
                  ))}
                </select>
                {!selectedLens && (
                  <input
                    type="text"
                    className="adm-input"
                    style={{ marginTop: 6 }}
                    placeholder="Or type manual lens description (e.g. Blue Cut Anti-Reflective)"
                    value={customLensName}
                    onChange={(e) => setCustomLensName(e.target.value)}
                  />
                )}
              </div>
              <div>
                <label className="adm-label">Lens Price (₹)</label>
                <input
                  type="number"
                  className="adm-input"
                  placeholder="0"
                  value={lensPrice || ''}
                  onChange={(e) => setLensPrice(Number(e.target.value))}
                  style={{ fontWeight: 700, fontSize: 15 }}
                />
              </div>
            </div>

            {/* Other / Accessories Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
              <div>
                <label className="adm-label">Extra Accessories / Service (Optional)</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="e.g. Lens cleaning spray + microfiber pouch"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                />
              </div>
              <div>
                <label className="adm-label">Extra Price (₹)</label>
                <input
                  type="number"
                  className="adm-input"
                  placeholder="0"
                  value={customItemPrice || ''}
                  onChange={(e) => setCustomItemPrice(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4: TOTAL & ADVANCE PAYMENT */}
        <div className="adm-card" style={{ marginBottom: 24, border: '2px solid #fc5a06' }}>
          <div className="adm-card-header" style={{ background: '#fff7ed' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fc5a06', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>4</span>
            <span className="adm-card-title" style={{ color: '#9a3412' }}>Total & Advance Payment</span>
            <div style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 800, color: '#fc5a06' }}>
              Total: {fmt(totalAmount)}
            </div>
          </div>
          <div className="adm-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
              <div>
                <label className="adm-label">Payment Mode</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {(['upi', 'cash', 'card', 'bank'] as PaymentMethod[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPaymentMode(mode)}
                      className="adm-btn"
                      style={{
                        padding: '10px 4px',
                        background: paymentMode === mode ? '#0f172a' : '#f1f5f9',
                        color: paymentMode === mode ? 'white' : '#475569',
                        fontSize: 12.5,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        borderRadius: 8,
                        border: 'none',
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="adm-label" style={{ margin: 0 }}>Advance Received (₹) *</label>
                  <button
                    type="button"
                    onClick={handleFullPayment}
                    style={{ background: 'none', border: 'none', color: '#fc5a06', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Full Payment (₹{totalAmount})
                  </button>
                </div>
                <input
                  type="number"
                  className="adm-input"
                  placeholder="0"
                  value={advancePaid || ''}
                  onChange={(e) => setAdvancePaid(Number(e.target.value))}
                  style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}
                />
              </div>
            </div>

            {/* Summary Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Total Bill</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{fmt(totalAmount)}</div>
              </div>
              <div style={{ color: '#cbd5e1' }}>−</div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Advance Paid</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a' }}>{fmt(paidAmount)}</div>
              </div>
              <div style={{ color: '#cbd5e1' }}>=</div>
              <div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Remaining Balance</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: balanceAmount > 0 ? '#dc2626' : '#16a34a' }}>
                  {balanceAmount > 0 ? fmt(balanceAmount) : 'Paid in Full'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
              <div>
                <label className="adm-label">Delivery In (Days)</label>
                <select
                  className="adm-select"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Number(e.target.value))}
                >
                  <option value={1}>1 Day (Tomorrow)</option>
                  <option value={2}>2 Days</option>
                  <option value={3}>3 Days (Standard)</option>
                  <option value={5}>5 Days</option>
                  <option value={7}>7 Days (Special Lens)</option>
                </select>
              </div>

              <div>
                <label className="adm-label">Special Fitting Notes (Optional)</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="e.g. Progressive fitting with high segment height"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="adm-btn adm-btn-primary"
          style={{
            width: '100%',
            height: 52,
            fontSize: 17,
            fontWeight: 800,
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(252, 90, 6, 0.4)',
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Creating Bill…' : `⚡ Save & Generate Bill (${fmt(totalAmount)})`}
        </button>
      </form>
    </div>
  );
}
