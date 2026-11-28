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

describe('shopDayUtcRange', () => {
  it('covers the India shop day in UTC', async () => {
    const { shopDayUtcRange } = await import('@/app/lib/admin/date');
    expect(shopDayUtcRange('2026-11-28')).toEqual(['2026-11-27 18:30:00', '2026-11-28 18:30:00']);
    expect(shopDayUtcRange('2026-03-01')).toEqual(['2026-02-28 18:30:00', '2026-03-01 18:30:00']);
  });
});
