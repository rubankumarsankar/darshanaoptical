"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { X } from "lucide-react";
import { useBooking } from "./BookingContext";
import BookingForm from "../site/book/BookingForm";
import s from "../site/site.module.css";
import { siteFontVars } from "../site/fonts";
import { WHATSAPP_URL } from "../site/data";

const PERKS = ["Computerised testing", "Near & distance check", "No obligation to buy"] as const;

/**
 * The "Book eye test" popup opened from every page. It is the /book page's
 * design and the very same BookingForm, so both save bookings the same way.
 */
export default function BookingModal() {
  const { isOpen, closeBooking } = useBooking();
  const dialogRef = useRef<HTMLDivElement>(null);

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
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
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
      className={`${siteFontVars} ${s.root}`}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(20, 20, 24, 0.6)", overflowY: "auto", overscrollBehavior: "contain" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeBooking();
      }}
      data-lenis-prevent
    >
      <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(12px, 3vw, 32px)", boxSizing: "border-box" }}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-title"
          tabIndex={-1}
          className={s.zoom}
          style={{ position: "relative", width: "100%", maxWidth: 1120, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start", outline: "none" }}
        >
          <button
            type="button"
            onClick={closeBooking}
            aria-label="Close booking"
            className={s.roundBtn}
            style={{ position: "absolute", top: 14, right: 14, zIndex: 2, background: "var(--paper)", color: "var(--ink)", width: 48, height: 48 }}
          >
            <X size={22} aria-hidden />
          </button>

          <div className={s.stack} style={{ flex: "1 1 300px", borderRadius: 40, background: "var(--night)", color: "var(--white)", padding: "clamp(24px, 4vw, 40px)", gap: 18, boxSizing: "border-box" }}>
            <span className={s.eyebrow} style={{ fontSize: 13, color: "var(--orange)" }}>
              Free eye test
            </span>
            <h2 id="booking-title" className={s.display} style={{ margin: 0, fontSize: "clamp(32px, 4vw, 44px)", lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.03em" }}>
              Book your slot in under a minute.
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#BDBFC8" }}>
              Pick a day and time. We&apos;ll call to confirm, and the test takes about 15–20 minutes.
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "#D4D5DB" }}>
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
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className={s.pill}
              style={{ alignSelf: "flex-start", height: 48, padding: "0 18px", borderRadius: 14, background: "#0F7A50", color: "#FFFFFF", fontSize: 14 }}
            >
              Prefer WhatsApp?
            </a>
          </div>

          <section
            aria-label="Booking form"
            style={{
              flex: "2 1 520px",
              minWidth: 0,
              background: "var(--white)",
              borderRadius: 40,
              padding: "clamp(22px, 4vw, 36px)",
              paddingTop: "clamp(64px, 6vw, 36px)",
              boxShadow: "0 1px 2px rgba(30,41,80,.04), 0 16px 40px rgba(30,41,80,.08)",
              boxSizing: "border-box",
            }}
          >
            <BookingForm />
          </section>
        </div>
      </div>
    </div>
  );
}
