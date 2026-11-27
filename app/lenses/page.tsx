import s from "../components/site/site.module.css";
import SiteShell from "../components/site/SiteShell";
import PageHero from "../components/site/PageHero";
import LensFinder from "../components/site/lenses/LensFinder";

const TYPES = [
  { title: "Screen-use lenses", text: "Made for long mobile and computer use, with blue cut options to reduce digital eye strain.", bestFor: "Office work, students, gaming", background: "#E4EEFF" },
  { title: "Sun-changing lenses", text: "Clear indoors and darken automatically when you step into sunlight.", bestFor: "Two-wheeler riders, outdoor work", background: "#EEF0F2", effect: "tint" },
  { title: "Night driving lenses", text: "Reduce headlight glare so night roads look calmer and clearer.", bestFor: "Drivers, late commutes", background: "#FFF3D6", effect: "glare" },
  { title: "Thin & light lenses", text: "High-index lenses that stay slim and light even at high power.", bestFor: "High prescriptions", background: "#F3F2EE" },
  { title: "Progressive lenses", text: "One pair for all distances, with no visible line.", bestFor: "Reading plus distance needs", background: "#FFE7D9" },
] as const;

const BRANDS = [
  { name: "ZEISS", line: "ClearView & progressive lenses: German precision optics" },
  { name: "Essilor®", line: "Authorized partner, with designer optical frames" },
  { name: "Varilux®", line: "XR Series™ advanced progressives and shades" },
  { name: "Crizal®", line: "Coated lenses for clearer, cleaner vision" },
  { name: "Kodak Lens", line: "HD clarity lenses" },
  { name: "Swiss Lens", line: "Superior HD clarity and frames" },
] as const;

function HeroLenses() {
  const disc = { position: "relative", width: 170, height: 170, borderRadius: "50%", border: "14px solid #FFFFFF", boxSizing: "border-box", overflow: "hidden", flex: "none" } as const;
  return (
    <div aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
      <span style={{ ...disc, background: "#E4EEFF" }}>
        <span className={s.ray} style={{ position: "absolute", left: 0, top: "40%", width: "100%", height: 6, borderRadius: 3, background: "#4A7BFF" }} />
        <span className={s.ray} style={{ position: "absolute", left: 0, top: "58%", width: "100%", height: 6, borderRadius: 3, background: "#4A7BFF", animationDelay: ".6s" }} />
      </span>
      <span className={s.tint} style={disc}>
        <span className={s.spin} style={{ position: "absolute", inset: 12, borderRadius: "50%", border: "5px solid transparent", borderTopColor: "var(--orange)" }} />
      </span>
    </div>
  );
}

export default function LensesPage() {
  return (
    <SiteShell>
      <PageHero
        active="/lenses"
        crumb="Lenses"
        title={
          <>
            The right lens for <span style={{ color: "var(--orange)" }}>how you live.</span>
          </>
        }
        lede="Screens, sunlight, night driving or high power. We fit lenses from ZEISS, Essilor®, Crizal®, Varilux®, Kodak and Swiss Lens."
        art={<HeroLenses />}
      />
      <main>
        <LensFinder />

        <section className={`${s.wrap} ${s.stack}`} style={{ paddingTop: 40, paddingBottom: 40, gap: 28 }}>
          <h2 className={`${s.h2s} ${s.reveal}`}>Lens types</h2>
          <div className={s.stack} style={{ gap: 14 }}>
            {TYPES.map((t) => (
              <div key={t.title} className={`${s.card} ${s.lift} ${s.reveal}`} style={{ padding: "22px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
                <span
                  aria-hidden="true"
                  className={`${s.lensDisc} ${"effect" in t && t.effect === "tint" ? s.tint : ""}`}
                  style={{ width: 104, height: 104, borderWidth: 8, flex: "none", background: t.background }}
                >
                  {"effect" in t && t.effect === "glare" && <span className={`${s.glareStripe} ${s.glare}`} style={{ width: 22 }} />}
                </span>
                <span className={s.stack} style={{ flex: "1 1 260px", gap: 6 }}>
                  <strong className={s.display} style={{ fontSize: 24 }}>
                    {t.title}
                  </strong>
                  <span className={s.cardText}>{t.text}</span>
                </span>
                <span style={{ flex: "0 1 260px", padding: "12px 16px", borderRadius: 18, background: "var(--paper)", fontSize: 14, lineHeight: 1.5, color: "var(--ink-soft)" }}>
                  <strong style={{ color: "var(--ink)" }}>Best for:</strong> {t.bestFor}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className={s.wrap} style={{ paddingTop: 40, paddingBottom: 72 }}>
          <div className={`${s.panelDark} ${s.reveal}`} style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <h2 className={s.h2s}>Brands we fit</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {BRANDS.map((b) => (
                <div key={b.name} className={s.lift} style={{ borderRadius: 26, background: "var(--night-2)", padding: 22, display: "flex", flexDirection: "column", gap: 8 }}>
                  <strong className={s.display} style={{ fontSize: 26 }}>
                    {b.name}
                  </strong>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color: "#BDBFC8" }}>{b.line}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
