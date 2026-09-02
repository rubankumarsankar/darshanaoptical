import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prescription Lenses — Anti-Glare, Blue Cut & Progressive",
  description:
    "Premium prescription lenses at Darshana Optical, Harur. Anti-reflection, blue cut, photochromic, UV protection & progressive lenses. Expert fitting included.",
  keywords: [
    "prescription lenses Harur",
    "anti glare lenses Harur",
    "blue cut lenses Harur",
    "progressive lenses Harur",
    "photochromic lenses Tamil Nadu",
    "UV protection lenses",
    "lens replacement Harur",
    "bifocal lenses Harur",
  ],
  alternates: { canonical: "/lenses" },
  openGraph: {
    title: "Prescription Lenses — Anti-Glare, Blue Cut & Progressive | Darshana Optical",
    description:
      "Premium anti-glare, blue cut, photochromic & progressive lenses at Darshana Optical Harur. Expert fitting included.",
    url: "https://www.darshanaoptical.com/lenses",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function LensesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
