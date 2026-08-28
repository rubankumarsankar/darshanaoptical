import { MapPin, Phone, MessageCircle, Store, ArrowRight } from "lucide-react";
import Button from "../ui/Button";
import ImagePlaceholder from "../ui/ImagePlaceholder";
import Reveal from "../motion/Reveal";
import { StaggerGroup, StaggerItem } from "../motion/StaggerGroup";

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
    <section id="gallery" className="bg-white py-16 md:py-24">
      <div className="container-brand grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Reveal variant="up">
            <h2 className="mb-6 text-[28px] leading-9 font-bold text-neutral-950 md:text-h3 md:leading-[44px]">
              Visit Our Store
            </h2>
            <p className="mb-6 -mt-4 text-sm text-text-muted">A glimpse of Darshana Optical</p>
          </Reveal>
          <StaggerGroup className="grid grid-cols-2 gap-4 sm:grid-cols-4" stagger={0.08}>
            {STORE_IMAGES.map((img, i) => (
              <StaggerItem key={i}>
                <div className="group relative aspect-3/4 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200 shadow-xs">
                  <img
                    src={img.src}
                    alt={img.title}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>

        <Reveal variant="up" delay={0.1} className="mt-10 lg:mt-0 lg:pl-10">
          <ul className="space-y-6 text-sm text-neutral-700">
            <li className="flex items-start gap-4">
              <MapPin size={24} strokeWidth={1.5} className="mt-0.5 shrink-0 text-neutral-400" />
              <div>
                 <p className="font-semibold text-neutral-900 text-base mb-1">Darshana Optical</p>
                 <p className="text-neutral-500">Main Road, Tirupattur,<br/>Tamil Nadu - 635601</p>
              </div>
            </li>
            <li className="flex items-center gap-4">
              <Phone size={24} strokeWidth={1.5} className="shrink-0 text-neutral-400" />
              <span className="text-neutral-500">+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-4">
              <MessageCircle size={24} strokeWidth={1.5} className="shrink-0 text-neutral-400" />
              <span className="text-neutral-500">WhatsApp Us</span>
            </li>
          </ul>
          <div className="mt-8">
            <Button href="#" variant="secondary" className="w-full sm:w-auto">
              Get Directions <ArrowRight size={16} strokeWidth={2} className="ml-2 inline-block" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
