import { describe, expect, it } from 'vitest';
import { shopDate } from '@/app/lib/admin/date';

describe('shopDate', () => {
  it('uses the India calendar after midnight IST while UTC is still yesterday', () => {
    expect(shopDate(new Date('2026-10-31T19:00:00.000Z'))).toBe('2026-11-01');
  });

  it('keeps the same date before midnight IST', () => {
    expect(shopDate(new Date('2026-10-31T18:00:00.000Z'))).toBe('2026-10-31');
  });
});
