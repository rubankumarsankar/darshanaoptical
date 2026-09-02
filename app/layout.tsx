import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/motion/SmoothScroll";
import { BookingProvider } from "./components/booking/BookingContext";
import BookingModal from "./components/booking/BookingModal";
import { GoogleAnalytics } from "@next/third-parties/google";
import LocalBusinessSchema from "./components/seo/LocalBusinessSchema";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const BASE_URL = "https://www.darshanaoptical.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  // ── Core ────────────────────────────────────────────────────────────
  title: {
    default: "Darshana Optical — Premium Eyewear & Eye Testing in Harur",
    template: "%s | Darshana Optical",
  },
  description:
    "Darshana Optical in Harur, Tamil Nadu offers premium eyewear, stylish frames, advanced lens solutions, and professional eye testing. Visit us for the best optical care near you.",
  keywords: [
    "Darshana Optical",
    "optical shop Harur",
    "eyewear Harur",
    "eye testing Harur",
    "spectacles Harur",
    "frames Harur Tamil Nadu",
    "lenses Harur",
    "progressive lenses",
    "optician Harur",
    "best optical shop Dharmapuri",
    "eye care Tamil Nadu",
    "prescription glasses Harur",
  ],
  authors: [{ name: "Darshana Optical", url: BASE_URL }],
  creator: "Darshana Optical",
  publisher: "Darshana Optical",

  // ── Canonical & Robots ──────────────────────────────────────────────
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },

  // ── Open Graph (Facebook / WhatsApp / LinkedIn) ──────────────────────
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Darshana Optical",
    title: "Darshana Optical — Premium Eyewear & Eye Testing in Harur",
    description:
      "Shop premium frames, lenses & book eye tests at Darshana Optical, Harur, Tamil Nadu.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Darshana Optical – Premium Eyewear Store in Harur",
      },
    ],
  },

  // ── Twitter / X ──────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "Darshana Optical — Premium Eyewear & Eye Testing in Harur",
    description:
      "Shop premium frames, lenses & book eye tests at Darshana Optical, Harur, Tamil Nadu.",
    images: ["/images/og-image.jpg"],
  },

  // ── Icons ────────────────────────────────────────────────────────────
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased scroll-smooth`}>
      <head>
        {/* Structured Data */}
        <LocalBusinessSchema />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        <BookingProvider>
          {children}
          <BookingModal />
        </BookingProvider>
      </body>
      <GoogleAnalytics gaId="G-10ZFZ1TVTY" />
    </html>
  );
}
