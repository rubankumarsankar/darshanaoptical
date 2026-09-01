"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Eye,
  Shield,
  Layers,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MessageCircle,
  ArrowRight,
  Info,
  Sliders,
  Check,
  Zap,
  Glasses,
  Moon,
  Laptop,
  Feather,
  Droplets,
  Award,
  CircleCheck,
  Sparkle
} from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";
import { useBooking } from "../components/booking/BookingContext";

// 6 Top Categories Data
const LENS_CATEGORIES = [
  {
    id: "single-vision",
    title: "Single Vision",
    desc: "Single focus correction for distance or reading.",
    icon: Eye,
  },
  {
    id: "blue-protect",
    title: "Blue Protect",
    desc: "Filters blue light from phones & screens.",
    icon: Laptop,
  },
  {
    id: "photochromic",
    title: "Photochromic",
    desc: "Transitions dark in sunlight, clear indoors.",
    icon: Sun,
  },
  {
    id: "thin-light",
    title: "Thin & Light",
    desc: "High-index lenses for high prescription power.",
    icon: Feather,
  },
  {
    id: "night-drive",
    title: "Night Drive",
    desc: "Cuts headlight glare for safe driving at night.",
    icon: Moon,
  },
  {
    id: "progressive",
    title: "Progressive",
    desc: "Multi-focus without lines for 40+ presbyopia.",
    icon: Layers,
  },
];

// 4 Lifestyle Photo Cards
const LIFESTYLE_CARDS = [
  {
    title: "Digital & Screen Time",
    desc: "Blue-cut lenses to reduce eye strain from computer screens, smartphones and tablets.",
    img: "/images/cat-office.jpg",
  },
  {
    title: "Outdoors & Sunlight",
    desc: "Photochromic & polarized lenses that automatically adapt to bright sunlight.",
    img: "/images/cat-women.jpg",
  },
  {
    title: "Night Driving",
    desc: "Anti-glare coatings that reduce oncoming headlight glare for safer driving at night.",
    img: "/images/cat-men.jpg",
  },
  {
    title: "High Power Needs",
    desc: "Ultra-thin high-index lenses that keep glasses lightweight and cosmetically sleek.",
    img: "/images/cat-premium.jpg",
  },
];

// 4 Advanced Protection Coatings
const COATINGS = [
  {
    title: "Anti-Reflection (ARC)",
    desc: "Eliminates reflections on lens surface for sharper vision and clear eye contact.",
    icon: Sparkles,
  },
  {
    title: "Scratch Resistant",
    desc: "Hard multi-coat that protects lenses against everyday scratches and abrasion.",
    icon: ShieldCheck,
  },
  {
    title: "UV400 Protection",
    desc: "Blocks 100% harmful UVA & UVB rays from reaching your eyes.",
    icon: Sun,
  },
  {
    title: "Smudge & Water Repellent",
    desc: "Hydrophobic & oleophobic layer that resists fingerprints, dust, and water drops.",
    icon: Droplets,
  },
];

// Comparison Matrix
const COMPARISON_DATA = [
  {
    feature: "Distance Vision",
    single: "Yes",
    blue: "Yes",
    photo: "Yes",
    prog: "Yes",
  },
  {
    feature: "Intermediate (Computer)",
    single: "No",
    singleSub: "(Distance or Near only)",
    blue: "No",
    photo: "No",
    prog: "Yes",
    progSub: "(Seamless)",
  },
  {
    feature: "Near Vision (Reading)",
    single: "Separate Pair",
    blue: "Separate Pair",
    photo: "Separate Pair",
    prog: "Yes",
    progSub: "(All-in-one)",
  },
  {
    feature: "Blue Light Protection",
    single: "Optional",
    blue: "Built-in",
    photo: "Optional",
    prog: "Optional",
  },
  {
    feature: "Sunlight Darkening",
    single: "No",
    blue: "No",
    photo: "Yes",
    prog: "Optional",
  },
  {
    feature: "Visible Bifocal Line",
    single: "No Line",
    blue: "No Line",
    photo: "No Line",
    prog: "No Line",
  },
  {
    feature: "Best For",
    single: "General / Single Power",
    blue: "Screen Users",
    photo: "Indoor / Outdoor",
    prog: "Age 40+ Multi-taskers",
  },
];

export default function LensesPage() {
  const { openBooking } = useBooking();

  const handleWhatsAppConsult = () => {
    const msg = encodeURIComponent("Hello Darshana Optical, I would like to book an expert Lens Consultation & Fitting at your Harur store.");
    window.open(`https://wa.me/918870571536?text=${msg}`, "_blank");
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-white">
        {/* 1. HERO SECTION WITH GENERATED MACRO LENS PHOTO */}
        <section className="relative overflow-hidden bg-[#faf8f5] py-12 sm:py-16 lg:py-20 border-b border-neutral-200/60">
          <div className="container-brand grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="flex flex-wrap items-center gap-2">
                {["Single Vision", "Progressive", "Blue Protect", "Photochromic"].map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 bg-neutral-200/60 px-2.5 py-0.5 rounded-md"
                  >
                    • {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 tracking-tight leading-none">
                Lens Solutions for <br />
                <span className="text-brand-orange">Every Lifestyle.</span>
              </h1>

              <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed max-w-xl">
                From digital screen protection to advanced progressive lenses, explore precision-crafted optical solutions tailored to your everyday vision needs.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={openBooking}
                  className="btn-primary gap-2 text-xs sm:text-sm font-bold shadow-md shadow-brand-orange/20 cursor-pointer"
                >
                  <Calendar size={16} />
                  <span>Book Eye Test</span>
                </button>
                <Link
                  href="/progressive"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50 transition-all shadow-2xs"
                >
                  <span>Explore Progressives</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Hero Right Visual: Generated Macro Lens Photography */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-lg aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-stone-200 bg-white group">
                <img
                  src="/images/model-lens-macro.jpg"
                  alt="Precision Optical Lens with Anti-Reflective Coating"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white space-y-1">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Advanced HD Multi-Coat Optics</span>
                    <h3 className="text-lg font-bold">100% Precision Digital Freeform Cut</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 6 LENS CATEGORY CARDS */}
        <section className="py-16 bg-white border-b border-neutral-100">
          <div className="container-brand space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                Explore Lens Types
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                Choose the optical configuration that best fits your daily visual tasks.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {LENS_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <div
                    key={cat.id}
                    className="group relative overflow-hidden rounded-2xl bg-neutral-50/80 p-6 border border-neutral-200/80 shadow-2xs hover:border-brand-orange hover:bg-white hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-orange shadow-xs mb-4 border border-neutral-100 group-hover:bg-brand-orange group-hover:text-white transition-all">
                      <IconComponent size={22} />
                    </div>
                    <h3 className="text-base font-bold text-neutral-950 mb-1.5 group-hover:text-brand-orange transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-neutral-600 font-medium">
                      {cat.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. 4 LIFESTYLE PHOTO CARDS */}
        <section className="py-16 bg-surface-warm border-b border-neutral-200/80">
          <div className="container-brand space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                Lenses for Your Daily Life
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                Every routine demands specific visual performance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LIFESTYLE_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="group overflow-hidden rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:border-brand-orange hover:shadow-lg transition-all"
                >
                  <div className="aspect-4/3 overflow-hidden bg-neutral-100">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 space-y-1.5">
                    <h3 className="text-sm font-bold text-neutral-950 group-hover:text-brand-orange transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-neutral-600 font-medium">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. 4 ADVANCED PROTECTION COATINGS */}
        <section className="py-16 bg-white border-b border-neutral-100">
          <div className="container-brand space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                Advanced Lens Protection
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                High-performance multi-coatings for durability, clarity, and ease of cleaning.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {COATINGS.map((coating) => {
                const IconComponent = coating.icon;
                return (
                  <div
                    key={coating.title}
                    className="rounded-2xl bg-neutral-50/80 p-6 border border-neutral-200/80 space-y-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-orange shadow-xs border border-neutral-100">
                      <IconComponent size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-950">{coating.title}</h3>
                    <p className="text-xs leading-relaxed text-neutral-600 font-medium">
                      {coating.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. COMPARISON MATRIX TABLE */}
        <section className="py-16 bg-neutral-50 border-b border-neutral-200/80">
          <div className="container-brand space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                Compare Lens Features
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                Quick comparison between the most popular lens categories.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-2xs">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-100/70 text-xs font-extrabold text-neutral-900">
                    <th className="p-4">Feature</th>
                    <th className="p-4">Single Vision</th>
                    <th className="p-4">Blue Protect</th>
                    <th className="p-4">Photochromic</th>
                    <th className="p-4 text-brand-orange bg-brand-orange-soft/40">Progressive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs font-medium text-neutral-700">
                  {COMPARISON_DATA.map((row, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="p-4 font-bold text-neutral-950">{row.feature}</td>
                      <td className="p-4">
                        <div>{row.single}</div>
                        {row.singleSub && <span className="text-[10px] text-neutral-400">{row.singleSub}</span>}
                      </td>
                      <td className="p-4">{row.blue}</td>
                      <td className="p-4">{row.photo}</td>
                      <td className="p-4 font-bold text-brand-orange bg-brand-orange-soft/20">
                        <div>{row.prog}</div>
                        {row.progSub && <span className="text-[10px] text-neutral-500 font-normal">{row.progSub}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 6. PROGRESSIVE SPOTLIGHT BANNER */}
        <section className="py-12 bg-white">
          <div className="container-brand">
            <div className="relative overflow-hidden rounded-3xl bg-[#18191c] p-8 sm:p-12 text-white shadow-2xl border border-neutral-800">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-brand-orange">
                    SPOTLIGHT ON PROGRESSIVES
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    One Pair for All Distances. <br />
                    No Visible Lines.
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-medium">
                    If you are 40+ and finding yourself switching between reading and distance glasses, progressive lenses provide seamless vision across near, intermediate and far zones.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/progressive"
                      className="btn-primary inline-flex gap-2 text-xs sm:text-sm font-bold"
                    >
                      <span>Explore Progressive Guide</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-full max-w-sm aspect-4/3 rounded-2xl overflow-hidden shadow-xl border border-white/20">
                    <img
                      src="/images/lens-progressive.jpg"
                      alt="Progressive Focal Zones"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PERSONALIZED CONSULTATION BANNER */}
        <section className="py-16 bg-neutral-50 border-t border-neutral-200/80">
          <div className="container-brand">
            <div className="rounded-3xl bg-white p-8 sm:p-12 border border-neutral-200 shadow-sm text-center max-w-3xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} /> Expert Lens Consultation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                Not Sure Which Lens You Need?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-xl mx-auto">
                Visit our Harur store for a personalized optical consultation. Our certified optometrists will recommend the ideal lens index, coatings, and design for your prescription.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={openBooking}
                  className="btn-primary gap-2 text-xs sm:text-sm font-bold shadow-md shadow-brand-orange/20 cursor-pointer"
                >
                  <Calendar size={16} />
                  <span>Book Free Consultation</span>
                </button>
                <button
                  onClick={handleWhatsAppConsult}
                  className="btn-secondary gap-2 text-xs sm:text-sm font-bold border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                >
                  <MessageCircle size={16} />
                  <span>Ask on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
