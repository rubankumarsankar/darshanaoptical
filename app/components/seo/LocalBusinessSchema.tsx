export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Optician",
    name: "Darshana Optical",
    image: "https://darshanaoptical.in/logo.png",
    url: "https://darshanaoptical.in",
    telephone: "+91-8870571536",
    description:
      "Darshana Optical in Harur offers premium eyewear, stylish frames, advanced lens solutions, and professional eye testing services.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "TVK Nagar, Salem Bypass Road, Vasanth & Co Opposite",
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
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
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
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Eyewear & Eye Care Services",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Eye Testing" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Prescription Glasses" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Spectacle Frames" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Progressive Lenses" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Contact Lenses" } },
      ],
    },
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Card",
    areaServed: ["Harur", "Dharmapuri", "Tamil Nadu"],
    sameAs: [
      // Add social media URLs here e.g.
      // "https://www.facebook.com/darshanaoptical",
      // "https://www.instagram.com/darshanaoptical",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
