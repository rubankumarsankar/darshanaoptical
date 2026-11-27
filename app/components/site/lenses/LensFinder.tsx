"use client";

import { useState } from "react";
import s from "../site.module.css";
import BookButton from "../BookButton";

const NEEDS = [
  { id: "screen", label: "Long hours on mobile or computer", title: "Screen-use / blue cut lenses", why: "Eases strain and fatigue from long screen time." },
  { id: "sun", label: "I move between indoors and outdoors", title: "Sun-changing lenses", why: "Clear indoors, dark outdoors, so one pair does both." },
  { id: "night", label: "I drive at night", title: "Night driving lenses", why: "Reduce glare from oncoming headlights." },
  { id: "high", label: "My power is high and lenses look thick", title: "Thin & light lenses", why: "Slimmer and lighter for high power, and they look better too." },
  { id: "multi", label: "I need help for both reading and distance", title: "Progressive lenses", why: "One pair for far, arm’s length and near. Try Varilux® or ZEISS." },
] as const;

type NeedId = (typeof NEEDS)[number]["id"];

export default function LensFinder() {
  const [picked, setPicked] = useState<ReadonlySet<NeedId>>(new Set<NeedId>(["screen"]));
  const recs = NEEDS.filter((n) => picked.has(n.id));

  const toggle = (id: NeedId) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <section className={s.wrap} style={{ paddingTop: 72, paddingBottom: 40 }}>
      <div className={`${s.panelWhite} ${s.reveal}`} style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
        <div className={s.stack} style={{ flex: "1 1 380px", gap: 16 }}>
          <span className={s.eyebrow}>Smart lens finder</span>
          <h2 className={s.h2s}>What does your day look like?</h2>
          <div role="group" aria-label="Your needs" className={s.stack} style={{ gap: 8 }}>
            {NEEDS.map((n) => {
              const on = picked.has(n.id);
              return (
                <button
                  key={n.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(n.id)}
                  className={s.toggle}
                  style={{
                    minHeight: 56,
                    padding: "12px 16px",
                    borderRadius: 18,
                    fontSize: 15,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    ...(on ? { background: "var(--peach)" } : {}),
                  }}
                >
                  <span className={s.checkMark} style={{ borderRadius: 7, fontSize: 13, fontWeight: 800 }}>
                    {on ? "✓" : ""}
                  </span>
                  {n.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          aria-live="polite"
          style={{ flex: "1 1 400px", borderRadius: 32, background: "var(--night)", color: "var(--white)", padding: 28, display: "flex", flexDirection: "column", gap: 14 }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: "#BDBFC8" }}>We&apos;d suggest</span>
          {recs.map((r) => (
            <div key={r.id} className={s.up} style={{ padding: 18, borderRadius: 22, background: "var(--night-2)", display: "flex", flexDirection: "column", gap: 6 }}>
              <strong className={s.display} style={{ fontSize: 22, color: "var(--orange)" }}>
                {r.title}
              </strong>
              <span style={{ fontSize: 14, lineHeight: 1.55, color: "#D4D5DB" }}>{r.why}</span>
            </div>
          ))}
          {recs.length === 0 && (
            <div style={{ padding: 22, borderRadius: 22, background: "var(--night-2)", fontSize: 15, lineHeight: 1.6, color: "#D4D5DB" }}>
              Pick what fits your day and we&apos;ll suggest lenses to try.
            </div>
          )}
          <BookButton className={`${s.pill} ${s.pillOrange} ${s.btn}`} style={{ marginTop: "auto", alignSelf: "flex-start", height: 52, padding: "0 24px", fontSize: 15 }}>
            Get tested &amp; fitted
          </BookButton>
        </div>
      </div>
    </section>
  );
}
