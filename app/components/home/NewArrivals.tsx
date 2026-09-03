"use client";

import { useState } from "react";
import { Heart, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

const PRODUCTS = [
  {
    code: "DO-101",
    desc: "Full Rim | Black",
    price: "₹1,499",
    image: "/images/frame-1.jpg",
  },
  {
    code: "DO-205",
    desc: "Aviator | Gunmetal",
    price: "₹1,899",
    image: "/images/frame-2.jpg",
  },
  {
    code: "DO-301",
    desc: "Square | Tortoise",
    price: "₹2,199",
    image: "/images/frame-3.jpg",
  },
  {
    code: "DO-404",
    desc: "Round | Silver",
    price: "₹1,699",
    image: "/images/frame-4.jpg",
  },
  {
    code: "DO-505",
    desc: "Wayfarer | Brown",
    price: "₹1,799",
    image: "/images/frame-5.jpg",
  },
  {
    code: "DO-606",
    desc: "Transparent | Clear",
    price: "₹1,299",
    image: "/images/frame-6.jpg",
  },
];

export default function NewArrivals() {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="container-brand space-y-8">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            New Arrivals
          </h2>
          <a
            href="/frames"
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-orange hover:underline"
          >
            <span>View All Frames</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>
        </div>

        {/* 6 Products Grid with Carousel Navigation */}
        <div className="relative flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous frames"
            className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-xs hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </motion.button>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.07 },
              },
            }}
            className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-6 w-full"
          >
            {PRODUCTS.map((p) => (
              <motion.div
                key={p.code}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: EASE_STANDARD },
                  },
                }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-3.5 border border-neutral-200/80 shadow-xs transition-all hover:shadow-lg hover:border-brand-orange/30 cursor-pointer"
              >
                <div>
                  {/* Frame Image */}
                  <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-neutral-50 mb-3 flex items-center justify-center p-2">
                    <img
                      src={p.image}
                      alt={p.code}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-108"
                    />
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-neutral-950">
                    {p.code}
                  </h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    {p.desc}
                  </p>
                </div>

                {/* Price and Favorite Heart with Pop Animation */}
                <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-extrabold text-neutral-950">
                    {p.price}
                  </span>
                  <motion.button
                    onClick={(e) => toggleFavorite(p.code, e)}
                    whileTap={{ scale: 0.75 }}
                    whileHover={{ scale: 1.25 }}
                    aria-label="Favorite frame"
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer ${
                      favorites[p.code]
                        ? "text-brand-orange"
                        : "text-neutral-400 hover:text-brand-orange"
                    }`}
                  >
                    <Heart
                      size={15}
                      fill={favorites[p.code] ? "currentColor" : "none"}
                    />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Next frames"
            className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-xs hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
