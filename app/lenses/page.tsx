"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Eye, Shield, Sun, Monitor, ShieldCheck, ArrowRight, Layers, HelpCircle, CheckCircle2, Award } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";
import BrandBar from "../components/home/BrandBar";
import LensBeforeAfterSlider from "../components/home/LensBeforeAfterSlider";

const LENS_BRANDS_INFO = [
  {
    name: "Enterprises Lenses",
    desc: "Authorized partner for precision optical single vision, reading, and digital anti-reflective coated lens series.",
    tag: "Authorized Enterprise Stockist",
  },
  {
    name: "Ash Advanced Lenses",
    desc: "Authorized partner for high-definition progressive optics, photochromic light-adapting, and blue-cut digital lenses.",
    tag: "Authorized Ash Stockist",
  },
];

const LENS_TYPES = [
  {
    title: "Single Vision",
    desc: "Designed to correct vision for one primary viewing distance (near, intermediate, or distance).",
    badge: "Everyday Clarity",
    icon: Eye,
  },
  {
    title: "Progressive",
    desc: "Multiple viewing distances (distance, intermediate, near) integrated seamlessly into a single lens.",
    badge: "Multi-Distance",
    icon: Layers,
  },
  {
    title: "Reading",
    desc: "Designed specifically around near-vision requirements for reading, hobbies, and detailed close-up tasks.",
    badge: "Near Focus",
    icon: Shield,
  },
  {
    title: "Computer / Office",
    desc: "Optimized for comfortable intermediate and near viewing during desk work, reducing screen strain.",
    badge: "Digital Comfort",
    icon: Monitor,
  },
];

const LENS_FEATURES = [
  {
    title: "Anti-Reflective Coating",
    desc: "Helps reduce unwanted light reflections from screens, headlights, and overhead glare for crisp clarity.",
    icon: Sparkles,
  },
  {
    title: "100% UV Protection",
    desc: "Lens options designed to shield your eyes against harmful ultraviolet solar radiation.",
    icon: Sun,
  },
  {
    title: "Photochromic (Transitions)",
    desc: "Lenses that intelligently adapt their tint from clear indoors to dark sunglasses when exposed to sunlight.",
    icon: Sun,
  },
  {
    title: "Blue-Light Filter",
    desc: "Lens options designed for heavy screen users to filter high-energy blue rays and reduce digital eye fatigue.",
    icon: Monitor,
  },
  {
    title: "Scratch-Resistant Coating",
    desc: "Hardened coating options intended to protect everyday lenses against fine surface scratches and scuffs.",
    icon: ShieldCheck,
  },
];

const RECOMMENDATION_STEPS = [
  { title: "Prescription", desc: "Sphere, cylinder & axis specs" },
  { title: "Lifestyle", desc: "Work, hobbies & screen hours" },
  { title: "Usage", desc: "Driving, reading or mixed" },
  { title: "Budget", desc: "Standard vs Premium options" },
  { title: "Ideal Lens", desc: "Custom crafted lens solution" },
];

export default function LensesPage() {
  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-surface-warm via-white to-white py-16 sm:py-24">
          <div className="container-brand text-center max-w-4xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Enterprises & Ash Lens Partner
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight">
              Better Frames Need <span className="text-brand-orange">Better Lenses</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Your prescription is only part of the equation. We craft authorized <span className="font-bold text-neutral-900">Enterprises</span> and <span className="font-bold text-neutral-900">Ash</span> optical lenses based on how you live every day.
            </p>
            <div className="pt-2">
              <Link
                href="/lens-finder"
                className="btn-primary gap-2 text-base font-bold shadow-lg shadow-brand-orange/20"
              >
                Find My Lens →
              </Link>
            </div>
          </div>
        </section>

        {/* Authorized Lens Brand Showcase */}
        <section className="py-12 bg-surface-warm border-y border-neutral-200/80">
          <div className="container-brand space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange uppercase tracking-wider">
                <Award size={14} /> Official Lens Partners
              </span>
              <h2 className="text-2xl font-extrabold text-neutral-950">Authorized Lens Enterprises</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {LENS_BRANDS_INFO.map((b) => (
                <div key={b.name} className="rounded-2xl bg-white p-6 border border-neutral-200/80 shadow-sm space-y-2">
                  <span className="inline-block bg-brand-orange text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                    {b.tag}
                  </span>
                  <h3 className="text-lg font-bold text-neutral-950">{b.name}</h3>
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lens Types */}
        <section className="py-16 sm:py-24 bg-white border-b border-neutral-200/80">
          <div className="container-brand space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange-soft px-3 py-1 rounded-full">
                Lens Portfolio
              </span>
              <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">Lens Categories</h2>
              <p className="text-sm text-neutral-600 font-medium">
                Explore optical lens designs customized to your visual viewing distance requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {LENS_TYPES.map((lens) => {
                const Icon = lens.icon;
                return (
                  <div
                    key={lens.title}
                    className="group relative flex flex-col justify-between rounded-2xl bg-neutral-50 p-6 border border-neutral-200/80 shadow-sm transition-all hover:bg-white hover:border-brand-orange hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange-soft text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors">
                          <Icon size={24} />
                        </div>
                        <span className="text-[10px] font-extrabold text-brand-orange bg-brand-orange-soft px-2.5 py-1 rounded-md uppercase">
                          {lens.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-neutral-950 group-hover:text-brand-orange transition-colors">
                        {lens.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-neutral-600 font-medium">
                        {lens.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center text-xs font-bold text-brand-orange">
                      <span>Explore Options</span>
                      <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Lens Features */}
        <section className="py-16 sm:py-24 bg-surface-warm">
          <div className="container-brand space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange-soft px-3 py-1 rounded-full">
                Coatings & Add-Ons
              </span>
              <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">Lens Features & Protection</h2>
              <p className="text-sm text-neutral-600 font-medium">
                Enhance your optical performance with specialized coating add-ons designed for daily convenience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {LENS_FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="flex gap-4 rounded-2xl bg-white p-6 border border-neutral-200/80 shadow-sm transition-all hover:border-brand-orange hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-orange-soft text-brand-orange">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-neutral-950">{feat.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-600 font-medium">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Before/After Lens Technology Comparison Slider */}
            <LensBeforeAfterSlider />
          </div>
        </section>

        {/* How We Recommend Lenses Flow */}
        <section className="py-16 sm:py-24 bg-white border-t border-neutral-200/80">
          <div className="container-brand space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange-soft px-3 py-1 rounded-full">
                Personalised Dispensing
              </span>
              <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">How We Recommend Lenses</h2>
              <p className="text-sm text-neutral-600 font-medium">
                We combine technical prescription accuracy with your daily routine to select the optimal lens from Enterprises and Ash.
              </p>
            </div>

            {/* Stepper Diagram */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {RECOMMENDATION_STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="relative flex flex-col items-center rounded-2xl bg-neutral-50 p-6 border border-neutral-200/80 text-center shadow-sm"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange text-white text-xs font-extrabold shadow-md">
                    {index + 1}
                  </div>
                  <h3 className="text-sm font-bold text-neutral-950">{step.title}</h3>
                  <p className="mt-1 text-[11px] text-neutral-500 font-medium">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Link
                href="/lens-finder"
                className="btn-primary gap-2 text-sm font-bold shadow-lg shadow-brand-orange/20"
              >
                Use Smart Lens Finder →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
