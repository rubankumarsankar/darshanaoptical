"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, RotateCcw, MessageCircle, Eye, AlertCircle } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";

export default function SmartLensFinderPage() {
  const [step, setStep] = useState(0); // 0 = intro, 1..4 = Qs, 5 = result
  const [visionNeed, setVisionNeed] = useState("");
  const [screenTime, setScreenTime] = useState("");
  const [activity, setActivity] = useState("");
  const [multiGlasses, setMultiGlasses] = useState("");

  const handleReset = () => {
    setStep(0);
    setVisionNeed("");
    setScreenTime("");
    setActivity("");
    setMultiGlasses("");
  };

  const handleDiscussWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hello Darshana Optical,\n\nI completed your Smart Lens Finder quiz:\n` +
      `*Vision Needs:* ${visionNeed}\n` +
      `*Screen Time:* ${screenTime}\n` +
      `*Primary Activity:* ${activity}\n` +
      `*Multiple Pairs:* ${multiGlasses}\n\n` +
      `I would like to discuss recommended lens options with your optometrist.`
    );
    window.open(`https://wa.me/918870571536?text=${msg}`, "_blank");
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-surface-warm py-12 sm:py-20">
        <div className="container-brand max-w-3xl mx-auto">
          <div className="overflow-hidden rounded-3xl bg-white p-6 sm:p-10 border border-neutral-200/80 shadow-xl relative">
            {/* Top Progress Bar */}
            {step >= 1 && step <= 4 && (
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                  <span>Question 0{step} of 04</span>
                  <span>{step * 25}% Completed</span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-orange"
                    initial={{ width: "0%" }}
                    animate={{ width: `${step * 25}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* INTRO */}
              {step === 0 && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="text-center space-y-6 py-6"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orange-soft text-brand-orange shadow-md">
                    <Eye size={32} />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950">
                    Find a Lens That Fits Your Life
                  </h1>
                  <p className="text-base text-neutral-600 max-w-md mx-auto font-medium leading-relaxed">
                    A quick diagnostic guide to help you understand which lens categories may be worth discussing with our optical team.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-primary gap-2 text-base font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
                    >
                      Start Lens Finder <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Q1: VISION NEED */}
              {step === 1 && (
                <motion.div
                  key="q1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-neutral-950">
                    1. What do you currently need help seeing?
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {["Distance", "Reading", "Both Near + Far", "Not Sure"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setVisionNeed(opt);
                          setStep(2);
                        }}
                        className={`p-5 rounded-2xl border text-left font-bold text-base transition-all cursor-pointer ${
                          visionNeed === opt
                            ? "bg-brand-orange text-white border-brand-orange shadow-md"
                            : "bg-neutral-50 border-neutral-200/80 text-neutral-900 hover:bg-white hover:border-brand-orange"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Q2: SCREEN TIME */}
              {step === 2 && (
                <motion.div
                  key="q2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-neutral-950">
                    2. How much time do you spend on digital screens daily?
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {["Low", "2–4 Hours", "4–8 Hours", "8+ Hours"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setScreenTime(opt);
                          setStep(3);
                        }}
                        className={`p-5 rounded-2xl border text-left font-bold text-base transition-all cursor-pointer ${
                          screenTime === opt
                            ? "bg-brand-orange text-white border-brand-orange shadow-md"
                            : "bg-neutral-50 border-neutral-200/80 text-neutral-900 hover:bg-white hover:border-brand-orange"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Q3: PRIMARY ACTIVITY */}
              {step === 3 && (
                <motion.div
                  key="q3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-neutral-950">
                    3. What do you do most often during the day?
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {["Office Work", "Driving", "Reading", "Outdoor Activities", "Mixed Daily Use"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setActivity(opt);
                          setStep(4);
                        }}
                        className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all cursor-pointer ${
                          activity === opt
                            ? "bg-brand-orange text-white border-brand-orange shadow-md"
                            : "bg-neutral-50 border-neutral-200/80 text-neutral-900 hover:bg-white hover:border-brand-orange"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Q4: MULTIPLE GLASSES */}
              {step === 4 && (
                <motion.div
                  key="q4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-neutral-950">
                    4. Do you currently use more than one pair of glasses?
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setMultiGlasses(opt);
                          setStep(5);
                        }}
                        className={`p-6 rounded-2xl border text-center font-bold text-lg transition-all cursor-pointer ${
                          multiGlasses === opt
                            ? "bg-brand-orange text-white border-brand-orange shadow-md"
                            : "bg-neutral-50 border-neutral-200/80 text-neutral-900 hover:bg-white hover:border-brand-orange"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* RESULT */}
              {step === 5 && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={12} /> Personalized Recommendation
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">
                    {visionNeed === "Both Near + Far" || multiGlasses === "Yes"
                      ? "Progressive Lenses May Suit Your Needs"
                      : "Single Vision with Blue-Light Filter May Suit You"}
                  </h2>

                  <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                    Based on your answers (screen time: {screenTime}, primary activity: {activity}), here are recommended topics to discuss during your test:
                  </p>

                  {/* Points */}
                  <div className="space-y-2 text-left max-w-md mx-auto bg-neutral-50 p-5 rounded-2xl border border-neutral-200/80 text-xs font-bold text-neutral-800">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-orange" />
                      <span>{visionNeed === "Both Near + Far" ? "Custom Progressive Design" : "Precision Single Vision Power"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-orange" />
                      <span>Anti-Reflective Coating (Reduces glare from headlights & screens)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand-orange" />
                      <span>100% UV Protection & Blue-Light Filter</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex flex-wrap justify-center gap-4">
                    <button
                      onClick={handleDiscussWhatsApp}
                      className="btn-primary gap-2 text-sm font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
                    >
                      <MessageCircle size={18} /> Discuss This Recommendation
                    </button>

                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                    >
                      <RotateCcw size={14} /> Start Over
                    </button>
                  </div>

                  {/* Disclaimer */}
                  <div className="mt-6 pt-4 border-t border-neutral-100 text-[11px] text-neutral-400 font-medium leading-relaxed max-w-lg mx-auto flex items-center justify-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0 text-amber-500" />
                    <span>This finder provides general guidance and does not replace professional eye testing or an individual lens prescription recommendation.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
