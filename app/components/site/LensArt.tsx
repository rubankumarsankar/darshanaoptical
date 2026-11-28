import type { CSSProperties } from "react";

export type LensKind = "screen" | "sun" | "night" | "thin" | "progressive";

const RIM = "#2C2D33";
const ORANGE = "#FD5A05";

/**
 * Small illustration of what each lens type does, drawn as SVG so it is
 * instant to load and sharp at any size. Decorative: the card text says it.
 */
export default function LensArt({ kind, size = 160, style }: { kind: LensKind; size?: number; style?: CSSProperties }) {
  const id = `lens-${kind}`;
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" aria-hidden="true" style={{ display: "block", flex: "none", ...style }}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <circle cx="80" cy="80" r="62" />
        </clipPath>
      </defs>
      {ART[kind](id)}
    </svg>
  );
}

const rim = <circle cx="80" cy="80" r="62" fill="none" stroke={RIM} strokeWidth="9" />;
const shine = <path d="M42 60a40 40 0 0 1 22-24" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="5" strokeLinecap="round" />;

const ART: Record<LensKind, (id: string) => React.ReactNode> = {
  // Blue light from a screen is stopped at the lens; behind it the view is calm.
  screen: (id) => (
    <>
      <circle cx="80" cy="80" r="62" fill="#E8F0FF" />
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="44" y="58" width="72" height="46" rx="6" fill="#1E2A4A" />
        <rect x="50" y="64" width="60" height="34" rx="3" fill="#FFF6E5" />
        <rect x="56" y="70" width="30" height="4" rx="2" fill="#E9D7B6" />
        <rect x="56" y="78" width="44" height="4" rx="2" fill="#E9D7B6" />
        <rect x="56" y="86" width="22" height="4" rx="2" fill="#E9D7B6" />
        <rect x="66" y="104" width="28" height="5" rx="2" fill="#1E2A4A" />
      </g>
      {[30, 52, 74].map((y) => (
        <g key={y}>
          <path d={`M4 ${y + 10} q6 -8 12 0 t12 0`} fill="none" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
          <path d={`M28 ${y + 10} h-1`} stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      ))}
      {rim}
      {shine}
      <circle cx="132" cy="128" r="16" fill={ORANGE} />
      <path d="M125 128l5 5 9-10" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  // Clear on the indoor side, dark on the sunny side.
  sun: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-tint`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3F5F7" />
          <stop offset=".45" stopColor="#E3E6EA" />
          <stop offset=".55" stopColor="#6B6E76" />
          <stop offset="1" stopColor="#3A3C42" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="62" fill={`url(#${id}-tint)`} />
      <g transform="translate(128 30)">
        <circle r="13" fill="#FFB020" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <path key={a} d="M0 -19v-7" stroke="#FFB020" strokeWidth="3.5" strokeLinecap="round" transform={`rotate(${a})`} />
        ))}
      </g>
      {rim}
      {shine}
    </>
  ),

  // Headlight glare is large outside the lens and soft through it.
  night: (id) => (
    <>
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#FFF6C8" />
          <stop offset=".35" stopColor="#FFE27A" stopOpacity=".7" />
          <stop offset="1" stopColor="#FFE27A" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-card`}>
          <rect width="160" height="160" rx="28" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="160" height="160" rx="28" fill="#1C2031" />
      <g clipPath={`url(#${id}-card)`}>
        <circle cx="22" cy="34" r="46" fill={`url(#${id}-glow)`} />
        <circle cx="138" cy="34" r="46" fill={`url(#${id}-glow)`} />
      </g>
      <g clipPath={`url(#${id}-clip)`}>
        <rect x="0" y="0" width="160" height="160" fill="#262B40" />
        <path d="M80 70 L30 150 H130 Z" fill="#3A3F57" />
        <path d="M80 92v10M80 112v12M80 134v14" stroke="#E7E3D2" strokeWidth="3" strokeLinecap="round" />
        <circle cx="66" cy="82" r="5" fill="#FFF6C8" />
        <circle cx="94" cy="82" r="5" fill="#FFF6C8" />
        <circle cx="66" cy="82" r="10" fill="#FFF6C8" fillOpacity=".25" />
        <circle cx="94" cy="82" r="10" fill="#FFF6C8" fillOpacity=".25" />
      </g>
      <circle cx="80" cy="80" r="62" fill="none" stroke="#D9DCE5" strokeWidth="9" />
    </>
  ),

  // Side view: a regular high-power lens next to a thin, light one.
  thin: () => (
    <>
      <rect x="0" y="0" width="160" height="160" rx="28" fill="#F3F2EE" />
      <path d="M38 34 C14 34, 14 126, 38 126 L54 126 C40 110, 40 50, 54 34 Z" fill="#C9D6E8" stroke={RIM} strokeWidth="4" strokeLinejoin="round" />
      <path d="M104 34 C92 34, 92 126, 104 126 L112 126 C104 110, 104 50, 112 34 Z" fill="#DCE8F7" stroke={ORANGE} strokeWidth="4" strokeLinejoin="round" />
      <path d="M62 80h26" stroke={RIM} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M80 72l9 8-9 8" fill="none" stroke={RIM} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="40" y="148" textAnchor="middle" fontSize="12" fontWeight="700" fill="#6B6E76" fontFamily="inherit">Regular</text>
      <text x="106" y="148" textAnchor="middle" fontSize="12" fontWeight="700" fill={ORANGE} fontFamily="inherit">Thin</text>
    </>
  ),

  // Far at the top, middle, near at the bottom — one lens.
  progressive: (id) => (
    <>
      <defs>
        <linearGradient id={`${id}-zones`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE7D9" />
          <stop offset=".42" stopColor="#FFE7D9" />
          <stop offset=".62" stopColor="#FFD2B8" />
          <stop offset="1" stopColor="#FFB98F" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="62" fill={`url(#${id}-zones)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <path d="M18 74 Q80 66 142 74" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="5 5" />
        <path d="M18 104 Q80 96 142 104" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="5 5" />
      </g>
      <text x="80" y="54" textAnchor="middle" fontSize="15" fontWeight="800" fill={RIM} fontFamily="inherit">Far</text>
      <text x="80" y="92" textAnchor="middle" fontSize="13" fontWeight="800" fill={RIM} fontFamily="inherit">Middle</text>
      <text x="80" y="124" textAnchor="middle" fontSize="12" fontWeight="800" fill={RIM} fontFamily="inherit">Near</text>
      {rim}
    </>
  ),
};
