import { NextResponse } from 'next/server';
import { query, withTransaction, withDb } from '@/app/lib/db';
import { requireRole, requireSession } from '@/app/lib/admin/session';
import { randomUUID } from 'crypto';
import { productCreateSchema, validate } from '@/app/lib/admin/validation';
import { nextProductCode } from '@/app/lib/admin/sequence';

async function GETHandler(request: Request) {
  // Any signed-in user may browse the catalogue — the POS needs it.
  const { error } = await requireSession();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') ?? 'all';
  const status = searchParams.get('status') ?? 'all';
  const q = searchParams.get('q') ?? '';

  let sql = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];
  if (category !== 'all') { sql += ' AND category = ?'; params.push(category); }
  if (status !== 'all') { sql += ' AND status = ?'; params.push(status); }
  if (q) {
    sql += ' AND (name LIKE ? OR brand LIKE ? OR product_code LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY category, brand, name LIMIT 1000';
  const rows = await query(sql, params);
  return NextResponse.json({ products: rows });
}

// Creating stock sets purchase and selling prices — management only.
async function POSTHandler(request: Request) {
  const { session, error } = await requireRole('admin', 'manager');
  if (error) return error;
  const parsed = validate(productCreateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;
  const cat = b.category;

  const id = randomUUID();
  if (b.product_code) {
    const [taken] = await query('SELECT id FROM products WHERE product_code = ?', [b.product_code]) as any[];
    if (taken) return NextResponse.json({ error: `Product code ${b.product_code} is already used. Leave it empty to get one automatically.` }, { status: 409 });
  }
  let code = b.product_code ?? '';
  const purchase_price = b.purchase_price;
  const selling_price = b.selling_price;
  const stock = b.stock;
  const low_stock_threshold = b.low_stock_threshold;

  await withTransaction(async (tx) => {
    // Next number in this category's sequence (FR-0001, FR-0002…), locked so two tills never share one.
    if (!code) code = await nextProductCode(tx, cat);
    await tx.query(
      `INSERT INTO products (id,product_code,name,brand,model,category,color,size,material,
       purchase_price,selling_price,mrp,stock,low_stock_threshold,image_url,description,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active')`,
      [id, code, b.name, b.brand, b.model || null, cat, b.color || null, b.size || null,
       b.material || null, purchase_price, selling_price, b.mrp ?? selling_price,
       stock, low_stock_threshold, b.image_url || null, b.description || null]
    );
    await tx.query(
      `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
      [randomUUID(), 'CREATE', 'product', id, `Added product: ${b.name}`, session.name, session.role]
    );
  });
  const [row] = await query('SELECT * FROM products WHERE id = ?', [id]) as any[];
  return NextResponse.json({ product: row }, { status: 201 });
}

export const GET = withDb(GETHandler);
export const POST = withDb(POSTHandler);
