import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Darshana Optical Gallery | Harur",
  description:
    "Explore photos of our modern showroom, eyecare equipment, frame collections, and optical clinic in Harur.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Darshana Optical Gallery | Harur",
    description:
      "Explore photos of our modern showroom, eyecare equipment, frame collections, and optical clinic in Harur.",
    url: "https://darshanaoptical.com/gallery",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
