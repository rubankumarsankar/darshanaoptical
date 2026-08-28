import { CalendarCheck, MessageCircle } from "lucide-react";
import Button from "../ui/Button";
import Reveal from "../motion/Reveal";

export default function CTABanner() {
  return (
    <section id="book" className="bg-white pb-16 md:pb-24">
      <div className="container-brand">
        <Reveal variant="up" className="flex flex-col items-start gap-6 rounded-xl bg-surface-dark px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-12">
          <div>
            <h3 className="text-h5 leading-8 font-semibold text-white sm:text-h4 sm:leading-9">
              Ready for Clearer Vision?
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Book an appointment today and experience the Darshana Optical
              difference.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Button href="#" variant="primary" icon={CalendarCheck}>
              Book Eye Test
            </Button>
            <Button href="#" variant="secondary" icon={MessageCircle} className="!bg-transparent !border-white/25 !text-white hover:!bg-white/10">
              WhatsApp Us
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
