"use client";

import { MapPin, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

const STORE_IMAGES = [
  {
    title: "Store Exterior",
    src: "/images/store-1.jpg",
  },
  {
    title: "Optical Lounge",
    src: "/images/store-2.jpg",
  },
  {
    title: "Eye Testing Clinic",
    src: "/images/store-3.jpg",
  },
  {
    title: "Frame Gallery",
    src: "/images/store-4.jpg",
  },
];

export default function StoreGallery() {
  return (
    <section id="gallery" className="bg-white py-12 sm:py-16 border-t border-neutral-100">
      <div className="container-brand">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Store Photos */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                Visit Our Store
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1">
                A glimpse of Darshana Optical
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              {STORE_IMAGES.map((img) => (
                <motion.div
                  key={img.title}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    show: {
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.45, ease: EASE_STANDARD },
                    },
                  }}
                  whileHover={{ y: -4 }}
                  className="group relative aspect-3/4 overflow-hidden rounded-2xl bg-neutral-100 border border-neutral-200 shadow-2xs cursor-pointer"
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Contact & Store Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.1, ease: EASE_STANDARD }}
            className="lg:col-span-4 bg-neutral-50 p-6 sm:p-7 rounded-2xl border border-neutral-200/80 space-y-6 shadow-xs"
          >
            <div className="space-y-4 text-xs sm:text-sm text-neutral-700">
              <div className="flex items-start gap-3.5">
                <MapPin size={20} className="text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-neutral-950">Darshana Optical</p>
                  <p className="text-neutral-500 text-xs mt-0.5 leading-relaxed">
                    Tvk nagar, salem bypass road, Vasanth & co opposite,
                    <br />
                    Harur – 636903
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 group">
                <Phone size={20} className="text-brand-orange shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <a
                  href="tel:+918870571536"
                  className="font-medium text-neutral-800 hover:text-brand-orange transition-colors"
                >
                  +91 88705 71536
                </a>
              </div>

              <div className="flex items-center gap-3.5 group">
                <MessageCircle size={20} className="text-brand-orange shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <a
                  href="https://wa.me/918870571536"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-neutral-800 hover:text-brand-orange transition-colors"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>

            <div className="pt-2">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="https://maps.google.com/?q=Darshana+Optical+Harur"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-orange/40 bg-white py-3 text-xs sm:text-sm font-bold text-brand-orange shadow-xs hover:bg-brand-orange hover:text-white transition-all cursor-pointer"
              >
                <span>Get Directions</span>
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-1" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
