"use client";

import { useState } from "react";
import s from "../site.module.css";

const SYMPTOMS = [
  "Headaches after reading",
  "Squinting at the TV",
  "Blurry phone text",
  "Tired eyes after screens",
  "Trouble driving at night",
  "Holding books far away",
  "Last test over a year ago",
  "Current glasses feel off",
] as const;

interface Verdict {
  title: string;
  text: string;
  background: string;
  color: string;
}

function verdictFor(count: number): Verdict {
  if (count === 0) {
    return { title: "Pick what applies", text: "We will tell you whether a check-up is a good idea.", background: "var(--paper)", color: "var(--ink)" };
  }
  if (count < 3) {
    return {
      title: "A check-up is a good idea",
      text: `${count} sign${count > 1 ? "s" : ""} noticed. A quick test will confirm whether your power has changed.`,
      background: "var(--peach)",
      color: "#5A2A0A",
    };
  }
  return {
    title: "Book a test soon",
    text: `${count} signs noticed. Your eyes may be working harder than they should. Book a free slot.`,
    background: "var(--orange)",
    color: "var(--ink)",
  };
}

export default function SymptomCheck() {
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const verdict = verdictFor(picked.size);

  const toggle = (symptom: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(symptom)) next.delete(symptom);
      else next.add(symptom);
      return next;
    });

  return (
    <section className={s.wrap} style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className={`${s.panelWhite} ${s.reveal}`} style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
        <div className={s.stack} style={{ flex: "1 1 360px", gap: 16 }}>
          <span className={s.eyebrow}>Quick check</span>
          <h2 className={s.h2s}>Is it time for an eye test?</h2>
          <p className={s.lede} style={{ fontSize: 16 }}>
            Tap anything you&apos;ve noticed lately.
          </p>
          <div
            aria-live="polite"
            style={{
              marginTop: "auto",
              padding: 22,
              borderRadius: 28,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              background: verdict.background,
              color: verdict.color,
              transition: "background-color .4s, color .4s",
            }}
          >
            <strong className={s.display} style={{ fontSize: 24 }}>
              {verdict.title}
            </strong>
            <span style={{ fontSize: 15, lineHeight: 1.55 }}>{verdict.text}</span>
          </div>
        </div>
        <div
          role="group"
          aria-label="Symptoms"
          style={{ flex: "1 1 420px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}
        >
          {SYMPTOMS.map((symptom) => {
            const on = picked.has(symptom);
            return (
              <button
                key={symptom}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(symptom)}
                className={s.toggle}
                style={{
                  minHeight: 64,
                  padding: "14px 16px",
                  borderRadius: 20,
                  fontSize: 15,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  ...(on ? { background: "var(--night)", color: "var(--white)" } : {}),
                }}
              >
                <span className={s.checkMark} style={{ borderRadius: "50%", fontSize: 13, fontWeight: 800 }}>
                  {on ? "✓" : ""}
                </span>
                {symptom}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
