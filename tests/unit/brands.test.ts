import { describe, expect, it } from 'vitest';
import { brandKey, brandSuggestions, matchBrand } from '@/app/lib/admin/brands';

describe('brand helpers', () => {
  it('treats case and extra spaces as the same brand', () => {
    expect(brandKey('  Titan   Eyeplus ')).toBe(brandKey('titan eyeplus'));
  });

  it('reuses the shop spelling when only case or spaces differ', () => {
    expect(matchBrand('  ray-ban ', ['Ray-Ban', 'ZEISS'])).toBe('Ray-Ban');
    expect(matchBrand('New  Brand', ['Ray-Ban'])).toBe('New Brand');
  });

  it('lists used brands first, once each, then common ones for the category', () => {
    const list = brandSuggestions(['zeiss', 'ZEISS ', 'Local Lens'], 'lens');
    expect(list.slice(0, 2)).toEqual(['zeiss', 'Local Lens']);
    expect(list.filter((b) => brandKey(b) === 'zeiss')).toHaveLength(1);
    expect(list).toContain('Essilor');
    expect(list).not.toContain('Fastrack');
  });
});
