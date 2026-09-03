"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from "framer-motion";
import { CalendarCheck, ChevronDown, Sparkles, Eye, Layers, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import TopBar from "./TopBar";
import Button from "../ui/Button";
import ScrollProgress from "../motion/ScrollProgress";
import { useBooking } from "../booking/BookingContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/eye-testing", label: "Eye Testing" },
  { href: "/frames", label: "Frames" },
  { href: "/lenses", label: "Lenses" },
  { href: "/offers", label: "Offers" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [lensesDropdownOpen, setLensesDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const { openBooking } = useBooking();

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  }

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled((prev) => {
      if (!prev && latest > 72) return true;
      if (prev && latest < 40) return false;
      return prev;
    });
  });

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mobileMenuOpen]);

  const isLensesActive =
    pathname === "/lenses" || pathname === "/progressive" || pathname === "/progressive-lenses" || pathname === "/lens-finder";

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-default [overflow-anchor:none] ${
        scrolled
          ? "border-border-default bg-white/90 shadow-sm backdrop-blur-md"
          : "border-transparent bg-white"
      }`}
    >
      <motion.div
        animate={{ height: scrolled ? 0 : 32 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="hidden overflow-hidden md:block"
      >
        <TopBar />
      </motion.div>

      <div className="container-brand relative flex items-center justify-between">
        <motion.div
          animate={{ height: scrolled ? 60 : 72 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full items-center justify-between"
        >
          <Link href="/" className="flex items-center">
            <motion.img
              initial={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              src="/logo.png"
              alt="Darshana Optical Logo"
              width={180}
              height={48}
              decoding="async"
              className="h-10 sm:h-12 w-auto object-contain transition-all duration-300"
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {/* Home */}
            <Link
              href="/"
              className={`group relative py-1 text-sm font-medium transition-colors duration-fast hover:text-brand-orange ${
                pathname === "/" ? "text-brand-orange font-bold" : "text-neutral-700"
              }`}
            >
              Home
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 rounded-pill bg-brand-orange transition-transform duration-220 ease-out ${
                  pathname === "/" ? "w-full scale-x-100" : "w-full origin-left scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>

            {/* Eye Testing */}
            <Link
              href="/eye-testing"
              className={`group relative py-1 text-sm font-medium transition-colors duration-fast hover:text-brand-orange ${
                pathname === "/eye-testing" ? "text-brand-orange font-bold" : "text-neutral-700"
              }`}
            >
              Eye Testing
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 rounded-pill bg-brand-orange transition-transform duration-220 ease-out ${
                  pathname === "/eye-testing" ? "w-full scale-x-100" : "w-full origin-left scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>

            {/* Frames */}
            <Link
              href="/frames"
              className={`group relative py-1 text-sm font-medium transition-colors duration-fast hover:text-brand-orange ${
                pathname === "/frames" ? "text-brand-orange font-bold" : "text-neutral-700"
              }`}
            >
              Frames
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 rounded-pill bg-brand-orange transition-transform duration-220 ease-out ${
                  pathname === "/frames" ? "w-full scale-x-100" : "w-full origin-left scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>

            {/* Lenses */}
            <Link
              href="/lenses"
              className={`group relative py-1 text-sm font-medium transition-colors duration-fast hover:text-brand-orange ${
                pathname === "/lenses" ? "text-brand-orange font-bold" : "text-neutral-700"
              }`}
            >
              Lenses
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 rounded-pill bg-brand-orange transition-transform duration-220 ease-out ${
                  pathname === "/lenses" ? "w-full scale-x-100" : "w-full origin-left scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>

            {/* Progressive */}
            <Link
              href="/progressive-lenses"
              className={`group relative py-1 text-sm font-medium transition-colors duration-fast hover:text-brand-orange ${
                pathname === "/progressive-lenses" || pathname === "/progressive" ? "text-brand-orange font-bold" : "text-neutral-700"
              }`}
            >
              Progressive
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 rounded-pill bg-brand-orange transition-transform duration-220 ease-out ${
                  pathname === "/progressive-lenses" || pathname === "/progressive" ? "w-full scale-x-100" : "w-full origin-left scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>

            {/* Offers */}
            <Link
              href="/offers"
              className={`group relative py-1 text-sm font-medium transition-colors duration-fast hover:text-brand-orange ${
                pathname === "/offers" ? "text-brand-orange font-bold" : "text-neutral-700"
              }`}
            >
              Offers
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 rounded-pill bg-brand-orange transition-transform duration-220 ease-out ${
                  pathname === "/offers" ? "w-full scale-x-100" : "w-full origin-left scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>

            {/* Gallery */}
            <Link
              href="/gallery"
              className={`group relative py-1 text-sm font-medium transition-colors duration-fast hover:text-brand-orange ${
                pathname === "/gallery" ? "text-brand-orange font-bold" : "text-neutral-700"
              }`}
            >
              Gallery
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 rounded-pill bg-brand-orange transition-transform duration-220 ease-out ${
                  pathname === "/gallery" ? "w-full scale-x-100" : "w-full origin-left scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              className={`group relative py-1 text-sm font-medium transition-colors duration-fast hover:text-brand-orange ${
                pathname === "/contact" ? "text-brand-orange font-bold" : "text-neutral-700"
              }`}
            >
              Contact
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 rounded-pill bg-brand-orange transition-transform duration-220 ease-out ${
                  pathname === "/contact" ? "w-full scale-x-100" : "w-full origin-left scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
          </nav>

          <button
            onClick={openBooking}
            className="hidden md:inline-flex items-center justify-center rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02] hover:bg-brand-orange-hover shadow-sm cursor-pointer"
          >
            Book Eye Test
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-900 lg:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-neutral-100 bg-white lg:hidden"
          >
            <nav className="container-brand flex flex-col py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-2 py-3 text-base font-semibold transition-colors ${
                    pathname === link.href
                      ? "text-brand-orange"
                      : "text-neutral-800 hover:text-brand-orange"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/progressive-lenses"
                className={`rounded-lg px-2 py-3 pl-6 text-sm font-medium transition-colors ${
                  pathname === "/progressive-lenses" || pathname === "/progressive"
                    ? "text-brand-orange"
                    : "text-neutral-600 hover:text-brand-orange"
                }`}
              >
                Progressive Lenses
              </Link>
              <Link
                href="/lens-finder"
                className={`rounded-lg px-2 py-3 pl-6 text-sm font-medium transition-colors ${
                  pathname === "/lens-finder"
                    ? "text-brand-orange"
                    : "text-neutral-600 hover:text-brand-orange"
                }`}
              >
                Smart Lens Finder
              </Link>

              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBooking();
                }}
                variant="primary"
                icon={CalendarCheck}
                className="mt-4 w-full"
              >
                Book Eye Test
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollProgress />
    </header>
  );
}
