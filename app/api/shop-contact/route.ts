import { NextResponse } from 'next/server';
import { withDb } from '@/app/lib/db';
import { getShopContact } from '@/app/lib/shop-contact.server';

// GET /api/shop-contact — the public contact details from Admin › Settings.
// Only what the website already shows publicly; cached at the edge for a minute
// so a Settings change reaches every page quickly without a database hit per visit.
async function GETHandler() {
  const contact = await getShopContact();
  return NextResponse.json(contact, {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=600' },
  });
}

export const GET = withDb(GETHandler);
