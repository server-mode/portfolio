import type { JSX } from "react";
import type { Project } from "@/lib/i18n";

const INK = "#0b0b0f";
const PAPER = "#f6f7f9";
const LINE = "#e3e6ec";
const BLUE = "#1a73e8";
const RED = "#ea4335";
const YELLOW = "#fbbc05";
const GREEN = "#34a853";

/** Deterministic pseudo-random so server and client render identically. */
function noise(i: number, salt = 1): number {
  const n = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function Chart() {
  const bars = Array.from({ length: 11 }, (_, i) => {
    const h = 26 + Math.round(noise(i, 3) * 74);
    const accent = i === 7 ? BLUE : i === 3 ? YELLOW : INK;
    return { x: 26 + i * 18, h, accent };
  });
  return (
    <svg viewBox="0 0 240 150" role="img" aria-hidden="true" shapeRendering="crispEdges">
      <rect width="240" height="150" fill={PAPER} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={`v${i}`} x={i * 20} y="0" width="1" height="150" fill={LINE} opacity="0.55" />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={`h${i}`} x="0" y={i * 20} width="240" height="1" fill={LINE} opacity="0.55" />
      ))}
      {bars.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={124 - b.h} width="12" height={b.h} fill={b.accent} />
          <rect x={b.x} y={124 - b.h} width="12" height="2" fill="#ffffff" opacity="0.55" />
        </g>
      ))}
      <rect x="18" y="124" width="204" height="3" fill={INK} />
      <rect x="18" y="18" width="3" height="109" fill={INK} />
      <rect x="196" y="16" width="28" height="12" fill={INK} />
      <rect x="199" y="19" width="22" height="6" fill={GREEN} />
    </svg>
  );
}

function HeatGrid() {
  const cells: JSX.Element[] = [];
  for (let r = 0; r < 6; r += 1) {
    for (let c = 0; c < 13; c += 1) {
      const v = noise(r * 13 + c, 7);
      const fill = v > 0.86 ? BLUE : v > 0.62 ? "#9aa2ae" : v > 0.34 ? "#cdd3db" : "#e6e9ee";
      cells.push(
        <rect key={`${r}-${c}`} x={19 + c * 15} y={32 + r * 17} width="12" height="14" fill={fill} />,
      );
    }
  }
  return (
    <svg viewBox="0 0 240 150" role="img" aria-hidden="true" shapeRendering="crispEdges">
      <rect width="240" height="150" fill="#ffffff" />
      <rect x="18" y="12" width="74" height="7" fill={INK} />
      <rect x="96" y="12" width="26" height="7" fill={RED} />
      <rect x="126" y="12" width="44" height="7" fill={LINE} />
      {cells}
      <rect x="16" y="28" width="200" height="110" fill="none" stroke={INK} strokeWidth="2" />
      <rect x="19" y="32" width="46" height="14" fill="none" stroke={BLUE} strokeWidth="3" />
    </svg>
  );
}

function Terminal() {
  const lines = [
    { w: 118, c: GREEN },
    { w: 86, c: "#ffffff" },
    { w: 142, c: BLUE },
    { w: 64, c: YELLOW },
    { w: 104, c: "#ffffff" },
  ];
  return (
    <svg viewBox="0 0 240 150" role="img" aria-hidden="true" shapeRendering="crispEdges">
      <rect width="240" height="150" fill={PAPER} />
      <rect x="16" y="14" width="208" height="122" fill="#101218" stroke={INK} strokeWidth="2" />
      <rect x="16" y="14" width="208" height="14" fill="#1b1f28" />
      <rect x="24" y="19" width="5" height="5" fill={RED} />
      <rect x="33" y="19" width="5" height="5" fill={YELLOW} />
      <rect x="42" y="19" width="5" height="5" fill={GREEN} />
      <rect x="56" y="19" width="42" height="4" fill="#5f646d" />
      {lines.map((l, i) => (
        <g key={i}>
          <rect x="26" y={40 + i * 16} width="9" height="7" fill="#3a4150" />
          <rect x="40" y={40 + i * 16} width={l.w} height="7" fill={l.c} opacity={l.c === "#ffffff" ? 0.9 : 1} />
        </g>
      ))}
      <rect x="40" y="120" width="8" height="7" fill={GREEN} />
    </svg>
  );
}

const SPRITE = [
  "....XXXX....",
  "..XXooooXX..",
  ".XooooooooX.",
  ".XoXXooXXoX.",
  ".XoXXooXXoX.",
  ".XooooooooX.",
  ".XooXXXXooX.",
  "..XooooooX..",
  "...XooooX...",
  "..XXoXXoXX..",
];

function Pixels() {
  const blocks: JSX.Element[] = [];
  SPRITE.forEach((row, r) => {
    row.split("").forEach((ch, c) => {
      if (ch === ".") return;
      blocks.push(
        <rect
          key={`${r}-${c}`}
          x={26 + c * 13}
          y={20 + r * 11}
          width="13"
          height="11"
          fill={ch === "X" ? INK : c % 3 === 0 ? "#9ed8ff" : BLUE}
        />,
      );
    });
  });
  return (
    <svg viewBox="0 0 240 150" role="img" aria-hidden="true" shapeRendering="crispEdges">
      <rect width="240" height="150" fill={PAPER} />
      {Array.from({ length: 15 }, (_, i) => (
        <rect key={`gv${i}`} x={i * 16} y="0" width="1" height="150" fill={LINE} opacity="0.5" />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={`gh${i}`} x="0" y={i * 16} width="240" height="1" fill={LINE} opacity="0.5" />
      ))}
      {blocks}
      <rect x="188" y="26" width="26" height="26" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <rect x="194" y="32" width="14" height="14" fill={GREEN} />
      <rect x="188" y="66" width="26" height="26" fill="#ffffff" stroke={INK} strokeWidth="2" />
      <rect x="194" y="72" width="14" height="7" fill={YELLOW} />
      <rect x="194" y="81" width="14" height="5" fill={RED} />
    </svg>
  );
}

function MapCover() {
  const blocks: JSX.Element[] = [];
  for (let r = 0; r < 5; r += 1) {
    for (let c = 0; c < 9; c += 1) {
      if (noise(r * 9 + c, 11) > 0.58) {
        blocks.push(
          <rect
            key={`${r}-${c}`}
            x={20 + c * 24}
            y={18 + r * 24}
            width="18"
            height="18"
            fill={noise(r + c, 2) > 0.7 ? "#cdd3db" : "#e3e6ec"}
          />,
        );
      }
    }
  }
  return (
    <svg viewBox="0 0 240 150" role="img" aria-hidden="true" shapeRendering="crispEdges">
      <rect width="240" height="150" fill="#ffffff" />
      {blocks}
      <path
        d="M18 118 L58 96 L82 108 L118 62 L152 70 L182 40 L214 52"
        fill="none"
        stroke={BLUE}
        strokeWidth="4"
      />
      {[
        [18, 118],
        [82, 108],
        [118, 62],
        [182, 40],
        [214, 52],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill="#ffffff" stroke={INK} strokeWidth="3" />
      ))}
      <rect x="18" y="14" width="34" height="6" fill={INK} />
      <rect x="56" y="14" width="20" height="6" fill={GREEN} />
    </svg>
  );
}

const COVERS: Record<string, () => JSX.Element> = {
  chart: Chart,
  grid: HeatGrid,
  terminal: Terminal,
  pixels: Pixels,
  map: MapCover,
};

export default function PixelCover({ variant }: { variant: Project["cover"] }) {
  const Cover = COVERS[variant] ?? Chart;
  return <Cover />;
}
