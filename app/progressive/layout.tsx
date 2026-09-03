import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progressive Lenses in Harur | Darshana Optical",
  description:
    "Explore line-free progressive lenses in Harur. Enjoy smooth, uninterrupted distance, computer, and reading vision at Darshana Optical.",
  alternates: {
    canonical: "/progressive",
  },
  openGraph: {
    title: "Progressive Lenses in Harur | Darshana Optical",
    description:
      "Explore line-free progressive lenses in Harur. Enjoy smooth, uninterrupted distance, computer, and reading vision at Darshana Optical.",
    url: "https://darshanaoptical.com/progressive",
  },
};

export default function ProgressiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
