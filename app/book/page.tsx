import Image from "next/image";
import Link from "next/link";
import s from "../components/site/site.module.css";
import SiteShell from "../components/site/SiteShell";
import BookingForm from "../components/site/book/BookingForm";
import { WHATSAPP_URL } from "../components/site/data";

const PERKS = ["Computerised testing", "Near & distance check", "No obligation to buy"] as const;

export default function BookPage() {
  return (
    <SiteShell footerCta={false}>
      <header className={s.wrap} style={{ paddingTop: 18, paddingBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="" width={600} height={377} priority sizes="58px" style={{ height: 36, width: "auto" }} />
          <span className={s.display} style={{ fontSize: 22, fontWeight: 800, color: "var(--night)" }}>
            Darshana Optical
          </span>
        </Link>
        <Link href="/" style={{ fontSize: 14, fontWeight: 700, textDecoration: "none", padding: "12px 0" }}>
          ← Back to home
        </Link>
      </header>

      <main className={s.wrap} style={{ paddingTop: 16, paddingBottom: 72, display: "flex", flexWrap: "wrap", gap: 28, alignItems: "flex-start" }}>
        <div className={`${s.up} ${s.stack}`} style={{ flex: "1 1 340px", borderRadius: 40, background: "var(--night)", color: "var(--white)", padding: "clamp(28px, 4vw, 40px)", gap: 20 }}>
          <span className={s.eyebrow} style={{ fontSize: 13, color: "var(--orange)" }}>
            Free eye test
          </span>
          <h1 className={s.display} style={{ margin: 0, fontSize: "clamp(36px, 4.4vw, 48px)", lineHeight: 1.02, fontWeight: 800, letterSpacing: "-0.03em" }}>
            Book your slot in under a minute.
          </h1>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#BDBFC8" }}>
            Pick a day and time. We&apos;ll call to confirm, and the test takes about 15–20 minutes.
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "#D4D5DB" }}>
            {PERKS.map((p) => (
              <li key={p} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span aria-hidden="true" style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--night-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--orange)", fontWeight: 800 }}>
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className={s.pill}
            style={{ alignSelf: "flex-start", height: 48, padding: "0 18px", borderRadius: 14, background: "#0F7A50", color: "#FFFFFF", fontSize: 14 }}
          >
            Prefer WhatsApp?
          </a>
        </div>

        <section
          aria-label="Booking form"
          className={`${s.up} ${s.d1}`}
          style={{
            flex: "2 1 520px",
            minWidth: 0,
            background: "var(--white)",
            borderRadius: 40,
            padding: "clamp(22px, 4vw, 36px)",
            boxShadow: "0 1px 2px rgba(30,41,80,.04), 0 16px 40px rgba(30,41,80,.08)",
            boxSizing: "border-box",
          }}
        >
          <BookingForm />
        </section>
      </main>
    </SiteShell>
  );
}
