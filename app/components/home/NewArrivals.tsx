"use client";

import { useState, useRef } from "react";
import { Heart, MessageCircle, Eye, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../motion/Reveal";
import { viewportOnce, EASE_STANDARD } from "../../lib/motion";

const PRODUCTS = [
  {
    code: "DO-101",
    desc: "Full Rim | Black",
    price: "₹1,499",
    image: "/images/frame-1.jpg",
    colors: ["Black", "Matte Gray"],
  },
  {
    code: "DO-205",
    desc: "Aviator | Gunmetal",
    price: "₹1,899",
    image: "/images/frame-2.jpg",
    colors: ["Gunmetal", "Gold"],
  },
  {
    code: "DO-301",
    desc: "Square | Tortoise",
    price: "₹2,199",
    image: "/images/frame-3.jpg",
    colors: ["Tortoise", "Brown Amber"],
  },
  {
    code: "DO-404",
    desc: "Round | Silver",
    price: "₹1,699",
    image: "/images/frame-4.jpg",
    colors: ["Silver", "Rose Gold"],
  },
  {
    code: "DO-505",
    desc: "Wayfarer | Brown",
    price: "₹1,799",
    image: "/images/frame-5.jpg",
    colors: ["Brown", "Deep Black"],
  },
  {
    code: "DO-606",
    desc: "Transparent | Clear",
    price: "₹1,299",
    image: "/images/frame-6.jpg",
    colors: ["Clear Crystal", "Smoky Grey"],
  },
];

export default function NewArrivals() {
  const prefersReduced = useReducedMotion();
  const [activePreview, setActivePreview] = useState<typeof PRODUCTS[0] | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (product: typeof PRODUCTS[0]) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setActivePreview(product);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  return (
    <section className="bg-white pb-16 md:pb-24 relative">
      <div className="container-brand">
        <Reveal variant="up">
          <SectionHeading title="New Arrivals" action={{ label: "View All Frames", href: "#" }} />
        </Reveal>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {PRODUCTS.map((p) => (
            <motion.div
              key={p.code}
              onMouseEnter={() => handleMouseEnter(p)}
              onMouseLeave={handleMouseLeave}
              variants={{
                hidden: prefersReduced ? { opacity: 0 } : { opacity: 0, x: 40 },
                show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: EASE_STANDARD } },
              }}
              whileHover={{ rotate: 1, y: -4, transition: { duration: 0.2 } }}
              className="group overflow-hidden rounded-xl border border-border-default transition-all duration-normal hover:shadow-lg bg-white relative cursor-pointer"
            >
              <div className="relative flex aspect-4/3 items-center justify-center bg-neutral-50 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.code}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-400 shadow-sm transition-colors duration-fast hover:text-brand-orange backdrop-blur-xs">
                  <Heart size={14} strokeWidth={2} />
                </span>

                <button
                  onClick={() => setActivePreview(p)}
                  className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-1 rounded-lg bg-black/75 py-1.5 text-[11px] font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-xs"
                >
                  <Eye size={12} /> Quick Preview
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-neutral-900">{p.code}</p>
                <p className="mt-0.5 text-xs text-text-muted">{p.desc}</p>
                <p className="mt-1.5 text-base font-semibold text-neutral-950">{p.price}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Floating Frame Preview Panel Modal (Requirement 14) */}
      <AnimatePresence>
        {activePreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.25, ease: EASE_STANDARD }}
              className="relative max-w-md w-full overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200"
            >
              <button
                onClick={() => setActivePreview(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
              >
                <X size={16} />
              </button>

              <div className="relative aspect-16/10 overflow-hidden rounded-xl bg-neutral-100">
                <img
                  src={activePreview.image}
                  alt={activePreview.code}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-neutral-950">{activePreview.code}</h4>
                  <span className="text-xl font-extrabold text-brand-orange">{activePreview.price}</span>
                </div>
                <p className="text-sm text-neutral-500 mt-0.5">{activePreview.desc}</p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-700">Available Shades:</span>
                  {activePreview.colors.map((c) => (
                    <span key={c} className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 font-medium">
                      {c}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <a
                    href={`https://wa.me/919876543210?text=Hi%2C%20I%20am%20interested%20in%20frame%20${activePreview.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 btn-primary text-xs gap-1.5"
                  >
                    <MessageCircle size={16} /> WhatsApp Enquiry
                  </a>
                  <button
                    onClick={() => setActivePreview(null)}
                    className="btn-secondary text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
