import Link from "next/link";
import s from "./components/site/site.module.css";
import SiteShell from "./components/site/SiteShell";
import SiteHeader from "./components/site/SiteHeader";
import BookButton from "./components/site/BookButton";

const LINKS = [
  { href: "/eye-testing", title: "Eye testing", text: "Computerised test with a manual check" },
  { href: "/frames", title: "Frames", text: "500+ frames for men, women and kids" },
  { href: "/lenses", title: "Lenses", text: "Screen, sun-changing, night and thin lenses" },
  { href: "/progressive-lenses", title: "Progressive lenses", text: "One pair for near and far" },
  { href: "/offers", title: "Offers", text: "Current in-store offers" },
  { href: "/contact", title: "Contact", text: "Find us on Salem Bypass Road, Harur" },
] as const;

export default function NotFound() {
  return (
    <SiteShell footerCta={false}>
      <section className={s.hero}>
        <div className={s.ring} style={{ right: -160, top: -160, width: 560, height: 560 }} />
        <SiteHeader />
        <div className={s.heroBody} style={{ paddingTop: 36, paddingBottom: 72 }}>
          <div className={s.heroCopy} style={{ gap: 20 }}>
            <span className={`${s.eyebrow} ${s.up}`} style={{ color: "var(--orange)" }}>
              Error 404
            </span>
            <h1 className={`${s.pageH1} ${s.up} ${s.d1}`}>
              This page is <span style={{ color: "var(--orange)" }}>out of focus.</span>
            </h1>
            <p className={`${s.heroLede} ${s.up} ${s.d2}`}>The page you were looking for has moved or doesn&apos;t exist. Try one of these instead.</p>
            <div className={`${s.heroActions} ${s.up} ${s.d2}`}>
              <Link href="/" className={`${s.pill} ${s.pillOrange} ${s.btn}`} style={{ height: 58, padding: "0 28px", fontSize: 17 }}>
                Go to home
              </Link>
              <BookButton className={`${s.pill} ${s.btn} ${s.heroSecondary}`} style={{ height: 58 }}>
                Book eye test
              </BookButton>
            </div>
          </div>
          <div className={`${s.heroArtCenter} ${s.up} ${s.d1}`} aria-hidden="true">
            <span className={`${s.focus} ${s.display}`} style={{ fontSize: "clamp(120px, 20vw, 200px)", lineHeight: 1, color: "#FFFFFF" }}>
              404
            </span>
          </div>
        </div>
      </section>
      <main className={s.wrap} style={{ paddingTop: 64, paddingBottom: 72 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={`${s.card} ${s.lift} ${s.serviceCard}`} style={{ padding: 24, gap: 8 }}>
              <span className={s.cardTitle}>{l.title} →</span>
              <span className={s.cardText}>{l.text}</span>
            </Link>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
