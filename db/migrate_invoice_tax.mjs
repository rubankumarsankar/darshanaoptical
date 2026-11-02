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

const connection = await mysql.createConnection({ uri: databaseUrl(), ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true } });
try {
  const [columns] = await connection.query("SHOW COLUMNS FROM invoices LIKE 'tax_rate'");
  if (!columns.length) await connection.query('ALTER TABLE invoices ADD COLUMN tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER discount_percent');
  const [amountColumns] = await connection.query("SHOW COLUMNS FROM invoices LIKE 'tax_amount'");
  if (!amountColumns.length) await connection.query('ALTER TABLE invoices ADD COLUMN tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER tax_rate');
  console.log('Invoice tax columns are ready.');
} finally {
  await connection.end();
}
