import s from "../components/site/site.module.css";
import SiteShell from "../components/site/SiteShell";
import PageHero from "../components/site/PageHero";
import BookButton from "../components/site/BookButton";
import { WHATSAPP_URL } from "../components/site/data";

const claimUrl = (offer: string) =>
  `${WHATSAPP_URL}?text=${encodeURIComponent(`Hello Darshana Optical, I'd like to know more about the "${offer}" offer.`)}`;

const MORE_OFFERS = [
  { tag: "Best value", title: "Complete eyewear package", text: "Selected premium frame and anti-reflective lens combinations at special in-store package pricing." },
  { tag: "Popular", title: "Lens upgrade offer", text: "A free anti-reflective coating upgrade on selected progressive and blue-filter digital lenses." },
  { tag: "Limited time", title: "Seasonal family package", text: "Limited-period discounts when you buy several frames or book family eye tests together." },
] as const;

const STEPS = [
  { n: "1", title: "Book or walk in", text: "Book a free eye test slot online, or visit the store any day." },
  { n: "2", title: "Get your power checked", text: "A quick computerised test with manual confirmation." },
  { n: "3", title: "Pick your frame", text: "Choose from the offer range and we fit your screen-use lenses." },
] as const;

const TERMS = [
  "Offers are valid until the campaign end date or while stock lasts.",
  "Valid on selected frame brands, single vision and progressive lens packages.",
  "Cannot be combined with other store discounts unless stated.",
  "Available only at Darshana Optical, Harur.",
] as const;

function PriceBadge() {
  return (
    <div
      className={`${s.pop} ${s.display}`}
      style={{
        position: "relative",
        width: "min(340px, 82vw)",
        aspectRatio: "1",
        borderRadius: "50%",
        background: "var(--orange)",
        color: "var(--ink)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        textAlign: "center",
      }}
    >
      <span className={s.spin} aria-hidden="true" style={{ position: "absolute", inset: -18, borderRadius: "50%", border: "3px dashed var(--orange)" }} />
      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 15, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>Computer glasses</span>
      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 15, fontWeight: 600 }}>starting from</span>
      <span style={{ fontSize: "clamp(56px, 16vw, 86px)", lineHeight: 1, fontWeight: 800, letterSpacing: "-0.04em" }}>₹1,499*</span>
      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: 14, fontWeight: 600 }}>frame + screen-use lenses</span>
    </div>
  );
}

const bullet = { display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", borderRadius: 18, background: "var(--paper)", fontSize: 15, fontWeight: 600 } as const;
const dot = { width: 12, height: 12, borderRadius: "50%", background: "var(--orange)", flex: "none" } as const;

export default function OffersPage() {
  return (
    <SiteShell>
      <PageHero
        active="/offers"
        crumb="Offers"
        title={
          <>
            Good vision, <span style={{ color: "var(--orange)" }}>fair price.</span>
          </>
        }
        lede="Current offers at our Harur store. Visit us or message on WhatsApp to claim."
        art={<PriceBadge />}
      />
      <main>
        <section className={s.wrap} style={{ paddingTop: 72, paddingBottom: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))", gap: 18 }}>
          <article className={`${s.lift} ${s.reveal} ${s.stack}`} style={{ borderRadius: 40, background: "var(--white)", padding: "clamp(24px, 4vw, 36px)", gap: 16 }}>
            <span className={s.tag} style={{ background: "var(--orange)" }}>
              Featured
            </span>
            <h2 className={s.h3}>Computer glasses from ₹1,499*</h2>
            <p className={s.lede} style={{ fontSize: 16 }}>
              For long mobile and laptop days. Includes:
            </p>
            <div className={s.stack} style={{ gap: 10 }}>
              <span style={bullet}>
                <span style={dot} />A frame from the offer range
              </span>
              <span style={bullet}>
                <span style={dot} />
                Screen-use lenses
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--muted)" }}>*See offer terms below.</p>
            <a
              href={claimUrl("Computer glasses from ₹1,499")}
              target="_blank"
              rel="noreferrer"
              className={`${s.pill} ${s.pillDark} ${s.btn}`}
              style={{ marginTop: "auto", alignSelf: "flex-start", height: 54, padding: "0 24px", fontSize: 16 }}
            >
              Claim on WhatsApp
            </a>
          </article>
          <article className={`${s.lift} ${s.reveal} ${s.stack}`} style={{ borderRadius: 40, background: "var(--night)", color: "var(--white)", padding: "clamp(24px, 4vw, 36px)", gap: 16, position: "relative", overflow: "hidden" }}>
            <span className={s.float} aria-hidden="true" style={{ position: "absolute", right: -50, top: -50, width: 200, height: 200, borderRadius: "50%", border: "18px solid var(--night-2)" }} />
            <span className={s.tag} style={{ background: "var(--night-2)", color: "var(--orange)" }}>
              Always on
            </span>
            <h2 className={s.h3}>Free eye test slot</h2>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "#BDBFC8" }}>
              Book a slot online and get a computerised eye check with a manual power confirmation. No obligation to buy.
            </p>
            <BookButton className={`${s.pill} ${s.pillOrange} ${s.btn}`} style={{ marginTop: "auto", alignSelf: "flex-start", height: 54, padding: "0 24px", fontSize: 16 }}>
              Book free slot
            </BookButton>
          </article>
        </section>

        <section className={`${s.wrap} ${s.stack}`} style={{ paddingTop: 40, paddingBottom: 40, gap: 24 }}>
          <h2 className={`${s.h2s} ${s.reveal}`}>More in-store offers</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {MORE_OFFERS.map((o) => (
              <article key={o.title} className={`${s.card} ${s.lift} ${s.reveal} ${s.stack}`} style={{ padding: 28, gap: 12 }}>
                <span className={s.tag} style={{ background: "var(--peach)", color: "var(--orange-deep)" }}>
                  {o.tag}
                </span>
                <strong className={s.display} style={{ fontSize: 22 }}>
                  {o.title}
                </strong>
                <span className={s.cardText}>{o.text}</span>
                <a href={claimUrl(o.title)} target="_blank" rel="noreferrer" style={{ marginTop: "auto", fontSize: 15, fontWeight: 700, textDecoration: "none", padding: "8px 0" }}>
                  Ask on WhatsApp →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className={`${s.wrap} ${s.stack}`} style={{ paddingTop: 40, paddingBottom: 40, gap: 24 }}>
          <h2 className={`${s.h2s} ${s.reveal}`}>How to claim</h2>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {STEPS.map((step) => (
              <li key={step.n} className={`${s.card} ${s.lift} ${s.reveal} ${s.stack}`} style={{ padding: 28, gap: 12 }}>
                <span
                  className={s.display}
                  aria-hidden="true"
                  style={{ width: 56, height: 56, borderRadius: "50%", border: "5px solid var(--charcoal)", borderTopColor: "var(--orange)", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}
                >
                  {step.n}
                </span>
                <strong className={s.display} style={{ fontSize: 22 }}>
                  {step.title}
                </strong>
                <span className={s.cardText}>{step.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={s.wrap} style={{ paddingTop: 24, paddingBottom: 72 }}>
          <div className={`${s.reveal}`} style={{ borderRadius: 32, background: "var(--white)", padding: "clamp(22px, 3vw, 32px)", display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 className={s.display} style={{ margin: 0, fontSize: 20 }}>
              Offer terms
            </h2>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6, fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}>
              {TERMS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
