"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sun, Car, Sparkles, Sliders } from "lucide-react";

const MODES = [
  {
    id: "anti-glare",
    label: "Anti-Reflection",
    icon: Sparkles,
    beforeImg: "/images/cat-office.jpg",
    afterImg: "/images/frame-1.jpg",
    beforeLabel: "Standard Lens (Glare & Reflections)",
    afterLabel: "AR Coated (Crystal Clear Vision)",
  },
  {
    id: "blue-protect",
    label: "Blue Protect",
    icon: ShieldCheck,
    beforeImg: "/images/cat-kids.jpg",
    afterImg: "/images/frame-4.jpg",
    beforeLabel: "High Digital Eye Strain",
    afterLabel: "Filtered Blue Light Protection",
  },
  {
    id: "night-drive",
    label: "Night Drive",
    icon: Car,
    beforeImg: "/images/frame-5.jpg",
    afterImg: "/images/cat-premium.jpg",
    beforeLabel: "Headlight Halo & Glare",
    afterLabel: "Enhanced Contrast Driving",
  },
  {
    id: "photochromic",
    label: "Photochromic",
    icon: Sun,
    beforeImg: "/images/cat-women.jpg",
    afterImg: "/images/cat-men.jpg",
    beforeLabel: "Indoors (Clear Lens)",
    afterLabel: "Outdoors (Smart Sun Tint)",
  },
];

export default function LensBeforeAfterSlider() {
  const [activeTab, setActiveTab] = useState(MODES[0].id);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMode = MODES.find((m) => m.id === activeTab) || MODES[0];

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging || e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="mt-12 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-md sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <Sliders size={14} /> Interactive Technology Demo
          </span>
          <h4 className="text-xl font-bold text-neutral-950 sm:text-2xl">
            See the Lens Difference
          </h4>
        </div>

        {/* Lens Mode Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = mode.id === activeTab;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveTab(mode.id);
                  setSliderPosition(50);
                }}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-brand-orange text-white shadow-sm scale-105"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                <Icon size={14} />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Slider Area */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative aspect-16/9 w-full select-none overflow-hidden rounded-xl bg-neutral-950 cursor-ew-resize touch-none"
      >
        {/* AFTER / WITH LENS IMAGE */}
        <img
          src={currentMode.afterImg}
          alt={currentMode.afterLabel}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute top-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          ✓ {currentMode.afterLabel}
        </div>

        {/* BEFORE / WITHOUT LENS IMAGE (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={currentMode.beforeImg}
            alt={currentMode.beforeLabel}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute top-4 left-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-md">
            ✕ {currentMode.beforeLabel}
          </div>
        </div>

        {/* DRAGGABLE DIVIDER HANDLE */}
        <div
          className="absolute inset-y-0 z-20 flex items-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="h-full w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="-ml-4 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-orange text-white shadow-lg"
          >
            <span className="text-[10px] font-bold">◄ ►</span>
          </motion.div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-neutral-400">
        Drag the handle left or right to compare lens clarity & protection
      </p>
    </div>
  );
}
