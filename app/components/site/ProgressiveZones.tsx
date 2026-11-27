"use client";

import { useState } from "react";
import s from "./site.module.css";
import { ZONES } from "./data";

/** Extra share of the lens the selected zone grows by. */
const ACTIVE_BOOST = 22;

export default function ProgressiveZones() {
  const [active, setActive] = useState(0);

  return (
    <section id="progressive" className={s.wrap}>
      <div className={`${s.panel} ${s.reveal}`} style={{ background: "var(--peach)" }}>
        <div className={s.stack} style={{ flex: "1 1 380px", gap: 18 }}>
          <span className={s.eyebrow} style={{ color: "var(--orange-deep)" }}>
            Progressive lenses
          </span>
          <h2 className={s.h2}>See near and far with one pair.</h2>
          <p className={s.lede} style={{ fontSize: 16, color: "#5A3A2A" }}>
            Tap a zone to see what each part of the lens is for.
          </p>
          <div role="group" aria-label="Lens zone" className={s.stack} style={{ gap: 10 }}>
            {ZONES.map((z, i) => (
              <button
                key={z.n}
                type="button"
                aria-pressed={active === i}
                onClick={() => setActive(i)}
                className={s.zoneButton}
              >
                <b>{z.n}</b>
                <span style={{ flex: 1 }}>
                  <strong>{z.label}</strong>
                  <small>{z.uses}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={s.zoneStage}>
          <div className={`${s.zoneLens} ${s.float}`} aria-hidden="true">
            {ZONES.map((z, i) => (
              <div
                key={z.n}
                className={s.zoneBand}
                data-active={active === i}
                style={{ flexGrow: active === i ? z.weight + ACTIVE_BOOST : z.weight, flexBasis: 0 }}
              >
                {z.short}
              </div>
            ))}
            <span className={`${s.zoneSpinner} ${s.spin}`} />
          </div>
        </div>
      </div>
    </section>
  );
}
