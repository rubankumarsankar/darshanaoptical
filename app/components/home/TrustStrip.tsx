import { ScanEye, Glasses, ShieldCheck, Sun, Eye } from "lucide-react";
import Reveal from "../motion/Reveal";

const ITEMS = [
  { icon: ScanEye, label: "Eye Testing" },
  { icon: Glasses, label: "Premium Frames" },
  { icon: ShieldCheck, label: "Progressive Lenses" },
  { icon: Sun, label: "Blue Protect" },
  { icon: Eye, label: "Sunglasses" },
];

export default function TrustStrip() {
  return (
    <div className="border-b border-border-default bg-white">
      <Reveal variant="fade" className="container-brand">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-4 sm:justify-between">
          {ITEMS.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-2 text-xs font-semibold tracking-[0.06em] text-neutral-600 uppercase"
            >
              <item.icon size={16} strokeWidth={2} className="text-brand-orange" />
              {item.label}
            </span>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
