import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progressive Lenses — No-Line Bifocal Specialists",
  description:
    "Get premium progressive (no-line bifocal) lenses at Darshana Optical, Harur. Perfect vision at all distances. Expert fitting by trained optometrists. Visit us today.",
  keywords: [
    "progressive lenses Harur",
    "no-line bifocal Harur",
    "varifocal lenses Tamil Nadu",
    "progressive glasses Harur",
    "multifocal lenses Harur",
    "progressive lens fitting",
  ],
  alternates: { canonical: "/progressive" },
  openGraph: {
    title: "Progressive Lenses — No-Line Bifocal | Darshana Optical",
    description:
      "Premium progressive lenses for all-distance vision at Darshana Optical, Harur. Expert fitting by trained optometrists.",
    url: "https://www.darshanaoptical.com/progressive",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function ProgressiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
