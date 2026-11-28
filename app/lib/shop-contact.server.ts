import { query } from '@/app/lib/db';
import { build, DEFAULT_CONTACT, type ShopContact } from '@/app/lib/shop-contact';

/** Reads the contact details from Settings; falls back to the known details if the database is unreachable (e.g. at build time). */
export async function getShopContact(): Promise<ShopContact> {
  try {
    const rows = (await query(
      'SELECT shop_name, phone, whatsapp, email, address, city, state, pincode, opening_hours FROM shop_settings WHERE id = 1 LIMIT 1',
    )) as Record<string, unknown>[];
    return rows[0] ? build(rows[0]) : DEFAULT_CONTACT;
  } catch {
    return DEFAULT_CONTACT;
  }
}
