import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const [settings] = await query('SELECT * FROM shop_settings WHERE id=1') as any[];
  return NextResponse.json({ settings: settings ?? {} });
}

export async function PUT(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;
  const [existing] = await query('SELECT * FROM shop_settings WHERE id=1') as any[];
  const b = await request.json();
  const s = { ...(existing || {}), ...b };

  await query(
    `UPDATE shop_settings SET
       shop_name=?,tagline=?,phone=?,whatsapp=?,email=?,address=?,city=?,state=?,pincode=?,gst=?,
       invoice_prefix=?,customer_id_prefix=?,low_stock_threshold=?,tax_enabled=?,tax_rate=?,
       invoice_footer=?,invoice_terms=?,max_discount_admin=?,max_discount_manager=?,max_discount_staff=?
     WHERE id=1`,
    [s.shop_name, s.tagline||null, s.phone, s.whatsapp||null, s.email, s.address, s.city, s.state, s.pincode, s.gst||null,
     s.invoice_prefix, s.customer_id_prefix, s.low_stock_threshold??5, s.tax_enabled?1:0, s.tax_rate??0,
     s.invoice_footer||null, s.invoice_terms||null, s.max_discount_admin??100, s.max_discount_manager??15, s.max_discount_staff??5]
  );
  const [updated] = await query('SELECT * FROM shop_settings WHERE id=1') as any[];
  return NextResponse.json({ settings: updated });
}
