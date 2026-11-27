import SiteShell from "../components/site/SiteShell";
import PageHero from "../components/site/PageHero";
import FrameFinder from "../components/site/FrameFinder";
import ShapeGuide from "../components/site/frames/ShapeGuide";

export default function FrameFinderPage() {
  return (
    <SiteShell>
      <PageHero
        active="/frames"
        crumb="Frame finder"
        title={
          <>
            Frames that <span style={{ color: "var(--orange)" }}>suit your face.</span>
          </>
        }
        lede="Pick your face shape and budget and we'll show frames worth trying. Then come in and try them on."
      />
      <main style={{ paddingTop: 24 }}>
        <FrameFinder />
        <ShapeGuide finderLink={false} />
      </main>
    </SiteShell>
  );
}
