"use client";

import Button from "../ui/Button";
import Reveal from "../motion/Reveal";
import { motion } from "framer-motion";

export default function OfferBanner() {
  return (
    <section id="offers" className="bg-white pb-16 md:pb-24">
      <div className="container-brand">
        <Reveal variant="focus">
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 items-center gap-6 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-orange to-amber-600 sm:grid-cols-2 shadow-xl"
          >
            <div className="px-6 py-10 sm:px-10 sm:py-12">
              <span className="relative mb-3 inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold tracking-[0.08em] text-white uppercase backdrop-blur-xs shadow-xs">
                🔥 Limited Offer
                <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              </span>
              <h3 className="text-h4 leading-9 font-bold text-white sm:text-3xl">
                Computer Glasses
                <br />
                Starting From ₹1,499*
              </h3>
              <p className="mt-2 text-sm text-white/95 font-medium">Frame + Blue Protect Anti-Glare Lens Included</p>
              <Button href="#" variant="dark" className="mt-6 shadow-md">
                Shop Offer Now →
              </Button>
            </div>
            <div className="relative aspect-4/3 overflow-hidden bg-brand-orange-hover sm:aspect-auto sm:h-full sm:min-h-[240px]">
              <img
                src="/images/offer-glasses.jpg"
                alt="Computer Glasses Offer"
                className="h-full w-full object-cover object-center mix-blend-multiply opacity-90 transition-transform duration-500 hover:scale-105"
              />
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
