import Image from "next/image";
import s from "../site.module.css";
import { SUNGLASSES } from "../data";
import { ShopLink } from "../ShopContact";

export default function SunglassesShowcase() {
  return (
    <section id="sunglasses" className={`${s.wrap} ${s.stack}`} style={{ paddingTop: 56, gap: 24 }}>
      <div className={s.reveal}>
        <h2 className={s.h2s}>Sunglasses</h2>
        <p style={{ margin: "8px 0 0", color: "var(--ink-soft)", lineHeight: 1.6 }}>
          100% UV400 protection, with polarised and power-sunglass options made to your prescription.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
        {SUNGLASSES.map((g) => (
          <article key={g.name} className={`${s.card} ${s.lift} ${s.reveal}`} style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <span className={s.frameStage} style={{ height: 240, borderRadius: 24 }}>
              <Image src={g.image} alt={`${g.name} sunglasses, ${g.detail.toLowerCase()}`} fill sizes="(max-width: 700px) 90vw, 420px" style={{ objectFit: "cover" }} />
            </span>
            <span style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 4 }}>
              <strong style={{ fontSize: 17 }}>{g.name}</strong>
              <small style={{ fontSize: 14, color: "var(--ink-soft)" }}>{g.detail}</small>
            </span>
            <ShopLink kind="whatsapp" message={`Hello Darshana Optical, I'd like to see your ${g.name.toLowerCase()} sunglasses.`}
             
              target="_blank"
              rel="noreferrer"
              className={`${s.pill} ${s.btn}`}
              style={{ height: 46, background: "var(--paper)", color: "var(--ink)", fontSize: 14 }}
            >
              Ask about these
            </ShopLink>
          </article>
        ))}
      </div>
    </section>
  );
}
