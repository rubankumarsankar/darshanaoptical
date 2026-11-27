// app/lib/admin/eye-tests.ts
// The one place that writes an eye test row, shared by the full admin
// (POST /api/admin/eye-tests) and the simple admin (POST /api/admin/simple/eye-tests).

import { randomUUID } from 'crypto';
import type { TxQuery } from '@/app/lib/db';
import type { SessionData } from './session-token';

export interface EyeTestValues {
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  test_date: string;
  tested_by: string;
  re_sph?: string | null;
  re_cyl?: string | null;
  re_axis?: string | null;
  re_add?: string | null;
  re_pd?: string | null;
  le_sph?: string | null;
  le_cyl?: string | null;
  le_axis?: string | null;
  le_add?: string | null;
  le_pd?: string | null;
  visual_acuity_right?: string | null;
  visual_acuity_left?: string | null;
  recommendation?: string | null;
  notes?: string | null;
}

/** Inserts the test, stamps the customer's last visit and writes the audit entry. Returns the new id. */
export async function insertEyeTest(tx: TxQuery, session: SessionData, v: EyeTestValues): Promise<string> {
  const id = randomUUID();
  await tx.query(
    `INSERT INTO eye_tests
     (id, customer_id, customer_name, customer_phone, test_date, tested_by,
      re_sph, re_cyl, re_axis, re_add, re_pd,
      le_sph, le_cyl, le_axis, le_add, le_pd,
      visual_acuity_right, visual_acuity_left, recommendation, notes)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, v.customer_id, v.customer_name, v.customer_phone, v.test_date, v.tested_by,
     v.re_sph || null, v.re_cyl || null, v.re_axis || null, v.re_add || null, v.re_pd || null,
     v.le_sph || null, v.le_cyl || null, v.le_axis || null, v.le_add || null, v.le_pd || null,
     v.visual_acuity_right || null, v.visual_acuity_left || null,
     v.recommendation || null, v.notes || null],
  );
  await tx.query('UPDATE customers SET last_visit = NOW() WHERE id = ?', [v.customer_id]);
  await tx.query(
    `INSERT INTO audit_logs (id, action, entity, entity_id, details, performed_by, performed_by_role)
   VALUES (?, 'CREATE', 'eye_test', ?, ?, ?, ?)`,
    [randomUUID(), id, `New eye test for: ${v.customer_name}`, session.name, session.role],
  );
  return id;
}
