// Adds configurable internal notification recipients. Safe to run repeatedly.
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

async function addColumn(name) {
  try {
    await connection.query(`ALTER TABLE shop_settings ADD COLUMN ${name} VARCHAR(2000) NULL`);
    console.log(`   added shop_settings.${name}`);
  } catch (error) {
    if (error.message?.includes('Duplicate column')) console.log(`   shop_settings.${name} already exists`);
    else throw error;
  }
}

try {
  await addColumn('notification_to');
  await addColumn('notification_cc');
  await addColumn('notification_bcc');
  await connection.query(
    "UPDATE shop_settings SET notification_to = email WHERE id = 1 AND (notification_to IS NULL OR TRIM(notification_to) = '')"
  );
  console.log('Email notification settings migration complete.');
} catch (error) {
  console.error('Email settings migration failed:', error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
