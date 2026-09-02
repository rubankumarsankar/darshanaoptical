import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Visit Darshana Optical Harur",
  description:
    "Visit Darshana Optical at TVK Nagar, Salem Bypass Road, Harur – 636903. Call +91 88705 71536 or WhatsApp us. Open Mon–Sat 9:30 AM–8:30 PM.",
  keywords: [
    "Darshana Optical contact",
    "optical shop near me Harur",
    "Darshana Optical address",
    "Harur optical store",
    "spectacles shop Harur phone",
    "eye care Harur location",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Darshana Optical — Harur, Tamil Nadu",
    description:
      "Visit us at TVK Nagar, Salem Bypass Road, Harur. Call +91 88705 71536. Open Mon–Sat 9:30 AM to 8:30 PM.",
    url: "https://darshanaoptical.in/contact",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
