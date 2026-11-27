import Link from "next/link";
import s from "./site.module.css";
import SiteShell from "./SiteShell";
import PageHero from "./PageHero";

interface LegalPageProps {
  crumb: string;
  title: string;
  updated: string;
  sections: readonly { title: string; body: string }[];
}

/** Long-form policy page in the site design. */
export default function LegalPage({ crumb, title, updated, sections }: LegalPageProps) {
  return (
    <SiteShell>
      <PageHero crumb={crumb} title={title} lede={`Last updated: ${updated}`} />
      <main className={s.wrap} style={{ paddingTop: 64, paddingBottom: 72 }}>
        <div className={`${s.panelWhite} ${s.prose}`}>
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          <p>
            Questions? <Link href="/contact">Contact us</Link>.
          </p>
        </div>
      </main>
    </SiteShell>
  );
}
