// Renumbers every product code into one sequence per category:
//   FR-0001 frames · LN-0001 lenses · SG-0001 sunglasses · AC-0001 accessories · SV-0001 services
// Oldest product first. Also sets the counters so new items carry on from there,
// and updates the code copied onto stock history, bill lines and purchase lines.
//
//   node db/migrate_product_codes.mjs           preview only, changes nothing
//   node db/migrate_product_codes.mjs --apply   make the changes (one transaction)
//
// Safe to run again: products already numbered in order keep their codes.
import mysql from 'mysql2/promise';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const APPLY = process.argv.includes('--apply');
const PREFIX = { frame: 'FR', lens: 'LN', sunglass: 'SG', accessory: 'AC', service: 'SV' };

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const localPath = join(currentDir, '..', '.env.local');
  const envPath = existsSync(localPath) ? localPath : join(currentDir, '..', '.env');
  const raw = readFileSync(envPath, 'utf8');
  const line = raw.split(/\r?\n/).find((entry) => entry.trim().startsWith('DATABASE_URL='));
  if (!line) throw new Error('DATABASE_URL not found in environment, .env.local, or .env');
  return line.trim().slice('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
}

const connection = await mysql.createConnection({
  uri: databaseUrl(),
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
});

try {
  await connection.beginTransaction();
  const [products] = await connection.query(
    'SELECT id, product_code, name, category FROM products ORDER BY created_at, product_code FOR UPDATE'
  );

  const next = {};
  const changes = [];
  for (const p of products) {
    const prefix = PREFIX[p.category];
    if (!prefix) continue;
    next[p.category] = (next[p.category] ?? 0) + 1;
    const code = `${prefix}-${String(next[p.category]).padStart(4, '0')}`;
    if (code !== p.product_code) changes.push({ ...p, code });
  }

  console.log(`${products.length} products, ${changes.length} code(s) to change.`);
  for (const c of changes) console.log(`   ${c.product_code.padEnd(16)} → ${c.code}   ${c.name}`);
  for (const [cat, n] of Object.entries(next)) console.log(`   next ${PREFIX[cat]} code: ${PREFIX[cat]}-${String(n + 1).padStart(4, '0')}`);

  if (!APPLY) {
    await connection.rollback();
    console.log('\nPreview only. Run again with --apply to make these changes.');
  } else {
    // Two passes, so a new code never collides with an old one still in place (product_code is UNIQUE).
    for (const c of changes) await connection.query('UPDATE products SET product_code = ? WHERE id = ?', [`TMP-${c.id}`.slice(0, 50), c.id]);
    for (const c of changes) {
      await connection.query('UPDATE products SET product_code = ? WHERE id = ?', [c.code, c.id]);
      await connection.query('UPDATE stock_movements SET product_code = ? WHERE product_id = ?', [c.code, c.id]);
      await connection.query('UPDATE invoice_items SET product_code = ? WHERE product_id = ?', [c.code, c.id]);
      await connection.query('UPDATE purchase_items SET product_code = ? WHERE product_id = ?', [c.code, c.id]);
    }
    for (const [cat, n] of Object.entries(next)) {
      await connection.query(
        'INSERT INTO counters (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
        [`product-${cat}`, n]
      );
    }
    await connection.commit();
    console.log('\n✅ Product codes renumbered.');
  }
} catch (error) {
  await connection.rollback().catch(() => {});
  console.error('❌', error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
