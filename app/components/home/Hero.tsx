"use client";

import {
  CalendarCheck,
  Settings,
  Glasses,
  Search,
  User,
  ArrowRight,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useBooking } from "../booking/BookingContext";
import { EASE_STANDARD } from "../../lib/motion";

const FEATURES = [
  { icon: Settings, label: "Professional\nEye Testing" },
  { icon: Glasses, label: "500+\nFrame Styles" },
  { icon: Search, label: "Advanced\nLens Technology" },
  { icon: User, label: "Personalised\nGuidance" },
];

export default function Hero() {
  const { openBooking } = useBooking();
  const prefersReduced = useReducedMotion();
  const imageRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReduced || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    imageRef.current.style.setProperty("--parallax-x", `${relX * -14}px`);
    imageRef.current.style.setProperty("--parallax-y", `${relY * -10}px`);
  }

  function handleMouseLeave() {
    if (!imageRef.current) return;
    imageRef.current.style.setProperty("--parallax-x", "0px");
    imageRef.current.style.setProperty("--parallax-y", "0px");
  }

  return (
    <section
      className="overflow-hidden bg-[#fafafa] py-10 md:py-16 lg:py-20"
      data-lens-cursor="true"
      data-lens-text="Vision Focus"
    >
      <div className="container-brand">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_STANDARD }}
              className="text-4xl font-extrabold tracking-tight text-neutral-950 sm:text-5xl lg:text-[54px] leading-[1.12]"
            >
              <motion.span
                initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE_STANDARD }}
                className="block"
              >
                See Better.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: 0.24, ease: EASE_STANDARD }}
                className="block text-brand-orange"
              >
                Look Better.
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: EASE_STANDARD }}
              className="max-w-xl text-base text-neutral-600 leading-relaxed font-normal sm:text-lg"
            >
              Professional eye care, stylish frames and advanced lens
              solutions – personalised for your vision and lifestyle.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: EASE_STANDARD }}
              className="flex flex-wrap items-center gap-4 pt-1"
            >
              <motion.button
                onClick={openBooking}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-brand-orange px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-orange/20 hover:bg-brand-orange-hover cursor-pointer transition-colors"
              >
                <CalendarCheck size={18} />
                Book Eye Test
              </motion.button>

              <motion.a
                href="/frames"
                whileHover={{ x: 3 }}
                className="group inline-flex items-center gap-2 text-sm font-bold text-neutral-800 hover:text-brand-orange transition-colors"
              >
                <span>Explore Frames</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </motion.a>
            </motion.div>

            {/* Feature Pills Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="pt-6 border-t border-neutral-200/60"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {FEATURES.map((f, idx) => {
                  const Icon = f.icon;
                  return (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.55 + idx * 0.08,
                        ease: EASE_STANDARD,
                      }}
                      className="flex items-start gap-2.5 group"
                    >
                      <Icon
                        size={18}
                        className="text-brand-orange shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-115"
                      />
                      <span className="text-xs font-semibold text-neutral-700 leading-tight whitespace-pre-line">
                        {f.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Visual with Circular Lens Mask Reveal & Badge */}
          <div
            className="lg:col-span-6 relative flex justify-center lg:justify-end"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative w-full max-w-lg">
              {/* Circular Lens Mask Expand on Entry */}
              <motion.div
                ref={imageRef}
                initial={{
                  clipPath: prefersReduced
                    ? "circle(100% at 50% 50%)"
                    : "circle(0% at 50% 50%)",
                  filter: "blur(8px)",
                  opacity: 0,
                }}
                animate={{
                  clipPath: "circle(85% at 50% 50%)",
                  filter: "blur(0px)",
                  opacity: 1,
                }}
                transition={{ duration: 0.95, delay: 0.25, ease: EASE_STANDARD }}
                style={{
                  transform:
                    "translate3d(var(--parallax-x, 0px), var(--parallax-y, 0px), 0)",
                  transition: "transform 0.2s ease-out",
                }}
                className="relative aspect-4/3 sm:aspect-square overflow-hidden rounded-3xl bg-neutral-100 shadow-xl"
              >
                <img
                  src="/images/hero-woman.jpg"
                  alt="Darshana Optical - Stylish Eyewear"
                  width={600}
                  height={600}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
              </motion.div>

              {/* Floating Badge on Right with Inverted Parallax Shift */}
              <motion.div
                initial={{ opacity: 0, x: 24, scale: 0.85, filter: "blur(6px)" }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  filter: "blur(0px)",
                  y: prefersReduced ? 0 : [0, -6, 0],
                }}
                transition={{
                  opacity: { duration: 0.6, delay: 0.7 },
                  x: { duration: 0.6, delay: 0.7 },
                  scale: { duration: 0.6, delay: 0.7 },
                  filter: { duration: 0.6, delay: 0.7 },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                }}
                style={{
                  transform:
                    "translate3d(calc(var(--parallax-x, 0px) * -1.5), calc(var(--parallax-y, 0px) * -1.5), 0)",
                  transition: "transform 0.25s ease-out",
                }}
                className="absolute top-1/2 -right-3 sm:-right-6 -translate-y-1/2 rounded-2xl bg-white p-4 shadow-2xl border border-neutral-100 flex flex-col items-center justify-center text-center w-28 sm:w-32 z-10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-brand-orange mb-1.5 shadow-2xs">
                  <Glasses size={22} />
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-neutral-950 leading-none">
                  500+
                </div>
                <div className="text-[10px] font-semibold text-neutral-500 mt-1">
                  Frame Styles
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
