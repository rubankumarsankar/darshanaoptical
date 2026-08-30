"use client";

import { motion } from "framer-motion";
import { Award, Eye, Glasses } from "lucide-react";
import {
  MoultLogo,
  SizzlerCurveLogo,
  RexterLogo,
  SizzlerTR90Logo,
  LegendLogo,
  EnterprisesLogo,
  AshLogo,
} from "../ui/BrandLogos";

export const FRAME_BRANDS = [
  {
    name: "Moult",
    desc: "Handcrafted Acetate & Titanium",
    tag: "Exclusive Frame",
    logoComponent: MoultLogo,
    img: "/images/frame-1.jpg",
  },
  {
    name: "Sizzler Curve",
    desc: "Ergonomic Contour Fitting",
    tag: "Curved Fit",
    logoComponent: SizzlerCurveLogo,
    img: "/images/frame-2.jpg",
  },
  {
    name: "Rexter",
    desc: "Robust & Stylish Modern Frames",
    tag: "Contemporary",
    logoComponent: RexterLogo,
    img: "/images/frame-3.jpg",
  },
  {
    name: "Sizzler TR90",
    desc: "Ultra-Lightweight Flexible TR90",
    tag: "Lightweight",
    logoComponent: SizzlerTR90Logo,
    img: "/images/frame-4.jpg",
  },
  {
    name: "Legend",
    desc: "Classic Executive Iconic Eyewear",
    tag: "Heritage",
    logoComponent: LegendLogo,
    img: "/images/frame-5.jpg",
  },
];

export const LENS_BRANDS = [
  {
    name: "Enterprises Lenses",
    desc: "Enterprise Precision Optical Optics (Single Vision & AR Coatings)",
    tag: "Authorized Lens Partner",
    logoComponent: EnterprisesLogo,
  },
  {
    name: "Ash Lenses",
    desc: "Ash Advanced HD Digital Lenses (High Definition Progressives)",
    tag: "Authorized Lens Partner",
    logoComponent: AshLogo,
  },
];

export default function BrandBar() {
  return (
    <section className="bg-white py-14 border-y border-neutral-200/80">
      <div className="container-brand space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
            <Award size={14} /> Official Brand Stockist
          </span>
          <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
            Authorized Frame & Lens Brands
          </h2>
          <p className="text-sm text-neutral-600 font-medium">
            At Darshana Optical, we exclusively stock genuine, certified frame collections & lens enterprise partners.
          </p>
        </div>

        {/* 1. Frame Brands Logos & Product Cards */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-4 flex items-center gap-2">
            <Glasses size={18} />
            <span>Featured Frame Brands (Moult, Sizzler Curve, Rexter, Sizzler TR90, Legend)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {FRAME_BRANDS.map((brand) => {
              const Logo = brand.logoComponent;
              return (
                <motion.div
                  key={brand.name}
                  whileHover={{ y: -4 }}
                  className="flex flex-col justify-between rounded-2xl bg-neutral-50 p-5 border border-neutral-200/80 shadow-sm hover:border-brand-orange hover:bg-white hover:shadow-xl transition-all group"
                >
                  <div>
                    {/* Frame Image Preview */}
                    <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-neutral-200 mb-4 border border-neutral-200">
                      <img
                        src={brand.img}
                        alt={brand.name}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-2 right-2 rounded-md bg-neutral-950/80 px-2 py-0.5 text-[9px] font-extrabold text-white backdrop-blur-md uppercase">
                        {brand.name}
                      </span>
                    </div>

                    {/* Logo Header */}
                    <div className="mb-2 py-1 border-b border-neutral-100 flex items-center justify-center">
                      <Logo />
                    </div>

                    <div className="text-xs text-neutral-600 font-medium text-center mt-2 leading-relaxed">
                      {brand.desc}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-200/60 flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    <span>{brand.tag}</span>
                    <span className="text-brand-orange font-bold">100% Original</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 2. Lens Brands Logos */}
        <div className="pt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-orange mb-4 flex items-center gap-2">
            <Eye size={18} />
            <span>Authorized Lens Enterprises (Enterprises & Ash)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {LENS_BRANDS.map((brand) => {
              const Logo = brand.logoComponent;
              return (
                <motion.div
                  key={brand.name}
                  whileHover={{ y: -3 }}
                  className="flex items-center gap-5 rounded-2xl bg-brand-orange-soft/40 p-6 border border-brand-orange/30 shadow-sm text-left group"
                >
                  <div className="flex h-16 w-36 shrink-0 items-center justify-center rounded-xl bg-white p-3 border border-brand-orange/20 shadow-xs">
                    <Logo />
                  </div>
                  <div>
                    <div className="inline-block rounded-full bg-brand-orange text-white px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider mb-1.5">
                      {brand.tag}
                    </div>
                    <div className="font-extrabold text-base text-neutral-950">
                      {brand.name}
                    </div>
                    <div className="text-xs text-neutral-600 font-medium leading-relaxed mt-0.5">
                      {brand.desc}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
