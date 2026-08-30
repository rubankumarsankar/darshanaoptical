"use client";

import { ShieldCheck, Sun, Car, Feather, Glasses, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

const LENSES = [
  {
    icon: ShieldCheck,
    title: "Blue Protect Lenses",
    desc: "For screen time & digital eyes",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Sun,
    title: "Photochromic Lenses",
    desc: "Adapts to light, indoors & outdoors",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    icon: Car,
    title: "Night Drive Lenses",
    desc: "Clear vision, safe driving",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    icon: Feather,
    title: "Thin & Light Lenses",
    desc: "High power, light weight",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    icon: Glasses,
    title: "Progressive Lenses",
    desc: "One lens, all distances",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

export default function LensSolutions() {
  return (
    <section id="lenses" className="bg-white py-12 sm:py-16 border-t border-neutral-100">
      <div className="container-brand space-y-8">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Lens Solutions for Every Lifestyle
          </h2>
          <Link
            href="/lenses"
            className="group inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-orange hover:underline"
          >
            <span>View All Lenses</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* 5 Lens Solution Cards with Staggered Entrance */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {LENSES.map((lens) => {
            const Icon = lens.icon;
            return (
              <motion.div
                key={lens.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: EASE_STANDARD },
                  },
                }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="flex flex-col items-center text-center rounded-2xl bg-neutral-50/70 p-5 border border-neutral-200/70 shadow-2xs hover:shadow-lg hover:border-brand-orange/40 hover:bg-white transition-all group cursor-default"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${lens.bg} ${lens.color} border border-black/5 shadow-xs transition-transform duration-300 group-hover:scale-115`}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-neutral-950 leading-snug">
                  {lens.title}
                </h3>
                <p className="mt-1.5 text-[11px] sm:text-xs leading-relaxed text-neutral-500 font-normal">
                  {lens.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
