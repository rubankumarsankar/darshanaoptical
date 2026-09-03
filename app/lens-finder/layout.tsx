import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find the Right Lens | Darshana Optical",
  description:
    "Interactive Smart Lens Finder to help you choose the ideal lens type, coatings, and protection suited for your vision and daily work routine.",
  alternates: {
    canonical: "/lens-finder",
  },
  openGraph: {
    title: "Find the Right Lens | Darshana Optical",
    description:
      "Interactive Smart Lens Finder to help you choose the ideal lens type, coatings, and protection suited for your vision and daily work routine.",
    url: "https://darshanaoptical.com/lens-finder",
  },
};

export default function LensFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
