import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an Eye Test | Darshana Optical",
  description:
    "Schedule your comprehensive computerized eye testing appointment online with our expert optometrists at Darshana Optical in Harur.",
  alternates: {
    canonical: "/book",
  },
  openGraph: {
    title: "Book an Eye Test | Darshana Optical",
    description:
      "Schedule your comprehensive computerized eye testing appointment online with our expert optometrists at Darshana Optical in Harur.",
    url: "https://darshanaoptical.com/book",
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
