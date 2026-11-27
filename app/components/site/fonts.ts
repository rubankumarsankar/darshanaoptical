import { DM_Sans, Outfit } from "next/font/google";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

/** Class names that define --font-outfit and --font-dm-sans for the site design. */
export const siteFontVars = `${outfit.variable} ${dmSans.variable}`;
