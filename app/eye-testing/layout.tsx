import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eye Testing in Harur | Darshana Optical",
  description:
    "Professional 6-step computerized eye testing in Harur with advanced autorefractometer, phoropter, and precision vision care at Darshana Optical.",
  alternates: {
    canonical: "/eye-testing",
  },
  openGraph: {
    title: "Eye Testing in Harur | Darshana Optical",
    description:
      "Professional 6-step computerized eye testing in Harur with advanced autorefractometer, phoropter, and precision vision care at Darshana Optical.",
    url: "https://darshanaoptical.com/eye-testing",
  },
};

export default function EyeTestingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
