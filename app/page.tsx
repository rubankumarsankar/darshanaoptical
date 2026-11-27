import HomeHero from "./components/site/HomeHero";
import SiteShell from "./components/site/SiteShell";
import FrameFinder from "./components/site/FrameFinder";
import ProgressiveZones from "./components/site/ProgressiveZones";
import {
  BrandMarquee,
  EyeTest,
  LatestFrames,
  Lenses,
  Offer,
  Review,
  Services,
  Visit,
} from "./components/site/HomeSections";

export default function Home() {
  return (
    <SiteShell footerCta={false}>
      <HomeHero />
      <main>
        <BrandMarquee />
        <Services />
        <EyeTest />
        <FrameFinder />
        <Lenses />
        <ProgressiveZones />
        <LatestFrames />
        <Offer />
        <Review />
        <Visit />
      </main>
    </SiteShell>
  );
}
