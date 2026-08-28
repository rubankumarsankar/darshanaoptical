"use client";

import { useState } from "react";
import { CalendarCheck, Check, Sparkles, Activity } from "lucide-react";
import Button from "../ui/Button";
import Reveal from "../motion/Reveal";
import FrameFinderQuiz from "./FrameFinderQuiz";
import { motion } from "framer-motion";

const PROCESS_STEPS = [
  { num: "01", title: "Preliminary Check", desc: "Corneal curvature & pressure test" },
  { num: "02", title: "Auto Refraction", desc: "Precision optical measurement" },
  { num: "03", title: "Subjective Refraction", desc: "Distance & reading clarity fine-tuning" },
  { num: "04", title: "Vision Analysis", desc: "Binocular & digital strain evaluation" },
  { num: "05", title: "Expert Prescription", desc: "Custom lens recommendation" },
];

export default function EyeTestingFeature() {
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <section id="eye-testing" className="bg-surface-warm py-16 md:py-24">
      <div className="container-brand space-y-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Eye Test Equipment Card with Subtle Hover Scan Line */}
          <Reveal variant="clip" className="grid grid-cols-1 gap-6 overflow-hidden rounded-2xl bg-white p-6 sm:grid-cols-2 sm:p-8 border border-neutral-100 shadow-sm group relative">
            <div className="relative aspect-3/4 sm:col-span-1 overflow-hidden rounded-xl bg-neutral-100">
              <img
                src="/images/eye-test.jpg"
                alt="Professional Eye Examination"
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              {/* Subtle Laser Scan Line on Hover */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-0 shadow-[0_0_12px_#fc5a06] transition-opacity duration-300 group-hover:opacity-100 animate-[scanline_2.5s_linear_infinite]" />
            </div>

            <div className="flex flex-col justify-center">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-[0.08em] text-brand-orange uppercase">
                <Activity size={14} /> Professional Eye Care
              </p>
              <h3 className="text-h4 leading-9 font-semibold text-neutral-950">
                Advanced Eye Testing for Clearer Vision
              </h3>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Our computerized eye tests ensure pin-point prescription accuracy and 360° retinal health inspection.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button href="#book" variant="primary" icon={CalendarCheck}>
                  Book Eye Test
                </Button>
              </div>
            </div>
          </Reveal>

          {/* Interactive Frame Finder Card */}
          <Reveal variant="focus" delay={0.1} className="flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-dark p-6 sm:p-8 relative">
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-[0.08em] text-brand-orange uppercase">
                <Sparkles size={13} strokeWidth={2} />
                Smart Recommendation
              </p>
              <h3 className="text-h4 leading-9 font-semibold text-white">
                Find Your Perfect Frame in 60 Seconds
              </h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-neutral-400">
                Answer a few simple questions about your style, face shape and budget to discover your matching frames.
              </p>
              <button
                onClick={() => setShowQuiz(!showQuiz)}
                className="mt-6 btn-primary cursor-pointer"
              >
                {showQuiz ? "Close Frame Quiz" : "Start Frame Finder →"}
              </button>
            </div>
            <div className="relative mt-8 aspect-16/9 overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800">
              <img
                src="/images/frame-finder.jpg"
                alt="Stylish Frame Collection"
                className="h-full w-full object-cover object-center opacity-85 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </Reveal>
        </div>

        {/* Embedded Interactive Quiz Panel */}
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <FrameFinderQuiz />
          </motion.div>
        )}

        {/* Eye Test Process Timeline Journey */}
        <Reveal variant="up" className="rounded-2xl bg-white p-6 sm:p-10 border border-neutral-100 shadow-sm">
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Precision Care Journey
            </span>
            <h4 className="text-xl font-bold text-neutral-950 sm:text-2xl mt-1">
              Our 5-Step Computerized Eye Examination
            </h4>
          </div>

          <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            {/* Connecting Timeline Line */}
            <div className="hidden lg:block absolute top-6 inset-x-12 h-0.5 bg-neutral-200 -z-0">
              <div className="h-full w-3/4 bg-brand-orange" />
            </div>

            {PROCESS_STEPS.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ delay: idx * 0.1 }}
                className="relative z-10 flex flex-col rounded-xl bg-neutral-50 p-4 border border-neutral-200/60 transition-all hover:-translate-y-1 hover:shadow-md hover:border-brand-orange/40"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-white shadow-sm">
                  {step.num}
                </div>
                <h5 className="text-sm font-bold text-neutral-900">{step.title}</h5>
                <p className="mt-1 text-xs leading-5 text-neutral-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
