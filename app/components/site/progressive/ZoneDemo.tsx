"use client";

import { useState } from "react";
import s from "../site.module.css";

const ZONES = [
  { n: "01", label: "Top: far zone", uses: "Driving, TV, outdoors" },
  { n: "02", label: "Middle: arm's length", uses: "Computer, vehicle meter" },
  { n: "03", label: "Bottom: near zone", uses: "Reading, mobile" },
] as const;

const view = { borderRadius: 24, background: "var(--night-2)", display: "flex", alignItems: "center", justifyContent: "space-around", gap: 12, padding: "0 12px" } as const;
const caption = { fontFamily: "var(--display)", fontSize: 15, color: "#BDBFC8" } as const;

export default function ZoneDemo() {
  const [zone, setZone] = useState(0);

  return (
    <section className={s.wrap} style={{ paddingTop: 72, paddingBottom: 40 }}>
      <div className={`${s.panelWhite} ${s.reveal}`} style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center" }}>
        <div className={s.stack} style={{ flex: "1 1 360px", gap: 16 }}>
          <span className={s.eyebrow}>See it for yourself</span>
          <h2 className={s.h2s}>Look through each zone</h2>
          <p className={s.lede} style={{ fontSize: 16 }}>
            Pick a zone. That part of your view comes into focus, just like moving your eyes through the lens.
          </p>
          <div role="group" aria-label="Lens zone" className={s.stack} style={{ gap: 10 }}>
            {ZONES.map((z, i) => (
              <button
                key={z.n}
                type="button"
                aria-pressed={zone === i}
                onClick={() => setZone(i)}
                className={s.zoneButton}
                style={zone === i ? undefined : { background: "var(--paper)", color: "var(--ink)" }}
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

        <div
          aria-hidden="true"
          style={{ flex: "1 1 440px", minWidth: 0, borderRadius: 36, background: "var(--night)", padding: 22, display: "flex", flexDirection: "column", gap: 12, color: "var(--white)" }}
        >
          <div className={s.zoneView} data-sharp={zone === 0} style={{ ...view, height: 150 }}>
            <span className={s.display} style={{ padding: "12px 16px", borderRadius: 10, background: "#0F7A50", fontSize: 18 }}>
              HARUR 2 km
            </span>
            <span style={caption}>Road signs · TV · outdoors</span>
          </div>
          <div className={s.zoneView} data-sharp={zone === 1} style={{ ...view, height: 120 }}>
            <span style={{ width: 150, height: 84, borderRadius: 10, border: "5px solid #D4D5DB", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flex: "none" }}>
              Inbox (12)
            </span>
            <span style={caption}>Computer · dashboard</span>
          </div>
          <div className={s.zoneView} data-sharp={zone === 2} style={{ ...view, height: 100 }}>
            <span style={{ width: 56, height: 84, borderRadius: 12, border: "4px solid #D4D5DB", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flex: "none" }}>
              12:30
            </span>
            <span style={caption}>Mobile · reading</span>
          </div>
        </div>
      </div>
    </section>
  );
}
