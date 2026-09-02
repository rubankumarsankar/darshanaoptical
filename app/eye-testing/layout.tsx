import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eye Testing — Advanced Eye Examination",
  description:
    "Get a professional computerised eye test at Darshana Optical, Harur. Advanced equipment, accurate prescriptions, and expert optometrists. Book your appointment today.",
  keywords: [
    "eye testing Harur",
    "eye test Harur",
    "computerised eye test Harur",
    "optometrist Harur",
    "eye examination Tamil Nadu",
    "vision test Harur",
    "eye checkup Dharmapuri",
    "free eye test Harur",
  ],
  alternates: { canonical: "/eye-testing" },
  openGraph: {
    title: "Eye Testing — Advanced Eye Examination | Darshana Optical",
    description:
      "Professional computerised eye testing at Darshana Optical, Harur. Expert optometrists, advanced equipment, accurate prescriptions.",
    url: "https://darshanaoptical.in/eye-testing",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function EyeTestingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
