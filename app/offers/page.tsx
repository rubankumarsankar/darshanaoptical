"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, Sparkles, MessageCircle, Info, ShieldCheck, CheckCircle2 } from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import WhatsAppButton from "../components/motion/WhatsAppButton";
import LensCursor from "../components/motion/LensCursor";

const OFFERS = [
  {
    id: "complete-package",
    title: "Complete Eyewear Package Offer",
    desc: "Selected frame + lens combinations available at special in-store package pricing.",
    tag: "Best Value",
    cta: "View Details",
  },
  {
    id: "lens-upgrade",
    title: "Lens Upgrade Offer",
    desc: "Receive complimentary anti-reflective coating upgrade on selected progressive and blue-filter lenses.",
    tag: "Popular Choice",
    cta: "Ask About Offer",
  },
  {
    id: "seasonal-promo",
    title: "Seasonal Family Offer",
    desc: "Limited-period promotional discounts when purchasing multiple frames or family eye test packages.",
    tag: "Limited Time",
    cta: "Enquire Now",
  },
];

const TERMS = [
  "Offer validity: Valid until active campaign end date or stock availability in store.",
  "Applicable products: Valid on selected frame brands, single vision, and progressive lens packages.",
  "Promotional combination: Cannot be combined with other ongoing store discounts unless specified.",
  "In-store availability: Available exclusively at Darshana Optical, Harur main store location.",
];

export default function OffersPage() {
  const handleWhatsAppOffer = (title: string) => {
    const msg = encodeURIComponent(`Hello Darshana Optical, I am inquiring about the current in-store offer: "${title}". Can you share full details?`);
    window.open(`https://wa.me/919876543210?text=${msg}`, "_blank");
  };

  return (
    <>
      <LensCursor />
      <Header />

      <main className="flex-1 bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-linear-to-b from-surface-warm via-white to-white py-16 sm:py-24">
          <div className="container-brand text-center max-w-4xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-orange-soft text-brand-orange text-xs font-bold uppercase tracking-wider">
              <Tag size={14} /> In-Store Specials
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-950 tracking-tight">
              Great Eyewear. <span className="text-brand-orange">More Value.</span>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto font-medium leading-relaxed">
              Discover current in-store promotions, frame & lens package bundles, and seasonal offers at Darshana Optical.
            </p>
          </div>
        </section>

        {/* Active Offers Grid */}
        <section className="py-16 bg-surface-warm border-y border-neutral-200/80">
          <div className="container-brand space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">Active Offers</h2>
              <p className="text-sm text-neutral-600 font-medium">
                Visit our Tirupattur store to redeem these exclusive in-store value packages.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {OFFERS.map((offer) => (
                <motion.div
                  key={offer.id}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-8 border border-neutral-200/80 shadow-sm transition-all hover:border-brand-orange hover:shadow-xl"
                >
                  <motion.div
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 rounded-full bg-brand-orange text-white px-3 py-1 text-[10px] font-extrabold uppercase shadow-xs overflow-hidden"
                  >
                    <span className="relative z-10">{offer.tag}</span>
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                  </motion.div>

                  <div>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange text-white font-bold shadow-md shadow-brand-orange/20">
                      <Tag size={22} />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-950 group-hover:text-brand-orange transition-colors">
                      {offer.title}
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-neutral-600 font-medium">
                      {offer.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-neutral-100">
                    <button
                      onClick={() => handleWhatsAppOffer(offer.title)}
                      className="w-full btn-primary justify-center text-xs font-bold gap-2 cursor-pointer"
                    >
                      <MessageCircle size={16} /> {offer.cta}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Offer Terms */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="container-brand max-w-4xl space-y-8">
            <div className="flex items-center gap-2 text-neutral-950 text-xl font-bold border-b border-neutral-100 pb-4">
              <Info size={20} className="text-brand-orange" />
              <span>Offer Terms & Conditions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TERMS.map((term, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl bg-neutral-50 p-4 border border-neutral-200/70 text-xs font-medium text-neutral-700">
                  <CheckCircle2 size={16} className="shrink-0 text-brand-orange mt-0.5" />
                  <span>{term}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-brand-dark text-white text-center">
          <div className="container-brand max-w-3xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Want to Know What&apos;s Available Today?
            </h2>
            <p className="text-base text-neutral-300 font-medium">
              Send us a message on WhatsApp for today&apos;s active inventory deals and package pricing.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleWhatsAppOffer("Today's Available Offers")}
                className="btn-primary gap-2 text-base font-bold shadow-lg shadow-brand-orange/20 cursor-pointer"
              >
                <MessageCircle size={20} /> WhatsApp Us
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
