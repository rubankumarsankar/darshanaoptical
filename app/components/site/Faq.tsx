"use client";

import { useId, useState } from "react";
import s from "./site.module.css";

export interface FaqItem {
  q: string;
  a: string;
}

/** Single-open accordion. The first answer starts open. */
export default function Faq({ title, items }: { title: string; items: readonly FaqItem[] }) {
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <section className={s.wrap} style={{ maxWidth: 900, paddingBottom: 72, display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 className={`${s.h2s} ${s.reveal}`} style={{ textAlign: "center" }}>
        {title}
      </h2>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-${i}`;
        return (
          <div key={item.q} className={s.reveal} style={{ background: "var(--white)", borderRadius: 24, overflow: "hidden" }}>
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: 0,
                  background: "transparent",
                  padding: "22px 24px",
                  font: "inherit",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--ink)",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                {item.q}
                <span
                  aria-hidden="true"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    flex: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    transition: "transform .3s, background-color .3s",
                    background: isOpen ? "var(--orange)" : "var(--paper)",
                    transform: isOpen ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </span>
              </button>
            </h3>
            {isOpen && (
              <p id={panelId} className={s.up} style={{ margin: 0, padding: "0 24px 22px", fontSize: 16, lineHeight: 1.65, color: "var(--muted)" }}>
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
}
