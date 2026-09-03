import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Darshana Optical | Harur",
  description:
    "Get in touch with Darshana Optical in Harur. Call 088705 71536, visit our store opposite Vasanth & Co on Salem Bypass Road, or message us on WhatsApp.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Darshana Optical | Harur",
    description:
      "Get in touch with Darshana Optical in Harur. Call 088705 71536, visit our store opposite Vasanth & Co on Salem Bypass Road, or message us on WhatsApp.",
    url: "https://darshanaoptical.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
