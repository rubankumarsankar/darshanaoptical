import { FRAME_PATHS, type FrameStyle } from "./data";

interface FrameGlyphProps {
  style: FrameStyle;
  width: number;
  height: number;
}

export default function FrameGlyph({ style, width, height }: FrameGlyphProps) {
  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox="1 5 22 14"
      fill="none"
      stroke="#36363E"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: "relative" }}
    >
      <path d={FRAME_PATHS[style]} />
    </svg>
  );
}
