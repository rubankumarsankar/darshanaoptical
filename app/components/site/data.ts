// Static content for the home page. Kept as typed data so the section
// components stay purely presentational.

export const PHONE_DISPLAY = "+91 88705 71536";
export const PHONE_TEL = "tel:+918870571536";
export const WHATSAPP_URL = "https://wa.me/918870571536";
export const EMAIL = "darshanado@gmail.com";
export const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Darshana+Optical+Harur";
export const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3899.886!2d78.47462!3d12.0559335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bac65dd021a596d%3A0xf21d8bcfdefaeddb!2sDarshana%20Optical!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin";

export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { href: "/eye-testing", label: "Eye testing" },
  { href: "/frames", label: "Frames" },
  { href: "/lenses", label: "Lenses" },
  { href: "/progressive-lenses", label: "Progressive" },
  { href: "/offers", label: "Offers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export const BRANDS = ["Essilor®", "ZEISS", "Varilux®", "Crizal®", "Kodak Lens", "Swiss Lens"] as const;

export interface Service {
  title: string;
  text: string;
  icon: string;
  href: string;
}

export const SERVICES: readonly Service[] = [
  {
    title: "Eye test",
    text: "Computerised testing with a manual check for near and distance.",
    icon: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    href: "#test",
  },
  {
    title: "Quality frames",
    text: "500+ frames for men, women and kids, everyday to premium.",
    icon: "M2 14a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM14 14a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM10 14h4",
    href: "#frames",
  },
  {
    title: "One pair, all distances",
    text: "Progressive lenses so you stop switching glasses.",
    icon: "M12 3v18M5 8h14M7 16h10",
    href: "#progressive",
  },
  {
    title: "Screen glasses",
    text: "Less eye strain from long mobile and computer use.",
    icon: "M3 4h18v12H3zM8 20h8M12 16v4",
    href: "#lenses",
  },
  {
    title: "Sunglasses",
    text: "Polarised and fashion shades with UV protection.",
    icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2",
    href: "#frames",
  },
  {
    title: "Friendly fitting",
    text: "Comfortable fitting and adjustments, explained simply.",
    icon: "M20 6L9 17l-5-5",
    href: "#visit",
  },
];

export interface ChartRow {
  acuity: string;
  letters: string;
  size: number;
}

export const EYE_CHART: readonly ChartRow[] = [
  { acuity: "6/60", letters: "E", size: 54 },
  { acuity: "6/36", letters: "F P", size: 40 },
  { acuity: "6/24", letters: "T O Z", size: 31 },
  { acuity: "6/18", letters: "L P E D", size: 24 },
  { acuity: "6/12", letters: "P E C F D", size: 19 },
  { acuity: "6/9", letters: "E D F C Z P", size: 15 },
  { acuity: "6/6", letters: "F E L O P Z D", size: 12 },
];

export interface Step {
  n: string;
  title: string;
  text: string;
}

export const TEST_STEPS: readonly Step[] = [
  { n: "01", title: "Computerised check", text: "Quick digital reading of your eye power." },
  { n: "02", title: "Correct power", text: "Manual confirmation so the numbers feel right." },
  { n: "03", title: "Near & distance", text: "Checks for reading, screens and driving." },
  { n: "04", title: "Simple guidance", text: "Your options explained without jargon." },
];

// ─── Frames ──────────────────────────────────────────────────────────────────

export type FrameStyle = "Full Rim" | "Aviator" | "Square" | "Round" | "Wayfarer" | "Transparent";

/** SVG outlines drawn in a `1 5 22 14` viewBox. */
export const FRAME_PATHS: Record<FrameStyle, string> = {
  "Full Rim":
    "M2.5 9a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 10.5 9v5a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 14zM13.5 9a1.5 1.5 0 0 1 1.5-1.5h5a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-5a1.5 1.5 0 0 1-1.5-1.5zM10.5 10.5c1-.8 2-.8 3 0",
  Aviator: "M3 8.5h7c0 4.5-1.5 7-3.5 7S3 13 3 8.5zM14 8.5h7c0 4.5-1.5 7-3.5 7S14 13 14 8.5zM10 9h4M10 8.5c1-1 3-1 4 0",
  Square: "M2.5 8h8v7.5h-8zM13.5 8h8v7.5h-8zM10.5 10.5h3",
  Round: "M2.5 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0zM13.5 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0zM10.5 11c1-.8 2-.8 3 0",
  Wayfarer: "M2.5 8h8l-1 7.5h-6zM13.5 8h8l-.5 7.5h-6.5zM10.5 9.5h3",
  Transparent:
    "M3 9.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3.5a2.5 2.5 0 0 1-2.5 2.5h-3A2.5 2.5 0 0 1 3 13zM13 9.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3.5a2.5 2.5 0 0 1-2.5 2.5h-3A2.5 2.5 0 0 1 13 13zM11 10.5h2",
};

export interface Frame {
  model: string;
  style: FrameStyle;
  color: string;
  price: number;
}

export const FRAMES: readonly Frame[] = [
  { model: "DO-101", style: "Full Rim", color: "Black", price: 1499 },
  { model: "DO-205", style: "Aviator", color: "Gunmetal", price: 1899 },
  { model: "DO-301", style: "Square", color: "Tortoise", price: 2199 },
  { model: "DO-404", style: "Round", color: "Silver", price: 1699 },
  { model: "DO-505", style: "Wayfarer", color: "Brown", price: 1799 },
  { model: "DO-606", style: "Transparent", color: "Clear", price: 1299 },
];

export const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export type FaceShape = "Round" | "Square" | "Oval" | "Heart";

export interface FaceInfo {
  fits: readonly FrameStyle[];
  tip: string;
  /** border-radius that sketches the face outline on the picker button */
  outline: string;
}

export const FACES: Record<FaceShape, FaceInfo> = {
  Round: {
    fits: ["Square", "Wayfarer", "Full Rim"],
    tip: "Round faces: angular frames add structure and make soft features look sharper.",
    outline: "50%",
  },
  Square: {
    fits: ["Round", "Aviator", "Transparent"],
    tip: "Square faces: curved frames soften a strong jaw line and balance the face.",
    outline: "6px",
  },
  Oval: {
    fits: ["Aviator", "Square", "Round", "Wayfarer"],
    tip: "Oval faces: balanced proportions suit almost every style, so go with what you love.",
    outline: "50% / 40%",
  },
  Heart: {
    fits: ["Aviator", "Round", "Transparent"],
    tip: "Heart-shaped faces: light, bottom-heavy shapes balance a wider forehead.",
    outline: "50% 50% 50% 50% / 30% 30% 70% 70%",
  },
};

export type Budget = "any" | "low" | "high";

export const BUDGET_SPLIT = 1600;

export const BUDGETS: readonly { id: Budget; label: string }[] = [
  { id: "any", label: "Any budget" },
  { id: "low", label: "Under ₹1,600" },
  { id: "high", label: "₹1,600 and up" },
];

// ─── Lenses ──────────────────────────────────────────────────────────────────

export interface LensType {
  title: string;
  text: string;
  background: string;
  effect?: "tint" | "glare";
}

export const LENSES: readonly LensType[] = [
  { title: "Screen-use", text: "Eases strain from long mobile and computer hours.", background: "#E4EEFF" },
  { title: "Sun-changing", text: "Clear indoors, turns dark outdoors.", background: "#EEF0F2", effect: "tint" },
  { title: "Night driving", text: "Cuts glare from oncoming headlights.", background: "#FFF3D6", effect: "glare" },
  { title: "Thin & light", text: "Slimmer, lighter lenses for high power.", background: "#F3F2EE" },
  { title: "Progressive", text: "One pair for every distance.", background: "#FFE7D9" },
];

export interface LensZone {
  n: string;
  short: string;
  label: string;
  uses: string;
  /** Relative height of the zone's band in the lens diagram. */
  weight: number;
}

export const ZONES: readonly LensZone[] = [
  { n: "01", short: "Far", label: "Far zone", uses: "Driving, TV, outdoors", weight: 44 },
  { n: "02", short: "Mid", label: "Arm's length", uses: "Computer, vehicle meter", weight: 30 },
  { n: "03", short: "Near", label: "Near zone", uses: "Reading, mobile", weight: 26 },
];
