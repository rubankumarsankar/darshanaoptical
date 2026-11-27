import s from "../components/site/site.module.css";
import SiteShell from "../components/site/SiteShell";
import SiteHeader from "../components/site/SiteHeader";
import ContactForm from "../components/site/contact/ContactForm";
import { EMAIL, MAPS_URL, MAP_EMBED_URL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "../components/site/data";
import Link from "next/link";

type Tone = "dark" | "light" | "orange";

const WAYS: readonly { title: string; text: string; href: string; icon: string; tone: Tone; external?: boolean }[] = [
  {
    title: "Visit",
    text: "Tvk Nagar, Salem Bypass Road, opposite Vasanth & Co, Harur 636903",
    href: MAPS_URL,
    icon: "M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
    tone: "dark",
    external: true,
  },
  {
    title: "Call",
    text: PHONE_DISPLAY,
    href: PHONE_TEL,
    icon: "M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
    tone: "light",
  },
  {
    title: "WhatsApp",
    text: "Chat with us for frame photos, prices and bookings",
    href: WHATSAPP_URL,
    icon: "M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z",
    tone: "orange",
    external: true,
  },
  { title: "Email", text: EMAIL, href: `mailto:${EMAIL}`, icon: "M3 5h18v14H3zM3 6l9 7 9-7", tone: "light" },
];

const TONES: Record<Tone, { box: string; color: string; icoBg: string; icoColor: string; text: string }> = {
  dark: { box: "var(--night)", color: "var(--white)", icoBg: "var(--orange)", icoColor: "var(--ink)", text: "#BDBFC8" },
  orange: { box: "var(--orange)", color: "var(--ink)", icoBg: "var(--ink)", icoColor: "var(--orange)", text: "#3A1A08" },
  light: { box: "var(--white)", color: "var(--ink)", icoBg: "var(--paper)", icoColor: "var(--ink)", text: "var(--muted)" },
};

function Pulse({ color, size }: { color: string; size: number }) {
  return (
    <span aria-hidden="true" style={{ position: "relative", width: size, height: size, flex: "none" }}>
      <span className={s.ping} style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }} />
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }} />
    </span>
  );
}

export default function ContactPage() {
  return (
    <SiteShell>
      <section className={s.hero}>
        <SiteHeader active="/contact" />
        <div className={s.wrap} style={{ paddingTop: 36, paddingBottom: 64, display: "flex", flexDirection: "column", gap: 18 }}>
          <nav aria-label="Breadcrumb" className={`${s.crumb} ${s.up}`}>
            <Link href="/">Home</Link> / <span aria-current="page">Contact</span>
          </nav>
          <h1 className={`${s.pageH1} ${s.up} ${s.d1}`}>
            Come see us <span style={{ color: "var(--orange)" }}>in Harur.</span>
          </h1>
          <span
            className={`${s.up} ${s.d2}`}
            style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 999, background: "var(--night-2)", fontSize: 15, fontWeight: 600 }}
          >
            <Pulse color="#2BC27A" size={10} />
            Open all 7 days · 9:30 AM – 9:00 PM
          </span>
        </div>
      </section>

      <main>
        <section className={s.wrap} style={{ paddingTop: 64, paddingBottom: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
          {WAYS.map((w) => {
            const t = TONES[w.tone];
            return (
              <a
                key={w.title}
                href={w.href}
                {...(w.external ? { target: "_blank", rel: "noreferrer" } : {})}
                className={`${s.lift} ${s.reveal}`}
                style={{ textDecoration: "none", borderRadius: 32, padding: 26, display: "flex", flexDirection: "column", gap: 14, background: t.box, color: t.color }}
              >
                <span style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: t.icoBg, color: t.icoColor }}>
                  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={w.icon} />
                  </svg>
                </span>
                <strong className={s.display} style={{ fontSize: 22 }}>
                  {w.title}
                </strong>
                <span style={{ fontSize: 15, lineHeight: 1.55, color: t.text, overflowWrap: "anywhere" }}>{w.text}</span>
              </a>
            );
          })}
        </section>

        <section className={s.wrap} style={{ paddingTop: 32, paddingBottom: 72, display: "flex", flexWrap: "wrap", gap: 18, alignItems: "stretch" }}>
          <div className={`${s.reveal} ${s.stack}`} style={{ flex: "1 1 420px", borderRadius: 40, background: "var(--white)", padding: "clamp(24px, 4vw, 36px)", gap: 16 }}>
            <ContactForm />
          </div>
          <div className={`${s.mapCard} ${s.reveal}`} style={{ minHeight: 460 }}>
            <iframe title="Darshana Optical on Google Maps" src={MAP_EMBED_URL} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noreferrer"
              className={`${s.pill} ${s.pillDark} ${s.btn}`}
              style={{ position: "absolute", right: 20, bottom: 20, height: 50, padding: "0 20px", fontSize: 15 }}
            >
              Open in Google Maps
            </a>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
