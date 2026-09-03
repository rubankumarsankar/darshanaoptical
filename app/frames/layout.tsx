import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eyeglass Frames in Harur | Darshana Optical",
  description:
    "Explore our collection of lightweight, durable, and stylish spectacle frames for men, women, and kids at Darshana Optical in Harur.",
  alternates: {
    canonical: "/frames",
  },
  openGraph: {
    title: "Eyeglass Frames in Harur | Darshana Optical",
    description:
      "Explore our collection of lightweight, durable, and stylish spectacle frames for men, women, and kids at Darshana Optical in Harur.",
    url: "https://darshanaoptical.com/frames",
  },
};

export default function FramesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
