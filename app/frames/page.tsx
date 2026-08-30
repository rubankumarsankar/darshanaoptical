"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, MessageCircle, MapPin, Search, ArrowRight, ShieldCheck, Check, Tag } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";
import BrandBar from "../components/home/BrandBar";
import {
  MoultLogo,
  SizzlerCurveLogo,
  RexterLogo,
  SizzlerTR90Logo,
  LegendLogo,
} from "../components/ui/BrandLogos";

interface FrameProduct {
  id: string;
  name: string;
  brand: "Moult" | "Sizzler Curve" | "Rexter" | "Sizzler TR90" | "Legend";
  category: "Men" | "Women" | "Kids";
  style: "Rectangle" | "Round" | "Square" | "Aviator" | "Cat Eye" | "Rimless" | "Half Rim";
  material: "Metal" | "Acetate" | "TR / Lightweight" | "Combination";
  image: string;
  logoComponent: React.ComponentType;
}

const FRAMES_DATA: FrameProduct[] = [
  { id: "MOULT-01", name: "Moult Handcrafted Acetate Classic", brand: "Moult", category: "Men", style: "Rectangle", material: "Acetate", image: "/images/frame-1.jpg", logoComponent: MoultLogo },
  { id: "SIZZLER-C1", name: "Sizzler Curve Ergonomic Matte Gunmetal", brand: "Sizzler Curve", category: "Men", style: "Aviator", material: "Metal", image: "/images/frame-2.jpg", logoComponent: SizzlerCurveLogo },
  { id: "REXTER-101", name: "Rexter Bold Tortoise Square", brand: "Rexter", category: "Women", style: "Square", material: "Acetate", image: "/images/frame-3.jpg", logoComponent: RexterLogo },
  { id: "SIZZLER-TR1", name: "Sizzler TR90 Featherlight Flex", brand: "Sizzler TR90", category: "Women", style: "Round", material: "TR / Lightweight", image: "/images/frame-4.jpg", logoComponent: SizzlerTR90Logo },
  { id: "LEGEND-505", name: "Legend Executive Wayfarer Premium", brand: "Legend", category: "Men", style: "Rectangle", material: "Acetate", image: "/images/frame-5.jpg", logoComponent: LegendLogo },
  { id: "MOULT-02", name: "Moult Rose Gold Feminine Elegance", brand: "Moult", category: "Women", style: "Cat Eye", material: "Metal", image: "/images/frame-6.jpg", logoComponent: MoultLogo },
  { id: "SIZZLER-TR2", name: "Sizzler TR90 Kids Flexible Comfort", brand: "Sizzler TR90", category: "Kids", style: "Round", material: "TR / Lightweight", image: "/images/cat-kids.jpg", logoComponent: SizzlerTR90Logo },
  { id: "REXTER-202", name: "Rexter Ultra-Light Half Rim Steel", brand: "Rexter", category: "Men", style: "Half Rim", material: "Combination", image: "/images/frame-finder.jpg", logoComponent: RexterLogo },
  { id: "LEGEND-909", name: "Legend Rimless Air Titanium", brand: "Legend", category: "Women", style: "Rimless", material: "Metal", image: "/images/cat-women.jpg", logoComponent: LegendLogo },
  { id: "SIZZLER-C2", name: "Sizzler Curve Sport Contour Frame", brand: "Sizzler Curve", category: "Men", style: "Rectangle", material: "Combination", image: "/images/cat-men.jpg", logoComponent: SizzlerCurveLogo },
];

const BRANDS = ["All", "Moult", "Sizzler Curve", "Rexter", "Sizzler TR90", "Legend"];
const CATEGORIES = [
  { title: "Men", desc: "Classic, professional, sporty, and contemporary designs.", img: "/images/cat-men.jpg", count: "450+ Styles" },
  { title: "Women", desc: "Elegant, minimal, colourful, and statement eyewear.", img: "/images/cat-women.jpg", count: "500+ Styles" },
  { title: "Kids", desc: "Comfortable, flexible, and practical frames for younger wearers.", img: "/images/cat-kids.jpg", count: "150+ Styles" },
];
const STYLES = ["All", "Rectangle", "Round", "Square", "Aviator", "Cat Eye", "Rimless", "Half Rim"];
const MATERIALS = ["All", "Metal", "Acetate", "TR / Lightweight", "Combination"];

const FACE_SHAPES = [
  { shape: "Round Face", rec: "Angular / Rectangular options add structure and definition." },
  { shape: "Square Face", rec: "Rounder / Softer shapes soften strong jawlines." },
  { shape: "Oval Face", rec: "Broad range of styles work effortlessly with balanced proportions." },
  { shape: "Heart Face", rec: "Balanced / Lightweight frames wider than the forehead." },
];

export default function FramesPage() {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedStyle, setSelectedStyle] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFrames = FRAMES_DATA.filter((frame) => {
    const brandMatch = selectedBrand === "All" || frame.brand === selectedBrand;
    const styleMatch = selectedStyle === "All" || frame.style === selectedStyle;
    const materialMatch = selectedMaterial === "All" || frame.material === selectedMaterial;
    const categoryMatch = selectedCategory === "All" || frame.category === selectedCategory;
    return brandMatch && styleMatch && materialMatch && categoryMatch;
  });

  const handleWhatsAppEnquire = (frameName: string, brand: string) => {
    const msg = encodeURIComponent(`Hello Darshana Optical, I am interested in inquiring about the official ${brand} frame: "${frameName}". Is it available in store?`);
    window.open(`https://wa.me/919876543210?text=${msg}`, "_blank");
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-surface-warm via-white to-white py-16 sm:py-24">
          <div className="container-brand text-center max-w-4xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Official Brand Stockist
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight">
              Find Your Perfect Frame
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Featuring authorized frame collections from <span className="font-bold text-neutral-900">Moult</span>, <span className="font-bold text-neutral-900">Sizzler Curve</span>, <span className="font-bold text-neutral-900">Rexter</span>, <span className="font-bold text-neutral-900">Sizzler TR90</span>, and <span className="font-bold text-neutral-900">Legend</span>.
            </p>
            <div className="pt-2">
              <Link
                href="/frame-finder"
                className="btn-primary gap-2 text-base font-bold shadow-lg shadow-brand-orange/20"
              >
                Find My Frame →
              </Link>
            </div>
          </div>
        </section>

        {/* Brand Bar Section */}
        <BrandBar />

        {/* Shop by Category */}
        <section className="py-16 bg-surface-warm border-b border-neutral-200/80">
          <div className="container-brand space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950">Shop by Category</h2>
              <p className="text-sm text-neutral-600">Tailored eyewear collections for every member of your family.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.title}
                  onClick={() => setSelectedCategory(selectedCategory === cat.title ? "All" : cat.title)}
                  className={`group relative overflow-hidden rounded-2xl bg-white p-6 border transition-all cursor-pointer ${
                    selectedCategory === cat.title
                      ? "border-brand-orange ring-2 ring-brand-orange/20 shadow-xl"
                      : "border-neutral-200/80 hover:border-brand-orange/50 hover:shadow-lg"
                  }`}
                >
                  <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-neutral-100 mb-6">
                    <img
                      src={cat.img}
                      alt={cat.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold text-brand-orange backdrop-blur-md">
                      {cat.count}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-950 group-hover:text-brand-orange transition-colors">
                    {cat.title} Eyewear
                  </h3>
                  <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-medium">
                    {cat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Bar: Brands, Style, Material */}
        <section className="py-12 border-b border-neutral-200/80 bg-white sticky top-[72px] z-20 shadow-xs">
          <div className="container-brand space-y-6">
            {/* Filter by Frame Brand */}
            <div>
              <div className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Tag size={14} /> Filter by Authorized Brand
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {BRANDS.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedBrand === brand
                        ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20"
                        : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse by Style */}
            <div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                Browse by Style
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {STYLES.map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedStyle === style
                        ? "bg-neutral-900 text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse by Material */}
            <div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                Browse by Material
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {MATERIALS.map((mat) => (
                  <button
                    key={mat}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedMaterial === mat
                        ? "bg-neutral-900 text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {mat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Frame Product Grid */}
        <section className="py-16 bg-white">
          <div className="container-brand space-y-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h2 className="text-xl font-bold text-neutral-950">
                Official In-Store Frame Collection ({filteredFrames.length})
              </h2>
              {(selectedBrand !== "All" || selectedStyle !== "All" || selectedMaterial !== "All" || selectedCategory !== "All") && (
                <button
                  onClick={() => {
                    setSelectedBrand("All");
                    setSelectedStyle("All");
                    setSelectedMaterial("All");
                    setSelectedCategory("All");
                  }}
                  className="text-xs font-semibold text-brand-orange hover:underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFrames.map((frame) => {
                const LogoComp = frame.logoComponent;
                return (
                  <motion.div
                    key={frame.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 border border-neutral-200/80 shadow-sm transition-all duration-300 hover:border-brand-orange hover:shadow-xl"
                  >
                    <div>
                      {/* Image Frame Preview */}
                      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-neutral-100 mb-6 p-4 flex items-center justify-center">
                        <img
                          src={frame.image}
                          alt={frame.name}
                          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 rounded-md bg-brand-orange text-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                          {frame.brand}
                        </span>
                        <span className="absolute top-3 right-3 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                          In Store
                        </span>
                      </div>

                      {/* Brand Logo Header */}
                      <div className="mb-3 py-1.5 px-3 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                        <LogoComp />
                      </div>

                      <div className="text-xs font-semibold text-neutral-400 mb-1">
                        {frame.category} • {frame.style} • {frame.material}
                      </div>

                      <h3 className="text-base font-bold text-neutral-950 group-hover:text-brand-orange transition-colors">
                        {frame.name}
                      </h3>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <button
                        onClick={() => handleWhatsAppEnquire(frame.name, frame.brand)}
                        className="inline-flex items-center w-full justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <MessageCircle size={14} /> Enquire Availability
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Face Shape Guide */}
        <section className="py-16 sm:py-24 bg-surface-warm border-t border-neutral-200/80">
          <div className="container-brand space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange-soft px-3 py-1 rounded-full">
                Styling Advice
              </span>
              <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                Which Frame Shape Suits You?
              </h2>
              <p className="text-sm text-neutral-600 font-medium">
                Matching your frame shape to your face geometry balances features and enhances natural aesthetics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FACE_SHAPES.map((item) => (
                <div
                  key={item.shape}
                  className="rounded-2xl bg-white p-6 border border-neutral-200/80 shadow-sm text-center space-y-3"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange-soft text-brand-orange font-bold text-lg">
                    {item.shape[0]}
                  </div>
                  <h3 className="text-base font-bold text-neutral-950">{item.shape}</h3>
                  <p className="text-xs leading-relaxed text-neutral-600 font-medium">{item.rec}</p>
                </div>
              ))}
            </div>

            <div className="text-center pt-4">
              <Link
                href="/frame-finder"
                className="btn-primary gap-2 text-sm font-bold shadow-md shadow-brand-orange/20"
              >
                Try Smart Frame Finder →
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-brand-dark text-white text-center">
          <div className="container-brand max-w-3xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Still Not Sure?</h2>
            <p className="text-base text-neutral-300 font-medium">
              Let our team at Tirupattur help you find a Moult, Sizzler Curve, Rexter, Sizzler TR90, or Legend frame that fits your face shape, prescription, style, and budget.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <a
                href="https://maps.google.com/?q=Darshana+Optical+Tirupattur"
                target="_blank"
                rel="noreferrer"
                className="btn-primary gap-2"
              >
                <MapPin size={18} /> Visit Store
              </a>
              <Link href="/frame-finder" className="btn-secondary">
                Find My Frame
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
