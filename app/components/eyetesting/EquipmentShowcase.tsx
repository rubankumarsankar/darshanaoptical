"use client";

import { motion } from "framer-motion";
import { Cpu, ShieldCheck, Activity, Eye, ScanLine } from "lucide-react";

const EQUIPMENT_LIST = [
  {
    name: "Digital Auto Refractometer",
    desc: "Measures refractive error quickly & accurately.",
    img: "/images/equip-1-autorefractometer.png",
  },
  {
    name: "Phoropter Unit",
    desc: "Advanced refraction for precise prescription accuracy.",
    img: "/images/equip-2-phoropter.png",
  },
  {
    name: "Retinal Imaging",
    desc: "High-resolution imaging for eye health assessment.",
    img: "/images/equip-3-retinal.png",
  },
  {
    name: "Icare Tonometer",
    desc: "Painless eye pressure measurement for glaucoma screening.",
    img: "/images/equip-4-tonometer.png",
  },
  {
    name: "Slit Lamp Biomicroscope",
    desc: "Detailed examination of anterior & posterior eye structures.",
    img: "/images/equip-5-slitlamp.png",
  },
];

export default function EquipmentShowcase() {
  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="container-brand space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-950 tracking-tight">
            Advanced Technology For Accurate Results
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 font-normal">
            We use world-class equipment to ensure precision and reliability.
          </p>
        </div>

        {/* Grid of Equipment */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {EQUIPMENT_LIST.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col rounded-2xl bg-white p-3.5 border border-neutral-100 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand-orange/30 cursor-pointer overflow-hidden"
            >
              {/* Image Container with subtle rounded background & Scan Line */}
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-[#faf8f5] mb-3 flex items-center justify-center p-2">
                <img
                  src={item.img}
                  alt={item.name}
                  className="h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-108"
                />

                {/* Laser Scan Line on Hover */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-brand-orange to-transparent opacity-0 shadow-[0_0_12px_#fc5a06] transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[scanline_2.5s_linear_infinite]" />
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-neutral-950 leading-snug group-hover:text-brand-orange transition-colors">
                {item.name}
              </h3>
              <p className="mt-1 text-[11px] sm:text-xs text-neutral-500 leading-relaxed font-normal">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
