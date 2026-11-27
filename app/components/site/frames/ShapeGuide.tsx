import Link from "next/link";
import s from "../site.module.css";
import { FACES, type FaceShape } from "../data";

const TRY: Record<FaceShape, string> = {
  Round: "Square, Wayfarer",
  Square: "Round, Aviator",
  Oval: "Any shape you love",
  Heart: "Aviator, Round",
};

/** "Which shape suits your face?" panel, shared by the frames and frame-finder pages. */
export default function ShapeGuide({ finderLink = true }: { finderLink?: boolean }) {
  return (
    <section className={s.wrap} style={{ paddingTop: 40, paddingBottom: 72 }}>
      <div className={`${s.panelWhite} ${s.reveal}`} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div className={s.headRow}>
          <h2 className={s.h2s} style={{ maxWidth: 560 }}>
            Which shape suits your face?
          </h2>
          {finderLink && (
            <Link href="/frame-finder" style={{ fontSize: 16, fontWeight: 700, textDecoration: "none", padding: "10px 0" }}>
              Try the frame finder →
            </Link>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {(Object.keys(FACES) as FaceShape[]).map((face) => (
            <div key={face} style={{ borderRadius: 28, background: "var(--paper)", padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <span aria-hidden="true" style={{ width: 48, height: 60, border: "4px solid var(--charcoal)", boxSizing: "border-box", borderRadius: FACES[face].outline }} />
              <span className={s.display} style={{ fontSize: 21 }}>
                {face} face
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>{FACES[face].tip.split(": ")[1]}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--orange-ink)" }}>Try: {TRY[face]}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
