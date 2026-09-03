import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/motion/SmoothScroll";
import { BookingProvider } from "./components/booking/BookingContext";
import BookingModal from "./components/booking/BookingModal";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://darshanaoptical.com"),
  title: {
    default: "Darshana Optical Harur | Eye Testing, Frames & Lenses",
    template: "%s | Darshana Optical",
  },
  description:
    "Visit Darshana Optical in Harur for eye testing, prescription glasses, stylish frames, progressive lenses and sunglasses. Call 088705 71536.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Darshana Optical Harur | Eye Testing, Frames & Lenses",
    description:
      "Visit Darshana Optical in Harur for eye testing, prescription glasses, stylish frames, progressive lenses and sunglasses.",
    url: "https://darshanaoptical.com/",
    siteName: "Darshana Optical",
    images: [
      {
        url: "/images/og-darshana-optical.jpg",
        width: 1200,
        height: 630,
        alt: "Darshana Optical Store in Harur",
      },
    ],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Darshana Optical Harur | Eye Testing, Frames & Lenses",
    description:
      "Visit Darshana Optical in Harur for eye testing, prescription glasses, stylish frames, progressive lenses and sunglasses.",
    images: ["/images/og-darshana-optical.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Optician",
  "@id": "https://darshanaoptical.com/#business",
  name: "Darshana Optical",
  url: "https://darshanaoptical.com/",
  logo: "https://darshanaoptical.com/logo.png",
  image: "https://darshanaoptical.com/images/og-darshana-optical.jpg",
  telephone: "+918870571536",
  email: "darshanado@gmail.com",
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Tvk nagar, salem bypass road, Vasanth & co opposite",
    addressLocality: "Harur",
    addressRegion: "Tamil Nadu",
    postalCode: "636903",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 12.0621,
    longitude: 78.4908,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:30",
      closes: "20:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "10:00",
      closes: "14:00",
    },
  ],
  hasMap: "https://maps.google.com/?q=Darshana+Optical+Harur",
  sameAs: [
    "https://instagram.com",
    "https://facebook.com",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        <BookingProvider>
          {children}
          <BookingModal />
        </BookingProvider>
      </body>
    </html>
  );
}
