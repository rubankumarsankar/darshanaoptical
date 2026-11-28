"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import s from "../site.module.css";

type Category = "Store" | "Eye Testing" | "Frames" | "Behind the Scenes";

interface Photo {
  title: string;
  category: Category;
  src: string;
  /** Portrait photos span two rows; wide ones two columns. */
  shape?: "tall" | "wide";
  /** CSS object-position for the tile crop. */
  focus?: string;
}

const PHOTOS: readonly Photo[] = [
  { title: "Darshana Optical storefront & entrance", category: "Store", src: "/images/store-entrance.jpg", shape: "tall" },
  { title: "ZEISS progressive & ClearView showcase", category: "Store", src: "/images/store-zeiss.jpg", shape: "tall" },
  { title: "Essilor® eyewear display", category: "Store", src: "/images/store-essilor.jpg", shape: "tall" },
  { title: "Multi-zone progressive optics", category: "Behind the Scenes", src: "/images/lens-progressive.jpg", shape: "wide" },
  { title: "Crizal® spectacle showcase", category: "Store", src: "/images/store-crizal.jpg", shape: "tall" },
  { title: "Varilux® XR Series™ progressives & sunglasses", category: "Store", src: "/images/store-varilux.jpg", shape: "tall" },
  { title: "Matte black full-rim frames", category: "Frames", src: "/images/frame-1.jpg", focus: "50% 90%" },
  { title: "Gunmetal titanium aviator", category: "Frames", src: "/images/frame-2.jpg", focus: "50% 90%" },
  { title: "Blue cut digital eyewear display", category: "Store", src: "/images/store-bluecut.jpg", shape: "tall" },
  { title: "Kodak lenses & Swiss Lens showcase", category: "Store", src: "/images/store-kodak-swiss.jpg", shape: "tall" },
  { title: "AR-810A auto refractometer", category: "Eye Testing", src: "/images/store-refractometer.jpg", shape: "tall" },
  { title: "Examination chair & trial unit", category: "Eye Testing", src: "/images/store-testing-chair.jpg", shape: "tall" },
  { title: "Tortoise acetate square frames", category: "Frames", src: "/images/frame-3.jpg", focus: "50% 90%" },
  { title: "Silver titanium round frames", category: "Frames", src: "/images/frame-4.jpg", focus: "50% 90%" },
  { title: "Brown acetate wayfarer", category: "Frames", src: "/images/frame-5.jpg", focus: "50% 90%" },
  { title: "Crystal clear transparent frames", category: "Frames", src: "/images/frame-6.jpg", focus: "50% 90%" },
  { title: "Gold round polarised sunglasses", category: "Frames", src: "/images/cat-premium.jpg", focus: "50% 90%" },
  { title: "Classic UV400 sunglasses", category: "Frames", src: "/images/cat-sunglasses.jpg" },
];

const FILTERS: readonly ("All" | Category)[] = ["All", "Store", "Frames", "Eye Testing", "Behind the Scenes"];

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d={dir === "left" ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"} />
    </svg>
  );
}

export default function GalleryGrid() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [open, setOpen] = useState(-1);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const shown = useMemo(() => PHOTOS.filter((p) => filter === "All" || p.category === filter), [filter]);
  const n = shown.length;
  const current = open >= 0 ? shown[open] : null;

  const close = useCallback(() => {
    setOpen(-1);
    openerRef.current?.focus();
  }, []);
  const step = useCallback((delta: number) => setOpen((o) => (o + delta + n) % n), [n]);

  // While the lightbox is open: arrow keys page through, Escape closes,
  // and the page behind doesn't scroll.
  useEffect(() => {
    if (!current) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [current, close, step]);

  return (
    <section className={`${s.wrap} ${s.stack}`} style={{ paddingBottom: 72, gap: 24 }}>
      <div role="group" aria-label="Filter photos" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => {
              setFilter(f);
              setOpen(-1);
            }}
            className={s.pillChoice}
            style={{ height: 46, padding: "0 20px", fontSize: 15 }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={s.galleryGrid}>
        {shown.map((photo, i) => (
          <button
            key={`${filter}-${photo.src}`}
            type="button"
            aria-label={`Open photo: ${photo.title}`}
            onClick={(e) => {
              openerRef.current = e.currentTarget;
              setOpen(i);
            }}
            className={`${s.tile} ${s.up} ${photo.shape === "tall" ? s.tall : photo.shape === "wide" ? s.wide : ""}`}
          >
            <Image src={photo.src} alt="" fill loading={i < 3 ? "eager" : "lazy"} sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 400px" style={{ objectFit: "cover", objectPosition: photo.focus ?? "50% 50%" }} />
            <span className={s.tileShade} />
            <span className={s.tileRing} />
            <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 22, display: "flex", flexDirection: "column", gap: 4, color: "var(--white)" }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--orange)" }}>{photo.category}</span>
              <strong className={s.display} style={{ fontSize: 20, lineHeight: 1.2 }}>
                {photo.title}
              </strong>
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          className={s.lightbox}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className={`${s.zoom} ${s.stack}`} style={{ width: "100%", maxWidth: 980, gap: 18 }}>
            <div style={{ position: "relative", height: "min(70vh, 620px)", borderRadius: 32, overflow: "hidden", background: "var(--night-2)" }}>
              <Image src={current.src} alt={current.title} fill sizes="980px" style={{ objectFit: "contain" }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14, color: "var(--white)" }}>
              <span>
                <strong className={s.display} style={{ display: "block", fontSize: 24 }}>
                  {current.title}
                </strong>
                <span style={{ fontSize: 15, color: "#BDBFC8" }}>
                  {current.category} · {open + 1} of {n}
                </span>
              </span>
              <span style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={s.roundBtn} style={{ background: "var(--night-2)", color: "var(--white)" }}>
                  <ArrowIcon dir="left" />
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next photo" className={s.roundBtn} style={{ background: "var(--orange)", color: "var(--ink)" }}>
                  <ArrowIcon dir="right" />
                </button>
                <button ref={closeRef} type="button" onClick={close} className={`${s.pill} ${s.pillWhite}`} style={{ height: 52, padding: "0 20px", fontSize: 15 }}>
                  Close
                </button>
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
