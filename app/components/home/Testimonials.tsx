import { Star, User } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../motion/Reveal";
import { StaggerGroup, StaggerItem } from "../motion/StaggerGroup";

const CUSTOMERS = [
  "/images/avatar-1.jpg",
  "/images/avatar-2.jpg",
  "/images/avatar-3.jpg",
  "/images/avatar-4.jpg",
  "/images/avatar-5.jpg",
];

export default function Testimonials() {
  return (
    <section className="bg-surface-warm py-16 md:py-24">
      <div className="container-brand">
        <Reveal variant="up">
          <SectionHeading title="What Our Customers Say" action={{ label: "View All Reviews", href: "#" }} />
        </Reveal>
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Reveal variant="up" className="max-w-lg rounded-2xl bg-white p-6 shadow-sm sm:p-7 border border-neutral-100">
            <div className="mb-3 flex items-center gap-1 text-warning">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <p className="text-sm leading-6 text-neutral-700 font-medium">
              &ldquo;Excellent eye testing and very professional staff. Loved
              the collection and services!&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <img
                src={CUSTOMERS[0]}
                alt="Priya S."
                className="h-11 w-11 rounded-full object-cover border-2 border-brand-orange-soft"
              />
              <div>
                <p className="text-sm font-semibold text-neutral-900">Priya S.</p>
                <p className="text-xs text-text-muted">Google Review</p>
              </div>
            </div>
          </Reveal>

          <StaggerGroup className="flex items-center gap-3" stagger={0.08}>
            {CUSTOMERS.map((imgUrl, i) => (
              <StaggerItem key={i}>
                <img
                  src={imgUrl}
                  alt={`Customer ${i + 1}`}
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm transition-transform duration-300 hover:scale-110"
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
