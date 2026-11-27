"use client";

import { useMemo, useState } from "react";
import s from "./site.module.css";
import FrameGlyph from "./FrameGlyph";
import {
  BUDGETS,
  BUDGET_SPLIT,
  FACES,
  FRAMES,
  formatPrice,
  type Budget,
  type FaceShape,
} from "./data";

const FACE_ORDER = Object.keys(FACES) as FaceShape[];

function inBudget(price: number, budget: Budget) {
  if (budget === "any") return true;
  return budget === "low" ? price < BUDGET_SPLIT : price >= BUDGET_SPLIT;
}

export default function FrameFinder() {
  const [face, setFace] = useState<FaceShape>("Round");
  const [budget, setBudget] = useState<Budget>("any");

  const matches = useMemo(
    () => FRAMES.filter((f) => FACES[face].fits.includes(f.style) && inBudget(f.price, budget)),
    [face, budget],
  );

  return (
    <section id="frames" className={s.wrap}>
      <div className={`${s.darkPanel} ${s.reveal}`}>
        <div className={s.headRow}>
          <div className={s.stack} style={{ gap: 12, maxWidth: 620 }}>
            <span className={s.eyebrow} style={{ color: "var(--orange)" }}>
              Smart frame finder
            </span>
            <h2 className={s.h2}>Find frames that suit your face.</h2>
          </div>
          <p className={s.lede} style={{ maxWidth: 340, fontSize: 16, color: "#BDBFC8" }} aria-live="polite">
            {FACES[face].tip}
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          <div className={s.stack} style={{ flex: "1 1 300px", gap: 22 }}>
            <div className={s.choiceGroup}>
              <span className={s.choiceLabel} id="face-label">
                Your face shape
              </span>
              <div role="group" aria-labelledby="face-label" className={s.faces}>
                {FACE_ORDER.map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    aria-pressed={face === shape}
                    onClick={() => setFace(shape)}
                    className={`${s.choice} ${s.faceChoice}`}
                  >
                    <span className={s.faceOutline} style={{ borderRadius: FACES[shape].outline }} />
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            <div className={s.choiceGroup}>
              <span className={s.choiceLabel} id="budget-label">
                Your budget
              </span>
              <div role="group" aria-labelledby="budget-label" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {BUDGETS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    aria-pressed={budget === b.id}
                    onClick={() => setBudget(b.id)}
                    className={`${s.choice} ${s.budgetChoice}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={s.matches} aria-live="polite">
            {matches.map((m) => (
              // Keyed by face + budget too, so the entry animation replays on every filter change.
              <article key={`${face}-${budget}-${m.model}`} className={`${s.matchCard} ${s.up} ${s.lift}`}>
                <span className={s.frameStage} style={{ height: 120 }}>
                  <FrameGlyph style={m.style} width={150} height={70} />
                </span>
                <span className={s.frameMeta}>
                  <span>
                    <strong style={{ fontSize: 15 }}>{m.style}</strong>
                    <small style={{ fontSize: 13 }}>
                      {m.color} · {m.model}
                    </small>
                  </span>
                  <span className={s.price} style={{ fontSize: 19 }}>
                    {formatPrice(m.price)}
                  </span>
                </span>
              </article>
            ))}
            {matches.length === 0 && (
              <div className={s.noMatch}>No frames in this range for that shape yet. Visit us to try all 500+ frames.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
