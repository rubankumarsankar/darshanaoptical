import Link from "next/link";
import {
  Glasses,
  Share2,
  Camera,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const COLUMNS = [
  {
    title: "Explore",
    links: ["Eye Testing", "Frames", "Lenses", "Progressive Lenses", "Offers"],
  },
  {
    title: "Quick Links",
    links: ["Book Eye Test", "Gallery", "About Us", "Contact Us", "Store Location"],
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-surface-dark text-neutral-300">
      <div className="container-brand grid grid-cols-1 gap-12 pt-16 pb-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12 lg:pt-[72px]">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center">
            <img
              src="/logo.png"
              alt="Darshana Optical Logo"
              className="h-10 sm:h-12 w-auto object-contain brightness-0 invert"
            />
          </div>
          <p className="mb-6 max-w-xs text-sm leading-6 text-neutral-400">
            Quality eye care, stylish eyewear. Better vision for a better
            life.
          </p>
          <div className="flex items-center gap-3">
            {[Share2, Camera].map((Icon, i) => (
              <span
                key={i}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-dark text-neutral-300 transition-colors duration-fast hover:border-brand-orange hover:text-brand-orange"
              >
                <Icon size={16} strokeWidth={2} />
              </span>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-5 text-sm font-semibold text-white">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-neutral-400 transition-colors duration-fast hover:text-brand-orange"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="mb-5 text-sm font-semibold text-white">Contact Us</h4>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex items-start gap-2">
              <MapPin size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-brand-orange" />
              Main Road, Tiruppattur, Tamil Nadu - 635601
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} strokeWidth={2} className="shrink-0 text-brand-orange" />
              +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} strokeWidth={2} className="shrink-0 text-brand-orange" />
              info@darshanaoptical.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border-dark">
        <div className="container-brand flex flex-col items-center justify-between gap-3 py-6 text-xs text-neutral-500 sm:flex-row">
          <span>© 2026 Darshana Optical. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-brand-orange">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-brand-orange">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
