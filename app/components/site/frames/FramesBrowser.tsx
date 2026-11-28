"use client";

import { useMemo, useState } from "react";
import s from "../site.module.css";
import Image from "next/image";
import { FRAMES, formatPrice, type FrameStyle } from "../data";
import { useShopContact } from "../ShopContact";

const CATEGORIES = [
  { label: "Men", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" },
  { label: "Women", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM6 21l2-6h8l2 6" },
  { label: "Kids", icon: "M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM7 20a5 5 0 0 1 10 0" },
  { label: "Premium", icon: "M12 2l3 6 6 .9-4.5 4.3 1 6.3L12 16.5 6.5 19.5l1-6.3L3 8.9 9 8z" },
  { label: "Computer use", icon: "M3 4h18v12H3zM8 20h8M12 16v4" },
  { label: "Sunglasses", icon: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M2 12h2M20 12h2" },
] as const;

type Category = (typeof CATEGORIES)[number]["label"];
type Shape = "All" | FrameStyle;
type Sort = "new" | "low" | "high";

const SHAPES: readonly Shape[] = ["All", "Full Rim", "Aviator", "Square", "Round", "Wayfarer", "Transparent"];
const SORTS: readonly { id: Sort; label: string }[] = [
  { id: "new", label: "Newest" },
  { id: "low", label: "Price ↑" },
  { id: "high", label: "Price ↓" },
];

const askUrl = (whatsappUrl: string, model: string) =>
  `${whatsappUrl}?text=${encodeURIComponent(`Hello Darshana Optical, I'd like to know more about frame ${model}.`)}`;

export default function FramesBrowser() {
  const shop = useShopContact();
  const [category, setCategory] = useState<Category>("Men");
  const [shape, setShape] = useState<Shape>("All");
  const [sort, setSort] = useState<Sort>("new");

  const frames = useMemo(() => {
    const list = FRAMES.map((f, order) => ({ ...f, order })).filter((f) => shape === "All" || f.style === shape);
    return list.sort((a, b) => (sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : a.order - b.order));
  }, [shape, sort]);

  return (
    <>
      <section className={`${s.wrap} ${s.stack}`} style={{ paddingTop: 72, paddingBottom: 32, gap: 24 }}>
        <h2 className={`${s.h2s} ${s.reveal}`}>Shop by category</h2>
        <div role="group" aria-label="Category" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
          {CATEGORIES.map((c) => {
            const on = category === c.label;
            return (
              <button
                key={c.label}
                type="button"
                aria-pressed={on}
                onClick={() => setCategory(c.label)}
                className={`${s.lift} ${s.lens} ${s.reveal}`}
                style={{
                  border: 0,
                  borderRadius: 28,
                  padding: "22px 18px",
                  font: "inherit",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 14,
                  textAlign: "left",
                  background: on ? "var(--night)" : "var(--white)",
                  color: on ? "var(--white)" : "var(--ink)",
                }}
              >
                <span style={{ position: "relative", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid currentColor" }} />
                  <span
                    className={s.arc}
                    style={{ position: "absolute", inset: 9, borderRadius: "50%", border: "3px solid transparent", borderTopColor: "var(--orange)", borderLeftColor: "var(--orange)" }}
                  />
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={c.icon} />
                  </svg>
                </span>
                <span className={s.display} style={{ fontSize: 19 }}>
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
        <p aria-live="polite" style={{ margin: 0, padding: "16px 20px", borderRadius: 20, background: "var(--white)", fontSize: 15, lineHeight: 1.6, color: "var(--ink-soft)" }}>
          <strong>{category} frames:</strong> our full range is in store. Below are our latest models, or{" "}
          <a href={shop.whatsappUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>
            ask on WhatsApp
          </a>{" "}
          for photos of more.
        </p>
      </section>

      <section className={`${s.wrap} ${s.stack}`} style={{ paddingTop: 32, gap: 24 }}>
        <div className={`${s.reveal}`} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 14 }}>
          <h2 className={s.h2s}>Latest models</h2>
          <div role="group" aria-label="Sort" className={s.segmented}>
            {SORTS.map((o) => (
              <button key={o.id} type="button" aria-pressed={sort === o.id} onClick={() => setSort(o.id)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div role="group" aria-label="Frame shape" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SHAPES.map((label) => (
            <button key={label} type="button" aria-pressed={shape === label} onClick={() => setShape(label)} className={s.pillChoice}>
              {label}
            </button>
          ))}
        </div>
        <div aria-live="polite" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
          {frames.map((m) => (
            <article
              key={`${shape}-${sort}-${m.model}`}
              className={`${s.card} ${s.lift} ${s.lens} ${s.up}`}
              style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}
            >
              <span className={s.frameStage} style={{ height: 190, borderRadius: 24 }}>
                <Image src={m.image} alt={`${m.style} frame in ${m.color.toLowerCase()}, model ${m.model}`} fill sizes="(max-width: 600px) 90vw, 300px" style={{ objectFit: "cover" }} />
                <span style={{ position: "absolute", left: 12, top: 12, padding: "5px 12px", borderRadius: 999, background: "var(--white)", fontSize: 12, fontWeight: 700 }}>
                  {m.model}
                </span>
              </span>
              <span className={s.frameMeta} style={{ padding: "0 8px" }}>
                <span>
                  <strong style={{ fontSize: 17 }}>{m.style}</strong>
                  <small style={{ fontSize: 14 }}>{m.color}</small>
                </span>
                <span className={s.price} style={{ fontSize: 24 }}>
                  {formatPrice(m.price)}
                </span>
              </span>
              <a
                href={askUrl(shop.whatsappUrl, m.model)}
                target="_blank"
                rel="noreferrer"
                className={`${s.pill} ${s.btn}`}
                style={{ height: 46, background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
              >
                Ask about {m.model}
              </a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
