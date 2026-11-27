import Image from "next/image";
import Link from "next/link";
import s from "./site.module.css";
import BookButton from "./BookButton";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "./data";

const EXPLORE = [
  { href: "/eye-testing", label: "Eye testing" },
  { href: "/frames", label: "Frames" },
  { href: "/lenses", label: "Lenses" },
  { href: "/progressive-lenses", label: "Progressive lenses" },
  { href: "/offers", label: "Offers" },
] as const;

const QUICK = [
  { href: "/book-eye-test", label: "Book eye test" },
  { href: "/frame-finder", label: "Smart frame finder" },
  { href: "/lens-finder", label: "Smart lens finder" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Store location" },
] as const;

export default function SiteFooter({ cta = true }: { cta?: boolean }) {
  return (
    <footer>
      {cta && (
        <div className={s.wrap} style={{ paddingTop: 0, paddingBottom: 56 }}>
          <div className={`${s.footerCta} ${s.reveal}`}>
            <div className={s.stack} style={{ gap: 8 }}>
              <span className={s.display} style={{ fontSize: "clamp(30px, 3.6vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
                Need an eye test or new glasses?
              </span>
              <span style={{ fontSize: 16, color: "#3A1A08" }}>
                Computerised eye check · 500+ frames · lenses for screens, reading and distance
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <BookButton className={`${s.pill} ${s.pillInk} ${s.btn}`} style={{ height: 56, padding: "0 26px", fontSize: 16 }}>
                Book eye test
              </BookButton>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className={`${s.pill} ${s.pillWhite} ${s.btn}`} style={{ height: 56, padding: "0 26px", fontSize: 16 }}>
                WhatsApp us
              </a>
            </div>
          </div>
        </div>
      )}
      <div className={s.footer}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 32px 28px", display: "flex", flexWrap: "wrap", gap: 40 }}>
          <div className={s.stack} style={{ flex: "2 1 280px", gap: 16 }}>
            <Image src="/logo-white.png" alt="Darshana Optical" width={600} height={377} sizes="104px" style={{ width: 104, height: "auto" }} />
            <p style={{ margin: 0, maxWidth: 340, fontSize: 16, lineHeight: 1.6 }}>
              Quality eye care. Stylish eyewear. Better vision for a better life.
            </p>
            <address className={s.footerContact}>
              Tvk Nagar, Salem Bypass Road, opposite Vasanth &amp; Co, Harur 636903
              <br />
              <a href={PHONE_TEL}>{PHONE_DISPLAY}</a> · <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </address>
          </div>
          <nav aria-label="Explore" className={s.footerNav}>
            <strong>Explore</strong>
            {EXPLORE.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Quick links" className={s.footerNav}>
            <strong>Quick links</strong>
            {QUICK.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className={s.footerBase}>
          <span>© {new Date().getFullYear()} Darshana Optical</span>
          <span style={{ display: "flex", gap: 18 }}>
            <Link href="/privacy-policy">Privacy policy</Link>
            <Link href="/terms-conditions">Terms &amp; conditions</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
