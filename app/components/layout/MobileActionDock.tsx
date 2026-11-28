"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Home, MessageCircle, Phone } from "lucide-react";
import { useBooking } from "../booking/BookingContext";
import { useShopContact } from "../site/ShopContact";

export default function MobileActionDock() {
  const shop = useShopContact();
  const pathname = usePathname();
  const { openBooking } = useBooking();

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="mobile-action-dock" aria-label="Quick actions">
      <Link href="/" className={pathname === "/" ? "is-active" : ""}>
        <Home aria-hidden="true" />
        <span>Home</span>
      </Link>
      <a href={shop.tel}>
        <Phone aria-hidden="true" />
        <span>Call</span>
      </a>
      <button type="button" onClick={openBooking} className="mobile-action-dock__primary">
        <CalendarCheck aria-hidden="true" />
        <span>Book</span>
      </button>
      <a href={shop.whatsappUrl} target="_blank" rel="noreferrer">
        <MessageCircle aria-hidden="true" />
        <span>WhatsApp</span>
      </a>
    </nav>
  );
}
