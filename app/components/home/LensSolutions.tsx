import { ShieldCheck, Sun, Car, Feather, Infinity as InfinityIcon } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../motion/Reveal";
import { StaggerGroup, StaggerItem } from "../motion/StaggerGroup";
import LensBeforeAfterSlider from "./LensBeforeAfterSlider";

const LENSES = [
  { icon: ShieldCheck, title: "Blue Protect Lenses", desc: "For screen time & digital eyes", color: "text-blue-500", bg: "bg-blue-50" },
  { icon: Sun, title: "Photochromic Lenses", desc: "Adapts to light, indoors & outdoors", color: "text-yellow-600", bg: "bg-yellow-50" },
  { icon: Car, title: "Night Drive Lenses", desc: "Clear vision, safe driving", color: "text-orange-500", bg: "bg-orange-50" },
  { icon: Feather, title: "Thin & Light Lenses", desc: "High power, light weight", color: "text-purple-500", bg: "bg-purple-50" },
  { icon: InfinityIcon, title: "Progressive Lenses", desc: "One lens, all distances", color: "text-cyan-500", bg: "bg-cyan-50" },
];

export default function LensSolutions() {
  return (
    <section id="lenses" className="bg-white py-16 md:py-24" data-lens-cursor="true" data-lens-text="Lens Clarity">
      <div className="container-brand">
        <Reveal variant="up">
          <SectionHeading
            title="Lens Solutions for Every Lifestyle"
            action={{ label: "View All Lenses", href: "#" }}
          />
        </Reveal>
        <StaggerGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" stagger={0.08}>
          {LENSES.map((lens) => (
            <StaggerItem key={lens.title}>
              <div className="h-full rounded-2xl border border-border-default p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${lens.bg} ${lens.color} transition-transform duration-300 group-hover:scale-110`}>
                  <lens.icon size={20} strokeWidth={1.75} />
                </span>
                <p className="text-sm font-semibold text-neutral-900">{lens.title}</p>
                <p className="mt-1 text-xs leading-[18px] text-text-muted">{lens.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Interactive Lens Technology Before/After Comparison */}
        <Reveal variant="up" delay={0.15}>
          <LensBeforeAfterSlider />
        </Reveal>
      </div>
    </section>
  );
}
