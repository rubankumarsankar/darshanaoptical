import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an Eye Test | Darshana Optical",
  description:
    "Schedule your comprehensive computerized eye testing appointment online with our expert optometrists at Darshana Optical in Harur.",
  alternates: {
    canonical: "/book-eye-test",
  },
  openGraph: {
    title: "Book an Eye Test | Darshana Optical",
    description:
      "Schedule your comprehensive computerized eye testing appointment online with our expert optometrists at Darshana Optical in Harur.",
    url: "https://darshanaoptical.com/book-eye-test",
  },
};

export default function BookEyeTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
