import s from "./site.module.css";
import BookButton from "./BookButton";
import SiteHeader from "./SiteHeader";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FD5A05" strokeWidth="2.6" strokeLinecap="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Lens glasses with an eye chart that drifts in and out of focus. */
function FocusGlasses() {
  return (
    <svg role="img" aria-label="Glasses with an eye chart coming into focus" viewBox="0 0 600 400">
      <g className={s.focus} fill="#FFFFFF" fontFamily="var(--display)" fontWeight="700" textAnchor="middle">
        <text x="150" y="232" fontSize="78">E</text>
        <text x="150" y="284" fontSize="34" letterSpacing="8">F P</text>
        <text x="150" y="318" fontSize="20" letterSpacing="6">T O Z</text>
      </g>
      <g fill="#FFFFFF" fontFamily="var(--display)" fontWeight="700" textAnchor="middle">
        <text x="450" y="230" fontSize="22" fill="#9A9CA6" letterSpacing="4">VISION</text>
        <text x="450" y="290" fontSize="64">6/6</text>
      </g>
      <circle className={s.draw} cx="150" cy="250" r="121" fill="none" stroke="#FFFFFF" strokeWidth="22" />
      <circle className={`${s.draw} ${s.draw2}`} cx="450" cy="250" r="121" fill="none" stroke="#FFFFFF" strokeWidth="22" />
      <path d="M271 248h58M260 20v228" stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round" fill="none" />
      <path className={s.glint} d="M78 266a74 74 0 0 1 64-86" stroke="#FD5A05" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path className={s.glint} d="M378 266a74 74 0 0 1 64-86" stroke="#FD5A05" strokeWidth="14" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function HomeHero() {
  return (
    <section className={s.hero}>
      <div className={s.ring} style={{ right: -180, top: -180, width: 620, height: 620 }} />
      <div className={s.ring} style={{ right: -60, top: -60, width: 380, height: 380 }} />

      <SiteHeader />

      <div className={s.heroBody}>
        <div className={s.heroCopy}>
          <span className={`${s.badge} ${s.up}`}>
            <b>Harur</b>Authorized Essilor® &amp; ZEISS clinic
          </span>
          <h1 className={`${s.h1} ${s.up} ${s.d1}`}>
            Clear vision.
            <br />
            Confident <span style={{ color: "var(--orange)" }}>you.</span>
          </h1>
          <p className={`${s.heroLede} ${s.up} ${s.d2}`}>
            Get your eyes tested and choose comfortable glasses that suit your face, daily work and budget.
          </p>
          <div className={`${s.heroActions} ${s.up} ${s.d3}`}>
            <BookButton className={`${s.pill} ${s.pillOrange} ${s.btn} ${s.heroPrimary}`}>
              Book free eye test
              <span>
                <ArrowIcon />
              </span>
            </BookButton>
            <a href="#frames" className={`${s.pill} ${s.btn} ${s.heroSecondary}`}>
              Explore 500+ frames
            </a>
          </div>
        </div>

        <div className={`${s.heroArt} ${s.up} ${s.d2}`}>
          <FocusGlasses />
          <div className={`${s.floatChip} ${s.float}`}>
            <span className={s.iconDot}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B83E00" strokeWidth="2.4" strokeLinecap="round">
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <span>
              <strong>Computerised eye test</strong>
              <small>AR-810A auto refractometer</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
