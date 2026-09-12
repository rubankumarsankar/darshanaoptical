import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { validate, purchaseCreateSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const supplierId = searchParams.get('supplierId');

  let sql = 'SELECT * FROM purchases WHERE 1=1';
  const params: any[] = [];
  if (supplierId) { sql += ' AND supplier_id = ?'; params.push(supplierId); }
  sql += ' ORDER BY created_at DESC LIMIT 300';
  const purchases = await query(sql, params) as any[];

  // Attach items
  for (const p of purchases) {
    p.items = await query('SELECT * FROM purchase_items WHERE purchase_id = ?', [p.id]);
  }
  return NextResponse.json({ purchases });
}

export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;
  const parsed = validate(purchaseCreateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;
  const total = b.items.reduce((s: number, i: any) => {
    const qty = i.quantity ?? i.qty ?? 1;
    const price = i.purchase_price ?? i.unit_cost ?? 0;
    return s + price * qty;
  }, 0);
  const paid = b.amount_paid ?? b.paid ?? 0;
  const balance = total - paid;
  const status = balance <= 0 ? 'paid' : paid > 0 ? 'partially_paid' : 'pending';

  const [cnt] = await query('SELECT COUNT(*) as c FROM purchases') as any[];
  const year = new Date().getFullYear();
  const purchase_number = `PO-${year}-${String((cnt?.c ?? 0) + 1).padStart(3, '0')}`;
  const id = randomUUID();

  await withTransaction(async (tx) => {
    await tx.query(
      `INSERT INTO purchases (id,purchase_number,supplier_id,supplier_name,supplier_bill_number,total,paid,balance,status,created_by,notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [id, purchase_number, b.supplier_id, b.supplier_name, b.supplier_bill_number||null,
       total, paid, balance, status, session.name, b.notes||null]
    );

    for (const item of b.items) {
      const productId = item.product_id || randomUUID();
      const productName = item.product_name || item.description || 'Optical Goods';
      const productCode = item.product_code || 'PO-ITEM';
      const qty = item.quantity;
      const price = item.purchase_price ?? item.unit_cost ?? 0;
      const itemTotal = price * qty;

      await tx.query(
        `INSERT INTO purchase_items (id,purchase_id,product_id,product_name,product_code,quantity,purchase_price,total)
         VALUES (?,?,?,?,?,?,?,?)`,
        [randomUUID(), id, productId, productName, productCode, qty, price, itemTotal]
      );

      if (item.product_id) {
        // Increase stock
        await tx.query('UPDATE products SET stock = stock + ?, purchase_price = ?, updated_at = NOW() WHERE id = ?',
          [qty, price, item.product_id]);
        await tx.query(
          `INSERT INTO stock_movements (id,product_id,product_name,product_code,type,quantity,reason,reference,created_by)
           VALUES (?,?,?,?,'purchase',?,?,?,?)`,
          [randomUUID(), item.product_id, productName, productCode,
           qty, `Purchased via ${purchase_number}`, purchase_number, session.name]
        );
      }
    }

    // Update supplier balance
    if (balance > 0) {
      await tx.query('UPDATE suppliers SET balance = balance + ? WHERE id = ?', [balance, b.supplier_id]);
    }

    await tx.query(
      `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
      [randomUUID(),'CREATE','purchase',id,`Purchase ${purchase_number} from ${b.supplier_name} — ₹${total}`,session.name,session.role]
    );
  });
  const [row] = await query('SELECT * FROM purchases WHERE id = ?', [id]) as any[];
  return NextResponse.json({ purchase: row, purchase_number }, { status: 201 });
}
