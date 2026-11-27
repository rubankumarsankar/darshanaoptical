import Link from "next/link";
import s from "./site.module.css";
import BookButton from "./BookButton";
import FrameGlyph from "./FrameGlyph";
import {
  BRANDS,
  EMAIL,
  EYE_CHART,
  FRAMES,
  LENSES,
  MAPS_URL,
  MAP_EMBED_URL,
  PHONE_DISPLAY,
  PHONE_TEL,
  SERVICES,
  TEST_STEPS,
  WHATSAPP_URL,
  formatPrice,
} from "./data";

export function BrandMarquee() {
  // The list is rendered twice so the -50% translate loops seamlessly.
  const loop = [...BRANDS, ...BRANDS];
  return (
    <div className={s.marqueeTrack}>
      <p className="sr-only">Brands we carry: {BRANDS.join(", ")}</p>
      <div className={`${s.marqueeRow} ${s.marquee}`} aria-hidden="true">
        {loop.map((brand, i) => (
          <span key={`${brand}-${i}`} className={s.marqueeItem}>
            {brand}
            <span className={s.marqueeDot} />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Services() {
  return (
    <section className={`${s.wrap} ${s.stack}`} style={{ paddingTop: 72, paddingBottom: 40, gap: 36 }}>
      <div className={`${s.headRow} ${s.reveal}`}>
        <h2 className={s.h2} style={{ maxWidth: 640 }}>
          Everything for your eyes, <span style={{ color: "var(--orange)" }}>in one place.</span>
        </h2>
        <p className={s.lede} style={{ maxWidth: 380 }}>
          From the first test to the final fitting, we help you choose what works for your face, your work and your
          budget.
        </p>
      </div>
      <div className={s.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
        {SERVICES.map((service) => (
          <a key={service.title} href={service.href} className={`${s.card} ${s.serviceCard} ${s.lift} ${s.lens} ${s.reveal}`}>
            <span className={s.lensIcon}>
              <span className={s.arc} />
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#36363E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d={service.icon} />
              </svg>
            </span>
            <span className={s.cardTitle}>{service.title}</span>
            <span className={s.cardText}>{service.text}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export function EyeTest() {
  const last = EYE_CHART.length - 1;
  return (
    <section id="test" className={s.wrap}>
      <div className={`${s.panel} ${s.reveal}`} style={{ background: "var(--white)" }}>
        <div className={s.chart} role="img" aria-label="Snellen eye chart, from 6/60 down to 6/6">
          {EYE_CHART.map((row, i) => (
            <div key={row.acuity} className={s.chartRow}>
              <span>{row.acuity}</span>
              <span
                className={s.chartLetters}
                style={{ fontSize: `calc(${row.size}px * var(--chart-scale))`, color: i === last ? "var(--orange-ink)" : "var(--ink)" }}
              >
                {row.letters}
              </span>
              <span />
            </div>
          ))}
          <span className={s.chartRule} />
        </div>

        <div className={s.stack} style={{ flex: "1 1 420px", gap: 22 }}>
          <span className={s.eyebrow}>Eye examination</span>
          <h2 className={s.h2}>Know your correct eye power.</h2>
          <div className={s.steps}>
            {TEST_STEPS.map((step) => (
              <div key={step.n} className={s.step}>
                <b>{step.n}</b>
                <strong>{step.title}</strong>
                <span>{step.text}</span>
              </div>
            ))}
          </div>
          <BookButton
            className={`${s.pill} ${s.pillDark} ${s.btn}`}
            style={{ alignSelf: "flex-start", height: 56, padding: "0 26px", fontSize: 16 }}
          >
            Book a free test slot
          </BookButton>
        </div>
      </div>
    </section>
  );
}

export function Lenses() {
  return (
    <section id="lenses" className={`${s.wrap} ${s.stack}`} style={{ gap: 32 }}>
      <div className={`${s.stack} ${s.reveal}`} style={{ gap: 12, maxWidth: 700 }}>
        <span className={s.eyebrow}>Lenses</span>
        <h2 className={s.h2}>The right lens for how you live.</h2>
      </div>
      <div className={s.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
        {LENSES.map((lens) => (
          <div key={lens.title} className={`${s.card} ${s.lensCard} ${s.lift} ${s.reveal}`}>
            <span
              aria-hidden="true"
              className={`${s.lensDisc} ${lens.effect === "tint" ? s.tint : ""}`}
              style={{ background: lens.background }}
            >
              {lens.effect === "glare" && <span className={`${s.glareStripe} ${s.glare}`} />}
            </span>
            <span className={s.cardTitle} style={{ fontSize: 20 }}>
              {lens.title}
            </span>
            <span className={s.cardText} style={{ fontSize: 14, lineHeight: 1.55 }}>
              {lens.text}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LatestFrames() {
  return (
    <section className={`${s.wrap} ${s.stack}`} style={{ gap: 32 }}>
      <div className={`${s.headRow} ${s.reveal}`}>
        <h2 className={s.h2}>Latest frames</h2>
        <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" style={{ fontSize: 16, fontWeight: 700, textDecoration: "none", padding: "10px 0" }}>
          Ask about a frame on WhatsApp →
        </a>
      </div>
      <div className={s.grid} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}>
        {FRAMES.map((frame) => (
          <article
            key={frame.model}
            className={`${s.card} ${s.lift} ${s.lens} ${s.reveal}`}
            style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}
          >
            <span className={s.frameStage} style={{ height: 180, borderRadius: 24 }}>
              <span
                className={s.arc}
                style={{
                  position: "absolute",
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  border: "2px solid transparent",
                  borderTopColor: "var(--orange)",
                  borderRightColor: "var(--orange)",
                }}
              />
              <FrameGlyph style={frame.style} width={190} height={88} />
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: 12,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "var(--white)",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {frame.model}
              </span>
            </span>
            <span className={s.frameMeta} style={{ padding: "0 8px 6px" }}>
              <span>
                <strong style={{ fontSize: 17 }}>{frame.style}</strong>
                <small style={{ fontSize: 14 }}>{frame.color}</small>
              </span>
              <span className={s.price} style={{ fontSize: 24 }}>
                {formatPrice(frame.price)}
              </span>
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Offer() {
  return (
    <section id="offer" className={s.wrap} style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className={`${s.offer} ${s.reveal}`}>
        <div className={`${s.offerRing} ${s.spin}`} />
        <div className={s.stack} style={{ flex: "1 1 420px", gap: 12, position: "relative" }}>
          <span className={s.eyebrow} style={{ color: "var(--ink)" }}>
            Offer
          </span>
          <h2 className={s.offerTitle}>Computer glasses from ₹1,499*</h2>
          <p className={s.lede} style={{ fontSize: 16, color: "#3A1A08" }}>
            Frame and screen-use lenses for long phone and laptop days. *Terms apply, ask in store for details.
          </p>
        </div>
        <Link
          href="/offers"
          className={`${s.pill} ${s.pillInk} ${s.btn}`}
          style={{ position: "relative", height: 60, padding: "0 30px", fontSize: 17 }}
        >
          View offer details
        </Link>
      </div>
    </section>
  );
}

export function Review() {
  return (
    <section className={s.wrap} style={{ paddingTop: 40, paddingBottom: 40, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "stretch" }}>
      <figure
        className={`${s.card} ${s.reveal}`}
        style={{ flex: "2 1 520px", margin: 0, borderRadius: 40, padding: "clamp(28px, 4vw, 44px)", display: "flex", flexDirection: "column", gap: 22 }}
      >
        <span className={s.quoteMark} aria-hidden="true" />
        <blockquote className={s.quote}>
          “The eye test was clear and the staff explained everything simply. I also found a frame I liked.”
        </blockquote>
        <figcaption style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}>Priya S. · Google review</figcaption>
      </figure>
      <div
        className={s.reveal}
        style={{
          flex: "1 1 300px",
          borderRadius: 40,
          background: "var(--night)",
          color: "var(--white)",
          padding: 40,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: "#BDBFC8" }}>Reviewed on Google</span>
        <span className={s.display} style={{ fontSize: "clamp(36px, 4vw, 44px)", lineHeight: 1.05, color: "var(--orange)" }}>
          Trusted by families across Harur.
        </span>
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noreferrer"
          className={`${s.pill} ${s.pillWhite} ${s.btn}`}
          style={{ alignSelf: "flex-start", height: 50, padding: "0 22px", fontSize: 15 }}
        >
          Read all reviews
        </a>
      </div>
    </section>
  );
}

export function Visit() {
  return (
    <section id="visit" className={s.wrap} style={{ paddingTop: 40, paddingBottom: 88, display: "flex", flexWrap: "wrap", gap: 20 }}>
      <div className={`${s.stack} ${s.reveal}`} style={{ flex: "1 1 420px", gap: 18 }}>
        <h2 className={s.h2}>Visit us in Harur.</h2>
        <div className={s.stack} style={{ gap: 10 }}>
          <address className={s.infoTile} style={{ fontStyle: "normal" }}>
            <strong>Address</strong>
            Tvk Nagar, Salem Bypass Road, opposite Vasanth &amp; Co, Harur 636903
          </address>
          <div className={s.infoTile}>
            <strong>Hours</strong>
            Monday to Sunday, 9:30 AM – 9:00 PM
          </div>
          <div className={s.infoTile}>
            <strong>Phone &amp; email</strong>
            <a href={PHONE_TEL}>{PHONE_DISPLAY}</a> · <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={`${s.pill} ${s.pillOrange} ${s.btn}`} style={{ height: 54, padding: "0 24px", fontSize: 16 }}>
            WhatsApp us
          </a>
          <a href={PHONE_TEL} className={`${s.pill} ${s.pillDark} ${s.btn}`} style={{ height: 54, padding: "0 24px", fontSize: 16 }}>
            Call now
          </a>
          <a href={MAPS_URL} target="_blank" rel="noreferrer" className={`${s.pill} ${s.pillOutline} ${s.btn}`} style={{ height: 54, padding: "0 24px", fontSize: 16 }}>
            Get directions
          </a>
        </div>
      </div>
      <div className={`${s.mapCard} ${s.reveal}`}>
        <iframe title="Darshana Optical on Google Maps" src={MAP_EMBED_URL} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      </div>
    </section>
  );
}
