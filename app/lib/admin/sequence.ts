// app/lib/admin/sequence.ts
// Gap-free document numbering.
//
// Invoice and purchase numbers used to be derived from `SELECT COUNT(*)` taken
// outside the transaction. Two tills ringing up a sale at the same moment read
// the same count and produced the same invoice number, and cancelling or
// deleting a row shifted every subsequent number. This keeps a dedicated
// counter row and takes a row lock inside the caller's transaction, so numbers
// are unique and monotonic.

import type { TxQuery } from '@/app/lib/db';

export type SequenceName = 'invoice' | 'purchase' | 'customer' | `product-${ProductCategory}`;

type ProductCategory = 'frame' | 'lens' | 'sunglass' | 'accessory' | 'service';

/** Product code prefix per category: FR-0001, LN-0001, SG-0001, AC-0001, SV-0001. */
export const PRODUCT_CODE_PREFIX: Record<ProductCategory, string> = {
  frame: 'FR', lens: 'LN', sunglass: 'SG', accessory: 'AC', service: 'SV',
};

export const formatProductCode = (category: ProductCategory, n: number) =>
  `${PRODUCT_CODE_PREFIX[category]}-${String(n).padStart(4, '0')}`;

/**
 * Next free product code for a category, e.g. FR-0007. Skips any number a
 * hand-typed code already uses. MUST be called inside `withTransaction`.
 */
export async function nextProductCode(tx: TxQuery, category: ProductCategory): Promise<string> {
  for (;;) {
    const code = formatProductCode(category, await nextSequence(tx, `product-${category}`));
    const [taken] = (await tx.query('SELECT id FROM products WHERE product_code = ?', [code])) as any[];
    if (!taken) return code;
  }
}

/**
 * Reserves and returns the next value for `name`.
 *
 * MUST be called inside `withTransaction` — the `FOR UPDATE` lock is only held
 * until the surrounding transaction commits, which is what serialises callers.
 */
export async function nextSequence(tx: TxQuery, name: SequenceName): Promise<number> {
  // Ensure the row exists before locking it; FOR UPDATE cannot lock a missing row.
  await tx.query('INSERT INTO counters (name, value) VALUES (?, 0) ON DUPLICATE KEY UPDATE name = name', [name]);
  const [row] = (await tx.query('SELECT value FROM counters WHERE name = ? FOR UPDATE', [name])) as any[];
  const next = Number(row?.value ?? 0) + 1;
  await tx.query('UPDATE counters SET value = ? WHERE name = ?', [next, name]);
  return next;
}
