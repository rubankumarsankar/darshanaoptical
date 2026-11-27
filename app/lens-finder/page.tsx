import Link from "next/link";
import s from "../components/site/site.module.css";
import SiteShell from "../components/site/SiteShell";
import PageHero from "../components/site/PageHero";
import LensFinder from "../components/site/lenses/LensFinder";

export default function LensFinderPage() {
  return (
    <SiteShell>
      <PageHero
        active="/lenses"
        crumb="Lens finder"
        title={
          <>
            Find the right lens <span style={{ color: "var(--orange)" }}>in a minute.</span>
          </>
        }
        lede="Tell us about your day and we'll suggest lenses to try. We confirm everything after your eye test."
      />
      <main>
        <LensFinder />
        <p className={s.wrap} style={{ paddingTop: 8, paddingBottom: 72, textAlign: "center", fontSize: 16 }}>
          <Link href="/lenses" style={{ fontWeight: 700, textDecoration: "none" }}>
            Compare all lens types and brands →
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
