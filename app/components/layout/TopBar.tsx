import { MapPin, Phone, Clock, Camera, Share2 } from "lucide-react";

export default function TopBar() {
  return (
    <div className="hidden bg-neutral-950 text-neutral-300 md:block">
      <div className="container-brand flex h-8 items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <MapPin size={13} strokeWidth={2} />
            Tiruppattur, Tamil Nadu
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={13} strokeWidth={2} />
            +91 98765 43210
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <Clock size={13} strokeWidth={2} />
            Mon - Sat : 9.30 AM - 8.30 PM
          </span>
          <div className="flex items-center gap-3">
            <Camera size={14} strokeWidth={2} />
            <Share2 size={14} strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
