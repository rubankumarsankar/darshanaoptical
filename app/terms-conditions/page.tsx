import type { Metadata } from "next";
import LegalPage from "../components/site/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions | Darshana Optical",
  description: "Terms and conditions for services and purchases at Darshana Optical in Harur, Tamil Nadu.",
  alternates: {
    canonical: "/terms-conditions",
  },
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using this website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use this website.",
  },
  {
    title: "2. Use of This Website",
    body: "This website is provided to help you explore our eyewear collection, lens options, and eye testing services, and to make it easy to get in touch with our store. You agree to use it only for lawful purposes and not to misuse any form, tool, or interactive feature on this site.",
  },
  {
    title: "3. Product & Pricing Information",
    body: "Frame styles, lens options, and prices shown on this website are indicative and provided for general reference. Availability, exact pricing, and final fitting are confirmed in person at our store, as stock and offers may change without prior notice.",
  },
  {
    title: "4. Appointments & Bookings",
    body: "Appointment requests submitted through our Booking form or WhatsApp are requests only, not guaranteed confirmations. Our team will reach out to confirm your preferred date and time, which may be adjusted based on availability.",
  },
  {
    title: "5. Smart Finder Tools",
    body: "The Smart Frame Finder and Smart Lens Finder provide general style and lens suggestions based on the answers you provide. They are meant as a starting point for conversation in-store and do not replace a professional eye test or personalised fitting advice from our optometrist.",
  },
  {
    title: "6. Intellectual Property",
    body: "All content on this website — including text, images, logos, and design — is the property of Darshana Optical unless otherwise stated, and may not be reproduced or used elsewhere without our permission.",
  },
  {
    title: "7. Third-Party Links & Services",
    body: "This website links to third-party services such as WhatsApp, Google Maps, and our social media profiles. We are not responsible for the content, availability, or practices of these external services.",
  },
  {
    title: "8. Limitation of Liability",
    body: "We make reasonable efforts to keep the information on this website accurate and up to date, but we do not guarantee that it is error-free at all times. Darshana Optical is not liable for any indirect loss arising from your use of this website.",
  },
  {
    title: "9. Governing Law",
    body: "These Terms & Conditions are governed by the laws of India, and any disputes will be subject to the jurisdiction of the courts having authority over Harur, Tamil Nadu.",
  },
  {
    title: "10. Changes to These Terms",
    body: "We may revise these Terms & Conditions from time to time. Continued use of this website after changes are posted means you accept the updated terms.",
  },
  {
    title: "11. Contact Us",
    body: "For any questions about these Terms & Conditions, please reach out through our Contact page — we're happy to help.",
  },
];

export default function TermsPage() {
  return <LegalPage crumb="Terms & conditions" title="Terms & conditions" updated="January 2026" sections={SECTIONS} />;
}
