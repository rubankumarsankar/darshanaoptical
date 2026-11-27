import { DM_Sans, Outfit } from 'next/font/google';

export const outfit = Outfit({ variable: '--font-outfit', subsets: ['latin'], weight: ['500', '600', '700', '800'], display: 'swap' });
export const dmSans = DM_Sans({ variable: '--font-dm-sans', subsets: ['latin'], axes: ['opsz'], display: 'swap' });

export const fontVars = `${outfit.variable} ${dmSans.variable}`;
