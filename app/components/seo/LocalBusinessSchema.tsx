import type { ShopContact } from "@/app/lib/shop-contact";

export default function LocalBusinessSchema({ contact }: { contact: ShopContact }) {
  const telephone = contact.tel.replace("tel:", "");
  const schema = {
    "@context": "https://schema.org",
    "@type": "Optician",
    "@id": "https://darshanaoptical.com/#business",
    name: contact.name,
    alternateName: [
      "Darshana Opticals",
      "Darshana Optical Harur",
      "Darshana Opticals Harur",
      "Darshana Opticals Optical Store"
    ],
    image: "https://darshanaoptical.com/images/og-darshana-optical.jpg",
    logo: "https://darshanaoptical.com/logo.png",
    url: "https://darshanaoptical.com/",
    telephone,
    email: contact.email,
    priceRange: "₹₹",
    description:
      "Optical shop in Harur offering computerised eye tests, prescription glasses, spectacle frames, progressive lenses and sunglasses.",
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.street,
      addressLocality: contact.city,
      addressRegion: contact.state,
      postalCode: contact.pincode,
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
    hasMap: "https://maps.app.goo.gl/JCxKCYiuk4wPpQrh9",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Card",
    availableLanguage: ["English", "Tamil"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone,
      contactType: "customer service",
      availableLanguage: ["English", "Tamil"],
    },
    areaServed: ["Harur", "Dharmapuri", "Tamil Nadu"],
    sameAs: [
      "https://www.instagram.com/darshanaoptical3108/",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
