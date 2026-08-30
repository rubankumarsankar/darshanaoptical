"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Eye, Layers, ShieldCheck, CheckCircle2, MessageCircle, HelpCircle, ArrowRight } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";

const ZONES = [
  {
    id: "upper",
    title: "Distance Vision",
    scene: "Highway / Outdoors",
    desc: "Provides crystal-clear optics for driving, walking, outdoor activities, and viewing distant objects.",
    color: "bg-blue-500",
    img: "/images/cat-office.jpg",
  },
  {
    id: "middle",
    title: "Intermediate Vision",
    scene: "Computer / Workspace",
    desc: "Smooth progressive corridor designed for computer monitor distances, car dashboards, and desk work.",
    color: "bg-amber-500",
    img: "/images/cat-premium.jpg",
  },
  {
    id: "lower",
    title: "Near & Reading Vision",
    scene: "Book / Smartphone",
    desc: "Optimized bottom segment engineered for comfortable reading of smartphones, books, and fine print.",
    color: "bg-emerald-500",
    img: "/images/frame-1.jpg",
  },
];

const COMPARISON_TIERS = [
  {
    id: "basic",
    name: "Standard Progressive",
    corridor: "Narrow Corridor",
    corridorWidth: "w-1/3",
    desc: "Cost-effective entry multifocal, ideal for light everyday multi-tasking.",
  },
  {
    id: "advanced",
    name: "Advanced HD Progressive",
    corridor: "Wide Corridor",
    corridorWidth: "w-2/3",
    desc: "Significantly reduced peripheral soft blur, providing swift eye transitions.",
  },
  {
    id: "premium",
    name: "Personalized Digital Custom",
    corridor: "Panoramic Corridor",
    corridorWidth: "w-full",
    desc: "Customized to your exact facial parameters with maximum edge-to-edge clarity.",
  },
];

const WHO_FOR_POINTS = [
  "Need different corrections for distance and near vision (Presbyopia).",
  "Frequently switch between multiple pairs of distance and reading glasses.",
  "Work dynamically across computer, reading, and distance environment tasks.",
  "Want a seamless, single pair of stylish glasses for all everyday viewing distances.",
];

export default function ProgressivePage() {
  const [activeZone, setActiveZone] = useState("upper");
  const [activeTier, setActiveTier] = useState("advanced");

  const activeZoneObj = ZONES.find((z) => z.id === activeZone) || ZONES[0];
  const activeTierObj = COMPARISON_TIERS.find((t) => t.id === activeTier) || COMPARISON_TIERS[1];

  const handleWhatsAppTalk = () => {
    const msg = encodeURIComponent("Hello Darshana Optical, I would like to ask about Progressive Lens options and expert fitting at your Tirupattur store.");
    window.open(`https://wa.me/919876543210?text=${msg}`, "_blank");
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-linear-to-b from-surface-warm via-white to-white py-16 sm:py-24">
          <div className="container-brand text-center max-w-4xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Seamless Multi-Focal Vision
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight">
              See Near. See Far. <br className="hidden sm:inline" />
              <span className="text-brand-orange">And Everything Between.</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Progressive lenses combine multiple viewing zones into one pair of glasses without the visible segment lines associated with traditional bifocal designs.
            </p>
            <div className="pt-2">
              <button
                onClick={handleWhatsAppTalk}
                className="btn-primary gap-2 text-base font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
              >
                <MessageCircle size={18} /> Ask About Progressives
              </button>
            </div>
          </div>
        </section>

        {/* How Progressive Lenses Work — Interactive Diagram with Real-World Scene Transition */}
        <section className="py-16 sm:py-24 bg-surface-warm border-y border-neutral-200/80">
          <div className="container-brand space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange-soft px-3 py-1 rounded-full">
                Optical Engineering & Simulation
              </span>
              <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                How Progressive Lenses Work
              </h2>
              <p className="text-sm text-neutral-600 font-medium">
                Click on the viewing zones below to simulate how the lens delivers crisp optics for distance, computer, and reading.
              </p>
            </div>

            {/* Lens Diagram Card with Visual Scene Transition */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-8 border border-neutral-200/80 shadow-xl">
              {/* Left Lens Graphic with Simulated Environment */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="relative w-full max-w-sm aspect-4/3 rounded-3xl bg-neutral-950 border-4 border-neutral-800 p-2 shadow-2xl flex flex-col overflow-hidden group">
                  {/* Inside-the-lens simulated scene */}
                  <div className="relative h-full w-full rounded-2xl overflow-hidden">
                    <img
                      src={activeZoneObj.img}
                      alt={activeZoneObj.title}
                      className="h-full w-full object-cover transition-all duration-700 filter brightness-95"
                    />
                    <div className="absolute inset-0 bg-radial from-transparent to-black/60 pointer-events-none" />

                    {/* Zone indicators inside lens */}
                    <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-md">
                      Simulating: {activeZoneObj.scene}
                    </div>
                  </div>

                  {/* Interactive Zone Trigger Bars */}
                  <div className="absolute inset-2 flex flex-col pointer-events-auto">
                    <div
                      onClick={() => setActiveZone("upper")}
                      className={`flex-1 rounded-t-xl transition-all duration-300 flex items-center justify-center cursor-pointer border-b border-dashed border-white/20 ${
                        activeZone === "upper" ? "bg-blue-600/30 ring-2 ring-blue-400" : "bg-transparent hover:bg-white/10"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-white drop-shadow-md">Upper Zone (Distance)</span>
                    </div>

                    <div
                      onClick={() => setActiveZone("middle")}
                      className={`h-14 my-1 transition-all duration-300 flex items-center justify-center cursor-pointer border-b border-dashed border-white/20 ${
                        activeZone === "middle" ? "bg-amber-600/30 ring-2 ring-amber-400" : "bg-transparent hover:bg-white/10"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-white drop-shadow-md">Middle Zone (Intermediate)</span>
                    </div>

                    <div
                      onClick={() => setActiveZone("lower")}
                      className={`flex-1 rounded-b-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
                        activeZone === "lower" ? "bg-emerald-600/30 ring-2 ring-emerald-400" : "bg-transparent hover:bg-white/10"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-white drop-shadow-md">Lower Zone (Reading)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Zone Info */}
              <div className="lg:col-span-6 space-y-4">
                {ZONES.map((zone) => (
                  <motion.div
                    key={zone.id}
                    onClick={() => setActiveZone(zone.id)}
                    whileHover={{ x: 4 }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      activeZone === zone.id
                        ? "bg-brand-orange-soft/40 border-brand-orange shadow-md scale-[1.02]"
                        : "bg-neutral-50 border-neutral-200/70 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`h-3 w-3 rounded-full ${zone.color}`} />
                      <h3 className="text-base font-bold text-neutral-950">{zone.title}</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-neutral-600 font-medium pl-6">
                      {zone.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Progressive Tier Corridor Width Comparison */}
            <div className="mt-12 rounded-3xl bg-white p-8 border border-neutral-200 shadow-md space-y-6">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                  Corridor Comparison
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-950 mt-1">
                  Viewing Corridor Width By Lens Tier
                </h3>
              </div>

              <div className="flex justify-center gap-2">
                {COMPARISON_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setActiveTier(tier.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTier === tier.id
                        ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20 scale-105"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {tier.name}
                  </button>
                ))}
              </div>

              <div className="max-w-md mx-auto rounded-2xl bg-neutral-950 p-6 text-white text-center space-y-3">
                <div className="text-xs text-neutral-400 font-bold uppercase">Active Corridor: {activeTierObj.corridor}</div>
                <div className="h-6 rounded-full bg-neutral-800 p-1 flex items-center justify-center">
                  <motion.div
                    layout
                    className={`h-full rounded-full bg-linear-to-r from-brand-orange to-amber-400 ${activeTierObj.corridorWidth} transition-all duration-500`}
                  />
                </div>
                <p className="text-xs text-neutral-300 font-medium">{activeTierObj.desc}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Who Are They For? */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="container-brand space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange-soft px-3 py-1 rounded-full">
                Ideal Candidates
              </span>
              <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                Who Are They For?
              </h2>
              <p className="text-sm text-neutral-600 font-medium">
                Progressive lenses may be worth discussing with our optometrist if you:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {WHO_FOR_POINTS.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-2xl bg-neutral-50 p-6 border border-neutral-200/80 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Progressive Selection Equation */}
        <section className="py-16 sm:py-24 bg-surface-warm border-t border-neutral-200/80">
          <div className="container-brand space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange-soft px-3 py-1 rounded-full">
                Custom Fitting
              </span>
              <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                Progressive Lenses Aren&apos;t One-Size-Fits-All
              </h2>
              <p className="text-sm text-neutral-600 font-medium">
                The appropriate progressive design depends on your prescription, frame measurements, working distance, lifestyle, and budget.
              </p>
            </div>

            {/* Selection Formula Diagram */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto items-center text-center">
              <div className="rounded-2xl bg-white p-5 border border-neutral-200 shadow-sm font-bold text-sm text-neutral-900">
                Prescription
              </div>
              <div className="text-xl font-extrabold text-brand-orange">+</div>
              <div className="rounded-2xl bg-white p-5 border border-neutral-200 shadow-sm font-bold text-sm text-neutral-900">
                Measurements
              </div>
              <div className="text-xl font-extrabold text-brand-orange">+</div>
              <div className="col-span-2 sm:col-span-1 rounded-2xl bg-brand-orange text-white p-5 shadow-lg font-bold text-sm">
                Personalised Setup
              </div>
            </div>
          </div>
        </section>

        {/* Adaptation & Final CTA */}
        <section className="py-16 bg-brand-dark text-white text-center">
          <div className="container-brand max-w-3xl space-y-6">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange/20 px-3 py-1 rounded-full">
              Adaptation Period
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Your First Progressive Lenses?</h2>
            <p className="text-base text-neutral-300 font-medium leading-relaxed">
              Adaptation can vary by wearer. Precise pupillary height measurements, correct frame fitting, and professional optician guidance make all the difference.
            </p>
            <div className="pt-2">
              <button
                onClick={handleWhatsAppTalk}
                className="btn-primary gap-2 text-base font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
              >
                <MessageCircle size={18} /> Talk to Our Team
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
