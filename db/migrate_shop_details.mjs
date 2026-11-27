// Adds shop opening hours and a logo to shop_settings, for Settings › Shop details.
// Safe to run repeatedly.
import mysql from 'mysql2/promise';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const currentDir = dirname(fileURLToPath(import.meta.url));

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

async function addColumn(name, type) {
  try {
    await connection.query(`ALTER TABLE shop_settings ADD COLUMN ${name} ${type} NULL`);
    console.log(`   added shop_settings.${name}`);
  } catch (error) {
    if (error.message?.includes('Duplicate column')) console.log(`   shop_settings.${name} already exists`);
    else throw error;
  }
}

try {
  await addColumn('opening_hours', 'VARCHAR(255)');
  await addColumn('logo_url', 'VARCHAR(2000)');
  // Start with the hours the website already shows.
  await connection.query(
    "UPDATE shop_settings SET opening_hours = 'Monday to Sunday, 9:30 AM – 9:00 PM' WHERE id = 1 AND (opening_hours IS NULL OR TRIM(opening_hours) = '')"
  );
  console.log('Shop details migration complete.');
} catch (error) {
  console.error('Shop details migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
