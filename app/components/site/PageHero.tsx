import type { ReactNode } from "react";
import Link from "next/link";
import s from "./site.module.css";
import SiteHeader from "./SiteHeader";

interface PageHeroProps {
  /** Nav href to highlight, e.g. "/frames". */
  active?: string;
  /** Last breadcrumb label. */
  crumb: string;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  /** Illustration on the right. Omit for a text-only hero. */
  art?: ReactNode;
  /** Text-only heroes can put the lede beside the title instead of under it. */
  ledeAside?: boolean;
}

/** Dark rounded hero with the site header, used at the top of inner pages. */
export default function PageHero({ active, crumb, title, lede, actions, art, ledeAside }: PageHeroProps) {
  return (
    <section className={s.hero}>
      <div className={s.ring} style={{ right: -160, top: -160, width: 560, height: 560 }} />
      <SiteHeader active={active} />
      <div className={s.heroBody} style={{ paddingTop: 36, paddingBottom: 72, ...(ledeAside ? { alignItems: "flex-end", justifyContent: "space-between" } : {}) }}>
        <div className={s.heroCopy} style={{ gap: 20, flexGrow: ledeAside ? 0 : 1 }}>
          <nav aria-label="Breadcrumb" className={`${s.crumb} ${s.up}`}>
            <Link href="/">Home</Link> / <span aria-current="page">{crumb}</span>
          </nav>
          <h1 className={`${s.pageH1} ${s.up} ${s.d1}`}>{title}</h1>
          {lede && !ledeAside && <p className={`${s.heroLede} ${s.up} ${s.d2}`}>{lede}</p>}
          {actions && <div className={`${s.heroActions} ${s.up} ${s.d2}`}>{actions}</div>}
        </div>
        {lede && ledeAside && (
          <p className={`${s.heroLede} ${s.up} ${s.d2}`} style={{ maxWidth: 420 }}>
            {lede}
          </p>
        )}
        {art && <div className={`${s.heroArtCenter} ${s.up} ${s.d1}`}>{art}</div>}
      </div>
    </section>
  );
}
