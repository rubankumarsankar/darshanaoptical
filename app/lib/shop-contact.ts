// The shop's public contact details, as set in Admin › Settings › Shop details.
// The website, emails and structured data all read them from here.

export interface ShopContact {
  name: string;
  /** For display, e.g. "+91 88705 71536". */
  phone: string;
  /** tel: link. */
  tel: string;
  /** wa.me link without a message. */
  whatsappUrl: string;
  /** Digits only with country code, e.g. "918870571536". */
  whatsappNumber: string;
  email: string;
  /** Street line, e.g. "Tvk Nagar, Salem Bypass Road, opposite Vasanth & Co". */
  street: string;
  city: string;
  state: string;
  pincode: string;
  /** One line: street, city pincode. */
  address: string;
  hours: string;
  mapsUrl: string;
}


const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '');

/** Indian numbers: keep the last 10 digits and add 91. */
function withCountryCode(raw: unknown): string {
  const d = digits(raw);
  if (d.length >= 12 && d.startsWith('91')) return d.slice(-12);
  if (d.length >= 10) return `91${d.slice(-10)}`;
  return '';
}

const pretty = (cc: string) => (cc.length === 12 ? `+91 ${cc.slice(2, 7)} ${cc.slice(7)}` : '');
const clean = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

/** Builds the contact from a shop_settings row; empty fields fall back to the shop's known details. */
export function build(row: Record<string, unknown>): ShopContact {
  const phoneCc = withCountryCode(row.phone) || '918870571536';
  const waCc = withCountryCode(row.whatsapp) || phoneCc;
  const name = clean(row.shop_name) || 'Darshana Optical';
  const city = clean(row.city) || 'Harur';
  const pincode = clean(row.pincode) || '636903';
  // The street line may already end with the city or PIN code; don't repeat them.
  const street = (clean(row.address) || 'Tvk Nagar, Salem Bypass Road, opposite Vasanth & Co')
    .replace(new RegExp(`[,\\s–-]*${pincode}\\s*$`), '')
    .replace(new RegExp(`[,\\s–-]*${city}\\s*$`, 'i'), '')
    .trim();
  return {
    name,
    phone: pretty(phoneCc),
    tel: `tel:+${phoneCc}`,
    whatsappNumber: waCc,
    whatsappUrl: `https://wa.me/${waCc}`,
    email: clean(row.email) || 'darshanaoptical31@gmail.com',
    street,
    city,
    state: clean(row.state) || 'Tamil Nadu',
    pincode,
    address: `${street}, ${city} ${pincode}`,
    hours: clean(row.opening_hours) || 'Monday to Sunday, 9:30 AM – 9:00 PM',
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`,
  };
}

/** wa.me link with a ready-typed message. */
export const whatsappWith = (c: ShopContact, text: string) => `${c.whatsappUrl}?text=${encodeURIComponent(text)}`;

/** The known details, used until Settings load or if they cannot. */
export const DEFAULT_CONTACT: ShopContact = build({});
