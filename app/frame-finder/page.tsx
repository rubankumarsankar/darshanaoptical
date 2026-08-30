"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, Check, RotateCcw, MessageCircle, Glasses } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";

export default function SmartFrameFinderPage() {
  const [step, setStep] = useState(0); // 0 = intro, 1..4 = questions, 5 = results
  const [gender, setGender] = useState("");
  const [faceShape, setFaceShape] = useState("");
  const [style, setStyle] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);

  const handleTogglePriority = (p: string) => {
    if (priorities.includes(p)) {
      setPriorities(priorities.filter((item) => item !== p));
    } else {
      setPriorities([...priorities, p]);
    }
  };

  const handleReset = () => {
    setStep(0);
    setGender("");
    setFaceShape("");
    setStyle("");
    setPriorities([]);
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hello Darshana Optical,\n\nI used your Smart Frame Finder tool:\n` +
      `*Shopping For:* ${gender || "Any"}\n` +
      `*Face Shape:* ${faceShape || "Not Sure"}\n` +
      `*Preferred Style:* ${style || "General"}\n` +
      `*Priorities:* ${priorities.join(", ") || "Comfort"}\n\n` +
      `Please show me matching frames during my visit!`
    );
    window.open(`https://wa.me/918870571536?text=${msg}`, "_blank");
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-surface-warm py-12 sm:py-20">
        <div className="container-brand max-w-3xl mx-auto">
          {/* Tool Outer Card */}
          <div className="overflow-hidden rounded-3xl bg-white p-6 sm:p-10 border border-neutral-200/80 shadow-xl relative">
            {/* Top Progress Bar */}
            {step >= 1 && step <= 4 && (
              <div className="mb-8">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-2 uppercase tracking-wider">
                  <span>Step 0{step} of 04</span>
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
              {/* STEP 0: INTRO */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="text-center space-y-6 py-6"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-orange-soft text-brand-orange shadow-md">
                    <Glasses size={32} />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950">
                    Let&apos;s Find Your Frame 👓
                  </h1>
                  <p className="text-base text-neutral-600 max-w-md mx-auto font-medium leading-relaxed">
                    Answer a few quick questions and we&apos;ll suggest frame styles tailored to your face shape, style preference, and budget.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-primary gap-2 text-base font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
                    >
                      Start Finder <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: GENDER */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-neutral-950">Who are you shopping for?</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {["Men", "Women", "Kids", "No Preference"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setGender(opt);
                          setStep(2);
                        }}
                        className={`p-5 rounded-2xl border text-left font-bold text-base transition-all cursor-pointer ${
                          gender === opt
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

              {/* STEP 2: FACE SHAPE */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-neutral-950">What&apos;s your face shape?</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { name: "Round", desc: "Soft circular lines" },
                      { name: "Oval", desc: "Balanced proportions" },
                      { name: "Square", desc: "Strong jaw & forehead" },
                      { name: "Heart", desc: "Wider forehead, slender chin" },
                      { name: "Not Sure", desc: "We will measure in store" },
                    ].map((opt) => (
                      <button
                        key={opt.name}
                        onClick={() => {
                          setFaceShape(opt.name);
                          setStep(3);
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          faceShape === opt.name
                            ? "bg-brand-orange text-white border-brand-orange shadow-md"
                            : "bg-neutral-50 border-neutral-200/80 text-neutral-900 hover:bg-white hover:border-brand-orange"
                        }`}
                      >
                        <div className="font-bold text-sm">{opt.name}</div>
                        <div className={`text-[11px] mt-0.5 ${faceShape === opt.name ? "text-white/80" : "text-neutral-500"}`}>
                          {opt.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: STYLE */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-neutral-950">What&apos;s your preferred style?</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {["Minimal", "Professional", "Classic", "Trendy", "Bold", "Sporty"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setStyle(opt);
                          setStep(4);
                        }}
                        className={`p-5 rounded-2xl border text-center font-bold text-sm transition-all cursor-pointer ${
                          style === opt
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

              {/* STEP 4: PRIORITIES (MULTI-SELECT) */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-950">What matters most?</h2>
                    <p className="text-xs text-neutral-500 mt-1">Select all that apply to you.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {["Lightweight", "Durability", "Comfort", "Premium Look", "Budget", "Flexible Fit"].map((opt) => {
                      const isSel = priorities.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => handleTogglePriority(opt)}
                          className={`p-4 rounded-2xl border text-left flex items-center justify-between font-bold text-xs transition-all cursor-pointer ${
                            isSel
                              ? "bg-neutral-900 text-white border-neutral-900 shadow-md"
                              : "bg-neutral-50 border-neutral-200/80 text-neutral-800 hover:bg-white"
                          }`}
                        >
                          <span>{opt}</span>
                          {isSel && <Check size={16} className="text-brand-orange" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => setStep(5)}
                      className="btn-primary gap-2 text-sm font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
                    >
                      See Matches <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: RESULTS */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={12} /> Matching Complete
                  </span>

                  <h2 className="text-3xl font-extrabold text-neutral-950">Your Frame Matches</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
                    <div className="rounded-2xl bg-neutral-50 p-6 border border-neutral-200/80">
                      <h3 className="text-lg font-bold text-brand-orange">Rectangle & Square Frames</h3>
                      <p className="mt-1 text-xs text-neutral-600 font-medium leading-relaxed">
                        A great option to explore based on your selected {faceShape || "Oval"} face geometry and {style || "Classic"} aesthetic.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-neutral-50 p-6 border border-neutral-200/80">
                      <h3 className="text-lg font-bold text-brand-orange">Lightweight TR90 & Metal</h3>
                      <p className="mt-1 text-xs text-neutral-600 font-medium leading-relaxed">
                        Matches your key priorities: {priorities.join(", ") || "Comfort & Durability"}.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-wrap justify-center gap-4">
                    <Link href="/frames" className="btn-primary">
                      View Frames
                    </Link>
                    <button
                      onClick={handleShareWhatsApp}
                      className="btn-secondary gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                    >
                      <MessageCircle size={18} /> Show Results In Store
                    </button>
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                    >
                      <RotateCcw size={14} /> Start Over
                    </button>
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
