import type { ItemCategory } from '@/app/admin/_ui/ItemForm';

/**
 * Brand suggestions for the product form. Staff can still type any brand;
 * these just keep spellings consistent. Lens brands match the ones the shop
 * shows on the website.
 */
export const COMMON_BRANDS: Record<ItemCategory, readonly string[]> = {
  frame: ['Titan Eyeplus', 'Fastrack', 'Ray-Ban', 'Vogue', 'Oakley', 'Carrera', 'Police', 'Tommy Hilfiger', 'IDEE', 'Darshana Optical'],
  sunglass: ['Ray-Ban', 'Fastrack', 'Titan', 'Oakley', 'Vogue', 'Carrera', 'Police', 'IDEE', 'Polaroid'],
  lens: ['Essilor', 'ZEISS', 'Varilux', 'Crizal', 'Kodak Lens', 'Swiss Lens', 'Hoya', 'Nikon'],
  accessory: ['Bausch + Lomb', 'Acuvue', 'Darshana Optical'],
  service: ['Darshana Optical'],
};

const tidy = (brand: string) => brand.trim().replace(/\s+/g, ' ');

/** Case-insensitive key, so "titan " and "Titan" count as one brand. */
export const brandKey = (brand: string) => tidy(brand).toLowerCase();

/**
 * Brands already used in the shop's products (first spelling wins), followed by
 * the common ones for the category that aren't used yet.
 */
export function brandSuggestions(used: readonly string[], category?: ItemCategory): string[] {
  const seen = new Map<string, string>();
  const common = category ? COMMON_BRANDS[category] : Object.values(COMMON_BRANDS).flat();
  for (const b of [...used, ...common]) {
    const clean = tidy(b ?? '');
    if (clean && !seen.has(brandKey(clean))) seen.set(brandKey(clean), clean);
  }
  return [...seen.values()];
}

/** Use the shop's existing spelling of a brand when the typed one only differs in case or spaces. */
export function matchBrand(typed: string, used: readonly string[]): string {
  const clean = tidy(typed);
  const found = used.find((b) => brandKey(b) === brandKey(clean));
  return found ? tidy(found) : clean;
}
