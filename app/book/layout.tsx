import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Eye Test Appointment — Harur",
  description:
    "Book your eye test appointment at Darshana Optical, Harur. Quick online booking, professional eye exam, and same-day prescription. Call +91 88705 71536.",
  keywords: [
    "book eye test Harur",
    "eye test appointment Harur",
    "optometrist appointment Harur",
    "schedule eye exam Tamil Nadu",
    "vision checkup Harur",
  ],
  alternates: { canonical: "/book" },
  openGraph: {
    title: "Book Eye Test Appointment | Darshana Optical Harur",
    description:
      "Schedule your professional eye test at Darshana Optical, Harur. Expert optometrists, advanced equipment, same-day prescription.",
    url: "https://darshanaoptical.in/book",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
