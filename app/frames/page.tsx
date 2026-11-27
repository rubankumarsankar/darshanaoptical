import s from "../components/site/site.module.css";
import SiteShell from "../components/site/SiteShell";
import PageHero from "../components/site/PageHero";
import FramesBrowser from "../components/site/frames/FramesBrowser";
import ShapeGuide from "../components/site/frames/ShapeGuide";

function FloatingGlasses() {
  return (
    <div aria-hidden="true" style={{ position: "relative", width: "100%", height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span className={s.spin} style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", border: "2px dashed #4A4B53" }} />
      <span style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "var(--night-2)" }} />
      <svg
        className={s.tiltFloat}
        width="380"
        height="170"
        viewBox="1 5 22 14"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth=".9"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ position: "relative", maxWidth: "100%", height: "auto" }}
      >
        <path d="M2.5 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0zM13.5 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0zM10.5 11c1-.8 2-.8 3 0M2.6 11.2L1.2 9.6M21.4 11.2l1.4-1.6" />
        <path d="M4.2 11.2a2.4 2.4 0 0 1 2-2M15.2 11.2a2.4 2.4 0 0 1 2-2" stroke="#FD5A05" strokeWidth="1" />
      </svg>
    </div>
  );
}

export default function FramesPage() {
  return (
    <SiteShell>
      <PageHero
        active="/frames"
        crumb="Frames"
        title={
          <>
            500+ frames.
            <br />
            <span style={{ color: "var(--orange)" }}>One that&apos;s you.</span>
          </>
        }
        lede="Everyday, premium, kids and sunglasses. Come in and try them on, and we'll help you choose what suits your face."
        art={<FloatingGlasses />}
      />
      <main>
        <FramesBrowser />
        <ShapeGuide />
      </main>
    </SiteShell>
  );
}
