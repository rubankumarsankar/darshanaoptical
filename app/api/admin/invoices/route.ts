import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { validate, invoiceCreateSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

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
  if (to)   { sql += ' AND DATE(created_at) <= ?'; params.push(to); }
  if (q) {
    sql += ' AND (invoice_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY created_at DESC LIMIT 500';
  const rows = await query(sql, params);
  return NextResponse.json({ invoices: rows });
}

export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;
  const parsed = validate(invoiceCreateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;
  const {
    customer_id, customer_name, customer_phone, eye_test_id,
    items, discount_percent, payment_method, amount_paid,
    notes, has_order, expected_date, frame_product, lens_product,
  } = b;

  // Calculate totals
  const subtotal = items.reduce((s: number, i: any) => s + (i.unit_price * (i.quantity ?? i.qty ?? 1) - (i.discount ?? 0)), 0);
  const discount_amount = b.discount_amount !== undefined ? b.discount_amount : subtotal * ((discount_percent ?? 0) / 100);
  const total = Math.round((subtotal - discount_amount) * 100) / 100;
  const initialPaid = amount_paid ?? b.advance_paid ?? 0;
  const paid = Math.min(initialPaid, total);
  const balance = Math.round((total - paid) * 100) / 100;
  const status =
    paid >= total ? 'paid' :
    paid > 0      ? 'partially_paid' : 'pending';

  // Generate invoice number
  const [cnt] = await query('SELECT COUNT(*) as c FROM invoices') as any[];
  const year = new Date().getFullYear();
  const invoice_number = `DO-${year}-${String(cnt.c + 121).padStart(5, '0')}`;

  const id = randomUUID();

  try {
    await withTransaction(async (tx) => {
      await tx.query(
        `INSERT INTO invoices
           (id,invoice_number,customer_id,customer_name,customer_phone,eye_test_id,
            subtotal,discount_amount,discount_percent,total,paid,balance,status,
            order_status,frame_product,lens_product,expected_date,created_by,notes)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, invoice_number, customer_id, customer_name, customer_phone,
         eye_test_id||null, subtotal, discount_amount, discount_percent??0,
         total, paid, balance, status,
         has_order ? 'new' : null, frame_product||null, lens_product||null,
         expected_date||null, session.name, notes||null]
      );

      // Insert invoice items + decrement stock
      for (const item of items) {
        const itemId = randomUUID();
        const itemTotal = item.unit_price * item.quantity - (item.discount ?? 0);
        await tx.query(
          `INSERT INTO invoice_items (id,invoice_id,product_id,product_name,product_code,category,quantity,unit_price,discount,total)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [itemId, id, item.product_id, item.product_name, item.product_code,
           item.category, item.quantity, item.unit_price, item.discount??0, itemTotal]
        );
        if (item.category !== 'service') {
          // Lock the product row so concurrent sales can't both pass the stock check and oversell.
          const [product] = await tx.query('SELECT stock, name FROM products WHERE id = ? FOR UPDATE', [item.product_id]) as any[];
          if (!product) throw new Error(`Product not found: ${item.product_name}`);
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.product_name} (have ${product.stock}, need ${item.quantity})`);
          }
          await tx.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
          await tx.query(
            `INSERT INTO stock_movements (id,product_id,product_name,product_code,type,quantity,reason,reference,created_by)
             VALUES (?,?,?,?,'sale',?,?,?,?)`,
            [randomUUID(), item.product_id, item.product_name, item.product_code,
             -item.quantity, `Sold via invoice ${invoice_number}`, invoice_number, session.name]
          );
        }
      }

      // Record payment if any
      if (paid > 0) {
        await tx.query(
          `INSERT INTO payments (id,invoice_id,amount,method,payment_date,received_by) VALUES (?,?,?,?,NOW(),?)`,
          [randomUUID(), id, paid, payment_method??'cash', session.name]
        );
      }

      // Update customer last_visit
      await tx.query('UPDATE customers SET last_visit = NOW() WHERE id = ?', [customer_id]);

      await tx.query(
        `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
        [randomUUID(), 'CREATE', 'invoice', id,
         `Created invoice ${invoice_number} for ${customer_name} — ₹${total}`, session.name, session.role]
      );
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to create invoice.' }, { status: 400 });
  }

  const [newInv] = await query('SELECT * FROM invoices WHERE id = ?', [id]) as any[];
  const invItems = await query('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
  return NextResponse.json({ invoice: newInv, items: invItems, invoice_number }, { status: 201 });
}
