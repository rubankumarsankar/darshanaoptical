"use client";

import {
  CalendarCheck,
  Eye,
  Glasses,
  ScanEye,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import Button from "../ui/Button";
import { EASE_STANDARD } from "../../lib/motion";

const FEATURES = [
  { icon: Eye, label: "Professional\nEye Testing" },
  { icon: Glasses, label: "500+\nFrame Styles" },
  { icon: ScanEye, label: "Advanced\nLens Technology" },
  { icon: Users, label: "Personalised\nGuidance" },
];

const headlineLine = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_STANDARD } },
};

export default function Hero() {
  const prefersReduced = useReducedMotion();
  const imageRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReduced || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    imageRef.current.style.setProperty("--parallax-x", `${relX * -16}px`);
    imageRef.current.style.setProperty("--parallax-y", `${relY * -12}px`);
  }

  function handleMouseLeave() {
    if (!imageRef.current) return;
    imageRef.current.style.setProperty("--parallax-x", "0px");
    imageRef.current.style.setProperty("--parallax-y", "0px");
  }

  return (
    <section className="overflow-hidden bg-surface-warm" data-lens-cursor="true" data-lens-text="Vision Focus">
      <div className="container-brand grid grid-cols-1 items-center gap-10 pt-14 pb-16 lg:grid-cols-2 lg:gap-8 lg:pt-16 lg:pb-20">
        <div>
          <h1 className="text-[40px] leading-[46px] font-bold text-neutral-950 sm:text-h1 sm:leading-[68px]">
            <motion.span
              initial="hidden"
              animate="show"
              variants={headlineLine}
              className="block"
            >
              See Better.
            </motion.span>
            <motion.span
              initial="hidden"
              animate="show"
              variants={headlineLine}
              transition={{ delay: 0.12 }}
              className="block text-brand-orange"
            >
              Look Better.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: EASE_STANDARD }}
            className="mt-5 max-w-md text-base leading-[26px] text-text-secondary"
          >
            Professional eye care, stylish frames and advanced lens
            solutions — personalised for your vision and lifestyle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42, ease: EASE_STANDARD }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button href="#book" icon={CalendarCheck} size="lg">
              Book Eye Test
            </Button>
            <Button href="#categories" variant="text">
              Explore Frames
            </Button>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.55 } } }}
            className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {FEATURES.map((f) => (
              <motion.div
                key={f.label}
                variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4, ease: EASE_STANDARD }}
                className="flex items-start gap-2.5"
              >
                <f.icon size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-brand-orange" />
                <span className="text-xs leading-[16px] font-medium whitespace-pre-line text-neutral-700">
                  {f.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div
          className="relative"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            ref={imageRef}
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(75% at 50% 50%)" }}
            transition={{ duration: 0.9, ease: EASE_STANDARD, delay: 0.15 }}
            style={{
              transform:
                "translate3d(var(--parallax-x, 0px), var(--parallax-y, 0px), 0)",
              transition: "transform 0.3s ease-out",
            }}
            className="relative flex aspect-square max-w-[480px] sm:max-w-[520px] mx-auto items-center justify-center overflow-hidden rounded-full bg-[#fceee6]"
          >
            {/* Soft background shape */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#fddbc7] to-[#fef5f0] rounded-full opacity-80" />
            <img
              src="/images/hero-woman.jpg"
              alt="Darshana Optical - Woman with glasses"
              className="relative z-10 w-full h-full object-cover object-center scale-105 transition-transform duration-700 hover:scale-110"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.95, ease: EASE_STANDARD }}
            style={{
              transform:
                "translate3d(calc(var(--parallax-x, 0px) * -0.75), calc(var(--parallax-y, 0px) * -0.75), 0)",
              transition: "transform 0.3s ease-out",
            }}
            className="absolute top-1/2 -right-4 sm:-right-8 -translate-y-1/2 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-5 shadow-xl w-32"
          >
            <div className="flex justify-center">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-orange">
                  <path d="M4 14C4 16.2091 5.79086 18 8 18C10.2091 18 12 16.2091 12 14C12 11.7909 10.2091 10 8 10C5.79086 10 4 11.7909 4 14Z"></path>
                  <path d="M20 14C20 16.2091 18.2091 18 16 18C13.7909 18 12 16.2091 12 14C12 11.7909 13.7909 10 16 10C18.2091 10 20 11.7909 20 14Z"></path>
                  <path d="M12 10V8C12 6.89543 11.1046 6 10 6H8C6.89543 6 6 6.89543 6 8V10"></path>
               </svg>
            </div>
            <div className="text-center mt-2">
              <p className="text-xl leading-none font-bold text-neutral-950">500+</p>
              <p className="mt-1 text-[10px] text-text-muted leading-tight font-medium uppercase tracking-wider">Frame Styles</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
