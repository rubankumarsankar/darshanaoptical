import Link from "next/link";
import { ArrowRight, User, Users } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../motion/Reveal";
import { StaggerGroup, StaggerItem } from "../motion/StaggerGroup";

const CATEGORIES = [
  {
    label: "Men",
    image: "/images/cat-men.jpg",
  },
  {
    label: "Women",
    image: "/images/cat-women.jpg",
  },
  {
    label: "Kids",
    image: "/images/cat-kids.jpg",
  },
  {
    label: "Premium",
    image: "/images/cat-premium.jpg",
  },
  {
    label: "Office & Computer",
    image: "/images/cat-office.jpg",
  },
  {
    label: "Sunglasses",
    image: "/images/cat-sunglasses.jpg",
  },
];

export default function ShopByCategory() {
  return (
    <section id="categories" className="bg-white py-16 md:py-24">
      <div className="container-brand">
        <Reveal variant="up">
          <SectionHeading
            title="Shop By Category"
            action={{ label: "View All Collections", href: "#" }}
          />
        </Reveal>
        <StaggerGroup className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6" stagger={0.07}>
          {CATEGORIES.map((cat) => (
            <StaggerItem key={cat.label}>
              <Link
                href="#"
                className="group relative block overflow-hidden rounded-xl border border-border-default transition-all duration-normal hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-100">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-85 transition-opacity duration-normal group-hover:opacity-95" />
                <div className="absolute bottom-0 left-0 p-3 sm:p-4 w-full z-10">
                  <p className="text-sm sm:text-base font-semibold text-white leading-tight">{cat.label}</p>
                  <span className="mt-1 flex items-center gap-1 text-xs font-medium text-white/90">
                    Explore
                    <ArrowRight size={12} strokeWidth={2} className="transition-transform duration-fast group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
