"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { X } from "lucide-react";
import { useBooking } from "./BookingContext";
import BookingForm from "../site/book/BookingForm";
import s from "../site/site.module.css";
import { siteFontVars } from "../site/fonts";
import { useShopContact } from "../site/ShopContact";

const PERKS = ["Computerised testing", "Near & distance check", "No obligation to buy"] as const;

/**
 * The "Book eye test" popup opened from every page. It is the /book page's
 * design and the very same BookingForm, so both save bookings the same way.
 */
export default function BookingModal() {
  const shop = useShopContact();
  const { isOpen, closeBooking } = useBooking();
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Don't let the page behind scroll while the popup is open.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const onEscape = useEffectEvent(() => closeBooking());

  // Escape closes; Tab stays inside the popup.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
      if (event.key !== "Tab") return;
      const focusable = overlayRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    // Focus without scrolling, or the popup opens part-way down.
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={`${siteFontVars} ${s.root} ${s.bookOverlay}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeBooking();
      }}
      data-lenis-prevent
    >
      {/* Fixed to the screen corner, so it's always in reach however far the form is scrolled. */}
      <button type="button" onClick={closeBooking} aria-label="Close booking" className={s.bookClose}>
        <X size={24} strokeWidth={2.4} aria-hidden />
      </button>
      <div
        className={s.bookCenter}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeBooking();
        }}
      >
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="booking-title" tabIndex={-1} className={s.bookPanel}>
          <div className={s.bookAside}>
            <span className={s.eyebrow} style={{ fontSize: 13, color: "var(--orange)" }}>
              Free eye test
            </span>
            <h2 id="booking-title" className={s.display} style={{ margin: 0, fontSize: "clamp(26px, 4vw, 42px)", lineHeight: 1.04, fontWeight: 800, letterSpacing: "-0.03em" }}>
              Book your slot in under a minute.
            </h2>
            <p className={s.bookAsideLede} style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#BDBFC8" }}>
              Pick a day and time. We&apos;ll call to confirm, and the test takes about 15–20 minutes.
            </p>
            <ul className={s.bookPerks}>
              {PERKS.map((p) => (
                <li key={p} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--night-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange)", fontWeight: 800 }}>
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <a
              href={shop.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className={s.pill}
              style={{ alignSelf: "flex-start", height: 48, padding: "0 18px", borderRadius: 14, background: "#0F7A50", color: "#FFFFFF", fontSize: 14 }}
            >
              Prefer WhatsApp?
            </a>
          </div>

          <section aria-label="Booking form" className={s.bookForm}>
            <BookingForm />
          </section>
        </div>
      </div>
    </div>
  );
}
