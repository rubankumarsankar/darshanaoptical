"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Glasses, CalendarCheck } from "lucide-react";
import { useState } from "react";
import TopBar from "./TopBar";
import Button from "../ui/Button";
import ScrollProgress from "../motion/ScrollProgress";

const NAV_LINKS = [
  { label: "Home", href: "#", active: true },
  { label: "Eye Testing", href: "#eye-testing" },
  { label: "Frames", href: "#categories" },
  { label: "Lenses", href: "#lenses" },
  { label: "Progressive", href: "#progressive" },
  { label: "Offers", href: "#offers" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    // Hysteresis: different enter/exit thresholds stop the header from
    // flickering when a layout shift (TopBar collapsing) nudges scrollY
    // back across a single shared threshold.
    setScrolled((prev) => {
      if (!prev && latest > 72) return true;
      if (prev && latest < 40) return false;
      return prev;
    });
  });

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-default [overflow-anchor:none] ${
        scrolled
          ? "border-border-default bg-white/85 shadow-sm backdrop-blur-md"
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
          <Link href="#" className="flex items-center">
            <motion.img
              initial={{ opacity: 0, filter: "blur(8px)", scale: 0.95 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              src="/logo.png"
              alt="Darshana Optical Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-all duration-300"
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`group relative py-1 text-sm font-medium transition-colors duration-fast hover:text-brand-orange ${
                  link.active ? "text-brand-orange" : "text-neutral-700"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-[2px] rounded-pill bg-brand-orange transition-transform duration-[220ms] ease-out ${
                    link.active ? "w-full scale-x-100" : "w-full origin-left scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <Button
            href="#book"
            variant="primary"
            icon={CalendarCheck}
            className="hidden md:inline-flex"
          >
            Book Eye Test
          </Button>
        </motion.div>
      </div>

      <ScrollProgress />
    </header>
  );
}
