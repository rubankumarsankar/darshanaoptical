import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eyeglass Frames in Harur | Darshana Optical",
  description:
    "Explore our collection of lightweight, durable, and stylish spectacle frames for men, women, and kids at Darshana Optical in Harur. Visit us on Salem Bypass Road.",
  keywords: [
    "Darshana Optical",
    "Darshana Opticals",
    "Darshana Opticals Harur",
    "Darshana Opticals frames",
    "Darshana Optical glasses",
    "spectacle frames Harur",
    "eyeglass frames Harur",
    "buy glasses Harur",
    "mens frames Tamil Nadu",
    "womens glasses Harur",
    "kids spectacles Harur",
    "rimless frames",
    "aviator glasses",
    "cat-eye frames Harur",
    "opticals in Harur",
  ],
  alternates: { canonical: "/frames" },
  openGraph: {
    title: "Eyeglass Frames in Harur | Darshana Optical",
    description:
      "1200+ spectacle frames for men, women & kids. Full rim, half rim, rimless, aviators & more at Darshana Optical Harur.",
    url: "https://darshanaoptical.com/frames",
    images: [{ url: "/images/og-darshana-optical.jpg", width: 1200, height: 630 }],
  },
};

export default function FramesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
