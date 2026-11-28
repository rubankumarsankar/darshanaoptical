import Image from "next/image";
import s from "../components/site/site.module.css";
import SiteShell from "../components/site/SiteShell";
import PageHero from "../components/site/PageHero";
import BookButton from "../components/site/BookButton";
import Faq, { type FaqItem } from "../components/site/Faq";
import SymptomCheck from "../components/site/eye-testing/SymptomCheck";
import { ShopLink, ShopText } from "../components/site/ShopContact";

const STEPS = [
  { n: "01", title: "Quick history", text: "Tell us about your work, screen time and any trouble you have seeing.", time: "About 2 min" },
  { n: "02", title: "Computerised check", text: "The auto refractometer takes a digital reading of your eye power.", time: "About 3 min" },
  { n: "03", title: "Manual confirmation", text: "We fine-tune the power for near and distance until it feels clear.", time: "About 10 min" },
  { n: "04", title: "Simple guidance", text: "We explain your prescription and lens options without jargon.", time: "About 5 min" },
] as const;

const FAQS: readonly FaqItem[] = [
  { q: "How long does the eye test take?", a: "Usually around 15 to 20 minutes, including the computerised check, manual confirmation and a chat about your options." },
  { q: "Do I need an appointment, or can I walk in?", a: "Walk-ins are welcome. Booking a slot means you won't have to wait." },
  { q: "Do I have to buy glasses after the test?", a: "No. The test is there to tell you your correct power. You are free to decide what to do next." },
  { q: "Can children and seniors get their eyes tested?", a: "Yes. We check both near and distance vision for children, adults and seniors." },
  { q: "Should I bring my current glasses?", a: "Yes, please. It helps us compare your old power with the new one." },
  { q: "Will I get a copy of my prescription?", a: "Yes. You get a clear written copy of your prescription after the test." },
];

function FocusingChart() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: "min(360px, 100%)",
        aspectRatio: "1",
        borderRadius: "50%",
        border: "22px solid #FFFFFF",
        boxSizing: "border-box",
        overflow: "hidden",
        background: "var(--night-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className={`${s.focusLoop} ${s.display}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#FFFFFF" }}>
        <span style={{ fontSize: 68, lineHeight: 1 }}>E</span>
        <span style={{ fontSize: 32, letterSpacing: ".3em" }}>F P</span>
        <span style={{ fontSize: 20, letterSpacing: ".3em" }}>T O Z</span>
        <span style={{ fontSize: 14, letterSpacing: ".3em" }}>L P E D</span>
      </div>
      <span className={s.scan} style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 3, background: "var(--orange)", boxShadow: "0 0 18px var(--orange)" }} />
      <span
        className={s.spin}
        style={{ position: "absolute", inset: 14, borderRadius: "50%", border: "6px solid transparent", borderTopColor: "var(--orange)", borderLeftColor: "var(--orange)" }}
      />
    </div>
  );
}

export default function EyeTestingPage() {
  return (
    <SiteShell>
      <PageHero
        active="/eye-testing"
        crumb="Eye testing"
        title={
          <>
            Know your correct <span style={{ color: "var(--orange)" }}>eye power.</span>
          </>
        }
        lede="Computerised testing on our AR-810A auto refractometer, confirmed by a careful manual check for near and distance. Every number explained in simple words."
        actions={
          <>
            <BookButton className={`${s.pill} ${s.pillOrange} ${s.btn}`} style={{ height: 58, padding: "0 28px", fontSize: 17 }}>
              Book a free test slot
            </BookButton>
            <ShopLink kind="tel" className={`${s.pill} ${s.btn} ${s.heroSecondary}`} style={{ height: 58 }}>
              Call <ShopText field="phone" />
            </ShopLink>
          </>
        }
        art={<FocusingChart />}
      />

      <main>
        <section className={`${s.wrap} ${s.stack}`} style={{ paddingTop: 80, paddingBottom: 40, gap: 32 }}>
          <h2 className={`${s.h2} ${s.reveal}`}>How your test works</h2>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {STEPS.map((step) => (
              <li key={step.n} className={`${s.card} ${s.lift} ${s.reveal}`} style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
                <span className={s.display} aria-hidden="true" style={{ fontSize: 64, lineHeight: 1, color: "#E8E5DF" }}>
                  {step.n}
                </span>
                <span className={s.cardTitle}>{step.title}</span>
                <span className={s.cardText}>{step.text}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--orange-ink)" }}>{step.time}</span>
              </li>
            ))}
          </ol>
        </section>

        <SymptomCheck />

        <section className={s.wrap} style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className={`${s.panelDark} ${s.reveal}`} style={{ display: "flex", flexWrap: "wrap", gap: 40, alignItems: "center" }}>
            <div style={{ flex: "1 1 340px", position: "relative", minHeight: 300, borderRadius: 32, overflow: "hidden", background: "var(--night-2)" }}>
              <Image
                src="/images/equip-autorefractometer.jpg"
                alt="AR-810A auto refractometer at Darshana Optical"
                fill
                sizes="(max-width: 800px) 100vw, 560px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className={s.stack} style={{ flex: "1 1 420px", gap: 16 }}>
              <span className={s.eyebrow} style={{ color: "var(--orange)" }}>
                Our equipment
              </span>
              <h2 className={s.h2s}>AR-810A auto refractometer</h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "#BDBFC8" }}>
                Digital, computerised testing gives a quick and accurate starting reading of your eye power. We then confirm it by
                hand so your glasses feel right, not just measure right.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span className={s.softChip}>Computerised eye testing</span>
                <span className={s.softChip}>Correct eye power check</span>
                <span className={s.softChip}>Near &amp; distance vision</span>
              </div>
            </div>
          </div>
        </section>

        <Faq title="Common questions" items={FAQS} />
      </main>
    </SiteShell>
  );
}
