import SiteShell from "../components/site/SiteShell";
import PageHero from "../components/site/PageHero";
import GalleryGrid from "../components/site/gallery/GalleryGrid";

export default function GalleryPage() {
  return (
    <SiteShell>
      <PageHero
        active="/gallery"
        crumb="Gallery"
        title={
          <>
            Inside our <span style={{ color: "var(--orange)" }}>store.</span>
          </>
        }
        lede="An authorized Essilor® and ZEISS dispensing clinic on Salem Bypass Road, Harur."
        ledeAside
      />
      <main style={{ paddingTop: 56 }}>
        <GalleryGrid />
      </main>
    </SiteShell>
  );
}
