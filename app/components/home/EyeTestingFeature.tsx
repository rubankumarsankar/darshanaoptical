"use client";

import { useState } from "react";
import { CalendarCheck, Check, ArrowRight } from "lucide-react";
import { useBooking } from "../booking/BookingContext";
import FrameFinderQuiz from "./FrameFinderQuiz";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

const EYE_CARE_POINTS = [
  "Computerised Eye Testing",
  "Refraction & Prescription",
  "Vision Analysis",
  "Expert Consultation",
];

export default function EyeTestingFeature() {
  const [showQuiz, setShowQuiz] = useState(false);
  const { openBooking } = useBooking();

  return (
    <section id="eye-testing" className="bg-white py-12 sm:py-16">
      <div className="container-brand space-y-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 1. Left Card: Professional Eye Care */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: EASE_STANDARD }}
            className="flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-neutral-50/80 border border-neutral-200/80 shadow-xs hover:shadow-lg transition-all duration-300 group"
          >
            {/* Image on left */}
            <div className="relative sm:w-1/2 min-h-[220px] sm:min-h-full overflow-hidden bg-neutral-100">
              <img
                src="/images/eye-test.jpg"
                alt="Advanced Eye Examination"
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
              />
            </div>

            {/* Content on right */}
            <div className="p-6 sm:p-7 sm:w-1/2 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange">
                  PROFESSIONAL EYE CARE
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-950 leading-tight">
                  Advanced Eye Testing for Clearer Vision
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-normal leading-relaxed">
                  Our comprehensive eye tests ensure accurate prescription and better eye health.
                </p>

                {/* 4 checklist points */}
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {EYE_CARE_POINTS.map((pt, idx) => (
                    <motion.div
                      key={pt}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + idx * 0.08 }}
                      className="flex items-center gap-2 text-xs font-semibold text-neutral-700"
                    >
                      <Check size={15} className="text-brand-orange shrink-0" strokeWidth={2.5} />
                      <span>{pt}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <motion.button
                  onClick={openBooking}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-neutral-900 shadow-xs hover:border-brand-orange hover:text-brand-orange transition-colors cursor-pointer"
                >
                  <CalendarCheck size={15} className="text-brand-orange" />
                  <span>Book Eye Test</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* 2. Right Card: Find Your Perfect Frame (Dark Theme) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE_STANDARD }}
            className="flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-[#1c1d22] text-white border border-neutral-800 shadow-xs hover:shadow-xl transition-all duration-300 group"
          >
            {/* Content on left */}
            <div className="p-6 sm:p-7 sm:w-7/12 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange">
                  NEW FEATURE
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                  Find Your Perfect Frame In 60 Seconds
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                  Answer a few simple questions about your style, face shape and budget. We&apos;ll suggest the perfect frames for you.
                </p>
              </div>

              <div className="pt-2">
                <motion.button
                  onClick={() => setShowQuiz(!showQuiz)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-orange/20 hover:bg-brand-orange-hover transition-colors cursor-pointer"
                >
                  <span>{showQuiz ? "Close Quiz" : "Start Frame Finder"}</span>
                  <ArrowRight size={14} />
                </motion.button>
              </div>
            </div>

            {/* Image on right */}
            <div className="relative sm:w-5/12 min-h-[180px] sm:min-h-full overflow-hidden bg-neutral-900">
              <img
                src="/images/frame-finder.jpg"
                alt="Frame Finder Selection"
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </motion.div>
        </div>

        {/* Interactive Quiz Popup Panel when active */}
        <AnimatePresence>
          {showQuiz && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: EASE_STANDARD }}
              className="overflow-hidden pt-4"
            >
              <FrameFinderQuiz />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
