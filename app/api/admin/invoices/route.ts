import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/app/lib/db';
import { requireSession, type Role } from '@/app/lib/admin/session';
import { validate, invoiceCreateSchema } from '@/app/lib/admin/validation';
import { nextSequence } from '@/app/lib/admin/sequence';
import { randomUUID } from 'crypto';

function maxDiscountFor(role: Role, settings: any): number {
  const raw = role === 'admin' ? settings?.max_discount_admin ?? 100
    : role === 'manager' ? settings?.max_discount_manager ?? 15
    : settings?.max_discount_staff ?? 5;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
}

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'all';
  const q = searchParams.get('q') ?? '';
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  let sql = 'SELECT * FROM invoices WHERE 1=1';
  const params: any[] = [];
  if (status !== 'all') { sql += ' AND status = ?'; params.push(status); }
  if (from) { sql += ' AND DATE(created_at) >= ?'; params.push(from); }
  if (to) { sql += ' AND DATE(created_at) <= ?'; params.push(to); }
  if (q) {
    sql += ' AND (invoice_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY created_at DESC LIMIT 500';
  return NextResponse.json({ invoices: await query(sql, params) });
}

export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;
  const parsed = validate(invoiceCreateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;
  const { customer_id, customer_name, customer_phone, eye_test_id, items, discount_percent,
    payment_method, amount_paid, notes, has_order, expected_date, frame_product, lens_product } = b;
  const id = randomUUID();
  let invoice_number = '';

  try {
    await withTransaction(async (tx) => {
      // Product IDs are the only trusted item input. Browser-supplied names,
      // prices, categories and codes are deliberately ignored.
      const resolved: any[] = [];
      const reservedStock = new Map<string, number>();
      for (const item of items) {
        const [product] = await tx.query(
          'SELECT id, product_code, name, category, selling_price, stock, status FROM products WHERE id=? FOR UPDATE',
          [item.product_id]
        ) as any[];
        if (!product || product.status !== 'active') throw new Error(`Product is unavailable: ${item.product_id}`);
        const unitPrice = money(Number(product.selling_price));
        const gross = money(unitPrice * item.quantity);
        const itemDiscount = money(Number(item.discount ?? 0));
        if (itemDiscount > gross) throw new Error(`Item discount cannot exceed the price of ${product.name}.`);
        const alreadyReserved = reservedStock.get(product.id) ?? 0;
        if (product.category !== 'service' && Number(product.stock) - alreadyReserved < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name} (have ${product.stock}, need ${alreadyReserved + item.quantity})`);
        }
        reservedStock.set(product.id, alreadyReserved + item.quantity);
        resolved.push({ product, quantity: item.quantity, unitPrice, gross, itemDiscount, total: money(gross - itemDiscount) });
      }

      const [settings] = await tx.query(
        'SELECT invoice_prefix,tax_enabled,tax_rate,max_discount_admin,max_discount_manager,max_discount_staff FROM shop_settings WHERE id=1'
      ) as any[];
      const gross = money(resolved.reduce((sum, item) => sum + item.gross, 0));
      const subtotal = money(resolved.reduce((sum, item) => sum + item.total, 0));
      const invoiceDiscount = money(b.discount_amount !== undefined ? b.discount_amount : subtotal * ((discount_percent ?? 0) / 100));
      if (invoiceDiscount > subtotal) throw new Error('Discount cannot be greater than the subtotal.');
      const allDiscounts = money(resolved.reduce((sum, item) => sum + item.itemDiscount, 0) + invoiceDiscount);
      const effectivePercent = gross > 0 ? (allDiscounts / gross) * 100 : 0;
      const cap = maxDiscountFor(session.role, settings);
      if (effectivePercent > cap + 0.001) {
        const failure: any = new Error(`Discount of ${effectivePercent.toFixed(1)}% exceeds the ${cap}% limit for your role.`);
        failure.statusCode = 403;
        throw failure;
      }

      // GST is tax-exclusive: calculated after discounts and stored per invoice.
      const taxRate = settings?.tax_enabled ? Number(settings.tax_rate ?? 0) : 0;
      const taxableAmount = money(subtotal - invoiceDiscount);
      const taxAmount = money(taxableAmount * taxRate / 100);
      const total = money(taxableAmount + taxAmount);
      const paid = money(Number(amount_paid ?? b.advance_paid ?? 0));
      if (paid > total) throw new Error(`Amount paid cannot exceed the invoice total of Rs.${total.toFixed(2)}.`);
      const balance = money(total - paid);
      const status = paid >= total ? 'paid' : paid > 0 ? 'partially_paid' : 'pending';
      const prefix = String(settings?.invoice_prefix || 'DO').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'DO';
      invoice_number = `${prefix}-${new Date().getFullYear()}-${String(await nextSequence(tx, 'invoice')).padStart(5, '0')}`;

      await tx.query(
        `INSERT INTO invoices (id,invoice_number,customer_id,customer_name,customer_phone,eye_test_id,
          subtotal,discount_amount,discount_percent,tax_rate,tax_amount,total,paid,balance,status,
          order_status,frame_product,lens_product,expected_date,created_by,notes)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, invoice_number, customer_id, customer_name, customer_phone, eye_test_id || null,
          subtotal, invoiceDiscount, discount_percent ?? 0, taxRate, taxAmount, total, paid, balance, status,
          has_order ? 'new' : null, frame_product || null, lens_product || null, expected_date || null, session.name, notes || null]
      );

      for (const item of resolved) {
        await tx.query(
          `INSERT INTO invoice_items (id,invoice_id,product_id,product_name,product_code,category,quantity,unit_price,discount,total)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [randomUUID(), id, item.product.id, item.product.name, item.product.product_code, item.product.category,
            item.quantity, item.unitPrice, item.itemDiscount, item.total]
        );
        if (item.product.category !== 'service') {
          await tx.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product.id]);
          await tx.query(
            `INSERT INTO stock_movements (id,product_id,product_name,product_code,type,quantity,reason,reference,created_by)
             VALUES (?,?,?,?,'sale',?,?,?,?)`,
            [randomUUID(), item.product.id, item.product.name, item.product.product_code, -item.quantity,
              `Sold via invoice ${invoice_number}`, invoice_number, session.name]
          );
        }
      }
      if (paid > 0) await tx.query(
        'INSERT INTO payments (id,invoice_id,amount,method,payment_date,received_by) VALUES (?,?,?,?,NOW(),?)',
        [randomUUID(), id, paid, payment_method ?? 'cash', session.name]
      );
      await tx.query('UPDATE customers SET last_visit = NOW() WHERE id = ?', [customer_id]);
      await tx.query(
        'INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)',
        [randomUUID(), 'CREATE', 'invoice', id, `Created invoice ${invoice_number} for ${customer_name} - Rs.${total}`, session.name, session.role]
      );
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to create invoice.' }, { status: err.statusCode ?? 400 });
  }
  const [invoice] = await query('SELECT * FROM invoices WHERE id = ?', [id]) as any[];
  const invoiceItems = await query('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
  return NextResponse.json({ invoice, items: invoiceItems, invoice_number }, { status: 201 });
}
