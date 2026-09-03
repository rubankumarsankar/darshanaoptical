import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eyeglass Lenses | Darshana Optical Harur",
  description:
    "Premium eyeglass lenses in Harur. Blue cut digital protection, anti-reflective coatings, photochromic, and high-index lenses at Darshana Optical.",
  alternates: {
    canonical: "/lenses",
  },
  openGraph: {
    title: "Eyeglass Lenses | Darshana Optical Harur",
    description:
      "Premium eyeglass lenses in Harur. Blue cut digital protection, anti-reflective coatings, photochromic, and high-index lenses at Darshana Optical.",
    url: "https://darshanaoptical.com/lenses",
  },
};

export default function LensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
