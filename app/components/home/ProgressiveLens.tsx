"use client";

import { Car, Monitor, BookOpen, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import Button from "../ui/Button";
import Reveal from "../motion/Reveal";

const ZONES = [
  { icon: Car, title: "Distance", desc: "Drive, TV, Outdoors" },
  { icon: Monitor, title: "Intermediate", desc: "Computer, Dashboard" },
  { icon: BookOpen, title: "Near", desc: "Reading, Mobile" },
];

function ZoneGlow({ index, activeZone }: { index: number; activeZone: MotionValue<number> }) {
  const opacity = useTransform(activeZone, (v) => (Math.round(v) === index ? 0.35 : 0));
  return (
    <motion.div
      className="absolute inset-x-0"
      style={{
        top: `${index * 33.33}%`,
        height: "33.33%",
        opacity,
        background: "linear-gradient(180deg, rgba(252,90,6,0.35), rgba(252,90,6,0))",
      }}
    />
  );
}

function ZoneCard({
  index,
  activeZone,
  icon: Icon,
  title,
  desc,
  reduced,
}: {
  index: number;
  activeZone: MotionValue<number>;
  icon: LucideIcon;
  title: string;
  desc: string;
  reduced: boolean;
}) {
  const opacity = useTransform(activeZone, (v) => (Math.round(v) === index ? 1 : 0.5));
  const scale = useTransform(activeZone, (v) => (Math.round(v) === index ? 1 : 0.97));

  return (
    <motion.div
      className="flex items-start gap-2.5"
      style={reduced ? {} : { opacity, scale }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange">
        <Icon size={15} strokeWidth={2} />
      </span>
      <div>
        <p className="text-xs font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-[11px] leading-3.5 text-neutral-500">{desc}</p>
      </div>
    </motion.div>
  );
}

export default function ProgressiveLens() {
  const prefersReduced = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start 0.8", "end 0.3"],
  });

  // 0 -> distance zone glows, 1 -> intermediate, 2 -> near
  const activeZone = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [0, 0, 1, 2]);

  return (
    <section id="progressive" className="bg-white pb-16 md:pb-24" data-lens-cursor="true" data-lens-text="Progressive Story">
      <div className="container-brand">
        <div
          ref={sceneRef}
          className="grid grid-cols-1 items-center gap-10 overflow-hidden rounded-2xl bg-surface-dark px-6 py-12 sm:px-10 sm:py-14 lg:grid-cols-2 lg:gap-8 shadow-2xl"
        >
          <Reveal variant="up">
            <p className="mb-3 text-xs font-bold tracking-[0.08em] text-brand-orange uppercase">
              One Pair, Every Distance
            </p>
            <h3 className="text-h4 leading-9 font-semibold text-white sm:text-h3 sm:leading-11">
              Experience Seamless Vision with Progressive Lenses
            </h3>
            <p className="mt-4 max-w-md text-sm leading-6 text-neutral-400">
              See clearly at every distance — near, intermediate and far —
              with smooth transitions and zero line dividers.
            </p>
            <Button href="#" variant="primary" className="mt-7">
              Explore Progressive Lenses
            </Button>
          </Reveal>

          <div className="flex items-center gap-4 lg:gap-8">
            <div className="relative flex-1 aspect-[4/3] sm:aspect-video flex items-center justify-center overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950">
              {/* Dynamic Lens Zone Background Scene */}
              <img
                src="/images/lens-progressive.jpg"
                alt="Progressive Lenses"
                className="w-full h-full object-cover opacity-75 transition-all duration-700"
              />

              {/* Glowing Active Optical Zone Highlights */}
              {!prefersReduced &&
                [0, 1, 2].map((i) => <ZoneGlow key={i} index={i} activeZone={activeZone} />)}

              {/* Lens Outer Frame Silhouette */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-white/20 shadow-inner" />
            </div>

            <div className="flex flex-col justify-center gap-6 sm:gap-8 min-w-[140px]">
              {ZONES.map((zone, i) => (
                <ZoneCard
                  key={zone.title}
                  index={i}
                  activeZone={activeZone}
                  icon={zone.icon}
                  title={zone.title}
                  desc={zone.desc}
                  reduced={!!prefersReduced}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
