import { NextResponse } from 'next/server';
import { query, withTransaction, withDb } from '@/app/lib/db';
import { requireRole, requireSession } from '@/app/lib/admin/session';
import { validate, productUpdateSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

async function GETHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;
  const [row] = await query('SELECT * FROM products WHERE id = ?', [id]) as any[];
  if (!row) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const movements = await query(
    'SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT 50', [id]
  );
  return NextResponse.json({ product: row, movements });
}

// Editing a product changes prices and stock levels — management only.
async function PUTHandler(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole('admin', 'manager');
  if (error) return error;
  const { id } = await params;
  const [existing] = await query('SELECT * FROM products WHERE id = ?', [id]) as any[];
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const parsed = validate(productUpdateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;
  // Merge only validated keys over the stored row.
  const p = { ...existing, ...b };
  if (b.mrp === null) p.mrp = p.selling_price;
  const adjust = b.stock_adjustment ?? 0;
  // Check before writing anything, so a bad adjustment can't leave a half-saved edit.
  if (adjust !== 0 && Number(existing.stock) + adjust < 0) {
    return NextResponse.json(
      { error: `Adjustment would take stock below zero (current ${existing.stock}).` },
      { status: 400 }
    );
  }

  await withTransaction(async (tx) => {
    await tx.query(
      `UPDATE products SET name=?,brand=?,model=?,category=?,color=?,size=?,material=?,
         purchase_price=?,selling_price=?,mrp=?,low_stock_threshold=?,image_url=?,description=?,status=?,updated_at=NOW()
       WHERE id=?`,
      [p.name, p.brand, p.model||null, p.category, p.color||null, p.size||null, p.material||null,
       p.purchase_price??0, p.selling_price??0, p.mrp??p.selling_price??0, p.low_stock_threshold??5,
       p.image_url||null, p.description||null, p.status??'active', id]
    );
    // Manual stock adjustment. The movement row records the product's real name and
    // code from the stored row — the request body need not carry them.
    if (adjust !== 0) {
      await tx.query('UPDATE products SET stock = stock + ? WHERE id = ?', [adjust, id]);
      await tx.query(
        `INSERT INTO stock_movements (id,product_id,product_name,product_code,type,quantity,reason,created_by)
         VALUES (?,?,?,?,'adjustment',?,?,?)`,
        [randomUUID(), id, p.name, existing.product_code, adjust, b.adjustment_reason||'Manual adjustment', session.name]
      );
    }
    await tx.query(
      `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
      [randomUUID(), 'UPDATE', 'product', id, `Updated product: ${p.name}`, session.name, session.role]
    );
  });
  const [updated] = await query('SELECT * FROM products WHERE id = ?', [id]) as any[];
  return NextResponse.json({ product: updated });
}

async function DELETEHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  const { id } = await params;
  const [p] = await query('SELECT name FROM products WHERE id = ?', [id]) as any[];
  if (!p) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  await query("UPDATE products SET status='inactive' WHERE id=?", [id]); // soft delete
  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(), 'DELETE', 'product', id, `Deactivated product: ${p.name}`, session.name, session.role]
  );
  return NextResponse.json({ success: true });
}

export const GET = withDb(GETHandler);
export const PUT = withDb(PUTHandler);
export const DELETE = withDb(DELETEHandler);
