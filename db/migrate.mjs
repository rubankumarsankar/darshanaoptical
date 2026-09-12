// db/migrate.mjs — Run this ONCE to create all tables and seed admin user
// Usage: node db/migrate.mjs

import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { createHmac } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createInterface } from 'readline';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load env manually (no dotenv needed) ─────────────────────
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) process.env[key] = val;
    }
  } catch {
    console.warn('⚠  Could not read .env.local — using process environment');
  }
}

// ─── Simple password hash (SHA-256 based) ─────────────────────
// For production, upgrade to bcrypt. For this internal admin it's sufficient.
function hashPassword(password) {
  return createHmac('sha256', process.env.SESSION_SECRET ?? 'darshana-secret')
    .update(password)
    .digest('hex');
}

// ─── Seed data ────────────────────────────────────────────────
const SEED_USERS = [
  {
    id: 'usr-001',
    name: 'Darshana Raj',
    email: 'admin@darshana.com',
    password: 'admin@2026',
    role: 'admin',
    phone: '8870571536',
  },
  {
    id: 'usr-002',
    name: 'Arun Kumar',
    email: 'manager@darshana.com',
    password: 'manager@2026',
    role: 'manager',
    phone: '',
  },
  {
    id: 'usr-003',
    name: 'Kumar Muthu',
    email: 'staff@darshana.com',
    password: 'staff@2026',
    role: 'staff',
    phone: '',
  },
];

async function main() {
  loadEnv();

  const db = process.env.DATABASE_URL;
  if (!db) throw new Error('DATABASE_URL not set in .env.local');

  console.log('📡 Connecting to TiDB…');
  const conn = await mysql.createConnection({ uri: db, ssl: { minVersion: 'TLSv1.2' } });

  // ─── Run schema ───────────────────────────────────────────
  console.log('🗄  Running schema.sql…');
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

  // Split on semicolons (skip empty statements)
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await conn.execute(stmt);
  }
  console.log(`✅ Schema applied (${statements.length} statements)`);

  // ─── Seed users ───────────────────────────────────────────
  console.log('👤 Seeding admin users…');
  for (const u of SEED_USERS) {
    const hash = hashPassword(u.password);
    await conn.execute(
      `INSERT IGNORE INTO users (id, name, email, password_hash, role, phone, status, joined_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [u.id, u.name, u.email, hash, u.role, u.phone]
    );
    console.log(`   ✓ ${u.role}: ${u.email} / ${u.password}`);
  }

  await conn.end();
  console.log('\n🎉 Migration complete! Login credentials printed above.');
  console.log('   Change passwords after first login via Admin → Staff.\n');
}

main().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
