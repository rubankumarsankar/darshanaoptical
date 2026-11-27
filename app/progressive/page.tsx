import Link from "next/link";
import s from "../components/site/site.module.css";
import SiteShell from "../components/site/SiteShell";
import PageHero from "../components/site/PageHero";
import BookButton from "../components/site/BookButton";
import ZoneDemo from "../components/site/progressive/ZoneDemo";

const FIT = [
  "You hold your phone or newspaper further away to read it",
  "You switch between two pairs of glasses every day",
  "You want one pair for driving, screens and reading",
  "You want a clean look with no bifocal line",
] as const;

const TIPS = [
  { n: "01", text: "Wear them full-time for the first few days." },
  { n: "02", text: "Point your nose at what you want to see, then move your eyes." },
  { n: "03", text: "Look down through the lens, not down with your head, to read." },
  { n: "04", text: "Come back to us for a quick adjustment if anything feels off." },
] as const;

const band = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--display)",
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: ".12em",
  color: "#BDBFC8",
} as const;

function SweepingLens() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: "min(340px, 100%)",
        aspectRatio: "1",
        borderRadius: "50%",
        border: "22px solid #FFFFFF",
        boxSizing: "border-box",
        overflow: "hidden",
        background: "var(--night-2)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <span style={{ ...band, flex: 44, borderBottom: "2px dashed #4A4B53" }}>FAR</span>
        <span style={{ ...band, flex: 30, borderBottom: "2px dashed #4A4B53" }}>ARM&apos;S LENGTH</span>
        <span style={{ ...band, flex: 26 }}>NEAR</span>
      </div>
      <span
        className={s.sweep}
        style={{ position: "absolute", left: "8%", right: "8%", height: "14%", borderRadius: 999, border: "3px solid var(--orange)", boxShadow: "0 0 24px rgba(253,90,5,.5)" }}
      />
    </div>
  );
}

export default function ProgressivePage() {
  return (
    <SiteShell>
      <PageHero
        active="/progressive-lenses"
        crumb="Progressive lenses"
        title={
          <>
            Near and far, <span style={{ color: "var(--orange)" }}>one pair.</span>
          </>
        }
        lede="Stop switching between reading glasses and distance glasses. Progressive lenses change power smoothly from top to bottom, with no visible line."
        actions={
          <BookButton className={`${s.pill} ${s.pillOrange} ${s.btn}`} style={{ height: 58, padding: "0 28px", fontSize: 17 }}>
            Book a progressive fitting
          </BookButton>
        }
        art={<SweepingLens />}
      />
      <main>
        <ZoneDemo />

        <section className={s.wrap} style={{ paddingTop: 40, paddingBottom: 40, display: "flex", flexWrap: "wrap", gap: 18 }}>
          <div className={`${s.stack} ${s.reveal}`} style={{ flex: "1 1 440px", borderRadius: 40, background: "var(--peach)", padding: "clamp(24px, 4vw, 40px)", gap: 16 }}>
            <h2 className={s.h3}>Are they right for you?</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
              {FIT.map((f) => (
                <li key={f} style={{ display: "flex", gap: 12, fontSize: 16, lineHeight: 1.55, color: "#3A1A08" }}>
                  <span
                    aria-hidden="true"
                    style={{ width: 26, height: 26, borderRadius: "50%", flex: "none", background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}
                  >
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className={`${s.stack} ${s.reveal}`} style={{ flex: "1 1 440px", borderRadius: 40, background: "var(--white)", padding: "clamp(24px, 4vw, 40px)", gap: 16 }}>
            <h2 className={s.h3}>Getting used to them</h2>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 16 }}>
              {TIPS.map((t) => (
                <li key={t.n} style={{ display: "flex", gap: 14, fontSize: 16, lineHeight: 1.55, color: "var(--ink-soft)" }}>
                  <span className={s.display} aria-hidden="true" style={{ color: "var(--orange-ink)", width: 26, flex: "none" }}>
                    {t.n}
                  </span>
                  {t.text}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={s.wrap} style={{ paddingTop: 40, paddingBottom: 72 }}>
          <div className={`${s.panelDark} ${s.reveal}`} style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
            <div className={s.stack} style={{ gap: 10, maxWidth: 640 }}>
              <span className={s.eyebrow} style={{ color: "var(--orange)" }}>
                Premium progressives
              </span>
              <h2 className={s.h2s} style={{ fontSize: "clamp(30px, 3.8vw, 40px)" }}>
                Varilux® XR Series™ and ZEISS progressive lenses
              </h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "#BDBFC8" }}>
                Fitted by an authorized Essilor® and ZEISS dispensing clinic, with careful measurement for comfortable vision at every
                distance.
              </p>
            </div>
            <Link href="/lenses" className={`${s.pill} ${s.pillWhite} ${s.btn}`} style={{ height: 56, padding: "0 26px", fontSize: 16 }}>
              Compare lenses
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
