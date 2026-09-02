import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spectacle Frames — Men, Women & Kids Eyewear",
  description:
    "Browse 1200+ premium spectacle frames at Darshana Optical, Harur. Shop full rim, half rim, rimless, aviator, cat-eye & more. Starting at ₹1299. Visit our store in Harur, Tamil Nadu.",
  keywords: [
    "spectacle frames Harur",
    "eyeglass frames Harur",
    "buy glasses Harur",
    "mens frames Tamil Nadu",
    "womens glasses Harur",
    "kids spectacles Harur",
    "rimless frames",
    "aviator glasses",
    "cat-eye frames Harur",
  ],
  alternates: { canonical: "/frames" },
  openGraph: {
    title: "Spectacle Frames — Men, Women & Kids | Darshana Optical",
    description:
      "1200+ frames for men, women & kids. Premium brands, full rim, rimless, aviators & more at Darshana Optical Harur.",
    url: "https://darshanaoptical.in/frames",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function FramesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
