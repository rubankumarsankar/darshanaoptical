"use client";

import { CalendarCheck, MessageCircle } from "lucide-react";
import { useBooking } from "../booking/BookingContext";
import { motion } from "framer-motion";
import { EASE_STANDARD } from "../../lib/motion";

export default function CTABanner() {
  const { openBooking } = useBooking();

  const handleWhatsApp = () => {
    const msg = encodeURIComponent("Hello Darshana Optical, I would like to know more and book an eye test appointment.");
    window.open(`https://wa.me/919876543210?text=${msg}`, "_blank");
  };

  return (
    <section id="book" className="bg-white py-10 sm:py-14">
      <div className="container-brand">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: EASE_STANDARD }}
          className="flex flex-col items-start gap-6 rounded-3xl bg-[#1c1d22] px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-12 border border-neutral-800 shadow-2xl"
        >
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Ready for Clearer Vision?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-400">
              Book an appointment today and experience the Darshana Optical difference.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <motion.button
              onClick={openBooking}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-orange px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-brand-orange/20 hover:bg-brand-orange-hover transition-colors cursor-pointer"
            >
              <CalendarCheck size={16} />
              <span>Book Eye Test</span>
            </motion.button>
            <motion.button
              onClick={handleWhatsApp}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/80 px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <MessageCircle size={16} />
              <span>WhatsApp Us</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
