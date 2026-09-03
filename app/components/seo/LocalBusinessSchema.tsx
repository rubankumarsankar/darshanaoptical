export default function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Optician",
    "@id": "https://darshanaoptical.com/#business",
    name: "Darshana Optical",
    image: "https://darshanaoptical.com/images/og-darshana-optical.jpg",
    logo: "https://darshanaoptical.com/logo.png",
    url: "https://darshanaoptical.com/",
    telephone: "+918870571536",
    email: "darshanado@gmail.com",
    priceRange: "₹₹",
    description:
      "Darshana Optical in Harur offers computerized eye testing, prescription glasses, stylish frames, progressive lenses, and sunglasses.",
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
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Card",
    areaServed: ["Harur", "Dharmapuri", "Tamil Nadu"],
    sameAs: [
      "https://instagram.com",
      "https://facebook.com",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
