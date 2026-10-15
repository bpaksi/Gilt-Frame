"use client";

import type { ShowcaseDefinition } from "@/components/showcase";

interface SealSVGProps {
  chapterId: string;
  size?: number;
  earned?: boolean;
  /** When true, uses the chapter's unique color. When false (default), stays gold. */
  colored?: boolean;
}

// ─── Per-chapter color palettes ──────────────────────────────────────────────
// Each seal has its own color identity, distinct from the game's gold theme.

type SealPalette = {
  stroke: string;
  fill: string;
  glow: string;
  dim: string;
};

const PALETTES: Record<string, SealPalette> = {
  // Prologue — deep crimson (wax seal)
  prologue: {
    stroke: "rgba(180, 60, 50, 1)",
    fill: "rgba(180, 60, 50, 1)",
    glow: "rgba(180, 60, 50, 0.3)",
    dim: "rgba(180, 60, 50, 0.3)",
  },
  // Ch1 — steel blue (navigation / time)
  ch1: {
    stroke: "rgba(90, 145, 200, 1)",
    fill: "rgba(90, 145, 200, 1)",
    glow: "rgba(90, 145, 200, 0.3)",
    dim: "rgba(90, 145, 200, 0.3)",
  },
  // Ch2 — amethyst violet (whispers / mystery)
  ch2: {
    stroke: "rgba(150, 100, 180, 1)",
    fill: "rgba(150, 100, 180, 1)",
    glow: "rgba(150, 100, 180, 0.3)",
    dim: "rgba(150, 100, 180, 0.3)",
  },
  // Ch3 — emerald green (knowledge / archive)
  ch3: {
    stroke: "rgba(70, 160, 110, 1)",
    fill: "rgba(70, 160, 110, 1)",
    glow: "rgba(70, 160, 110, 0.3)",
    dim: "rgba(70, 160, 110, 0.3)",
  },
};

// Fallback — muted gold for unknown chapters
const DEFAULT_PALETTE: SealPalette = {
  stroke: "rgba(200, 165, 75, 1)",
  fill: "rgba(200, 165, 75, 1)",
  glow: "rgba(200, 165, 75, 0.25)",
  dim: "rgba(200, 165, 75, 0.3)",
};

function getPalette(chapterId: string): SealPalette {
  return PALETTES[chapterId] ?? DEFAULT_PALETTE;
}

/**
 * Unique per-chapter seal rendered as inline SVG.
 * Each chapter has a distinct color AND motif.
 */
export default function SealSVG({ chapterId, size = 64, earned = true, colored = false }: SealSVGProps) {
  const palette = colored ? getPalette(chapterId) : DEFAULT_PALETTE;
  const stroke = earned ? palette.stroke : palette.dim;
  const fill = earned ? palette.fill : palette.dim;

  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={earned ? { filter: `drop-shadow(0 0 6px ${palette.glow})` } : undefined}
    >
      {/* Outer circle */}
      <circle cx="40" cy="40" r="37" stroke={stroke} strokeWidth="1.2" />
      {/* Inner circle ring */}
      <circle cx="40" cy="40" r="32" stroke={stroke} strokeWidth="0.6" opacity={0.5} />

      {/* Chapter-specific motif */}
      {renderMotif(chapterId, stroke, fill)}
    </svg>
  );
}

function renderMotif(chapterId: string, stroke: string, fill: string) {
  switch (chapterId) {
    // ─── Prologue: Eye of Recognition — crimson ─────────────────────────
    case "prologue":
      return (
        <g>
          <path
            d="M 18,40 Q 40,24 62,40 Q 40,56 18,40 Z"
            stroke={stroke} strokeWidth="1" fill="none"
          />
          <circle cx="40" cy="40" r="7" stroke={stroke} strokeWidth="1" fill="none" />
          <circle cx="40" cy="40" r="3" fill={fill} />
          <line x1="30" y1="26" x2="30" y2="22" stroke={stroke} strokeWidth="0.7" />
          <line x1="40" y1="23" x2="40" y2="18" stroke={stroke} strokeWidth="0.7" />
          <line x1="50" y1="26" x2="50" y2="22" stroke={stroke} strokeWidth="0.7" />
        </g>
      );

    // ─── Ch1: Compass & Sundial — steel blue ────────────────────────────
    case "ch1":
      return (
        <g>
          <circle cx="40" cy="40" r="14" stroke={stroke} strokeWidth="0.8" fill="none" />
          <polygon points="40,24 38,32 42,32" fill={fill} />
          <polygon points="40,56 38,48 42,48" fill={fill} opacity={0.5} />
          <polygon points="24,40 32,38 32,42" fill={fill} opacity={0.5} />
          <polygon points="56,40 48,38 48,42" fill={fill} opacity={0.5} />
          <line x1="40" y1="28" x2="40" y2="52" stroke={stroke} strokeWidth="0.6" />
          <line x1="28" y1="40" x2="52" y2="40" stroke={stroke} strokeWidth="0.6" />
          <circle cx="40" cy="40" r="2" fill={fill} />
          <line x1="40" y1="40" x2="50" y2="30" stroke={stroke} strokeWidth="1" />
        </g>
      );

    // ─── Ch2: Gallery Whispers — amethyst violet ────────────────────────
    case "ch2":
      return (
        <g>
          <rect
            x="30" y="30" width="20" height="20" rx="1"
            stroke={stroke} strokeWidth="1" fill="none"
          />
          <rect
            x="33" y="33" width="14" height="14" rx="0.5"
            stroke={stroke} strokeWidth="0.5" fill="none" opacity={0.5}
          />
          <path d="M 54,36 Q 58,40 54,44" stroke={stroke} strokeWidth="0.8" fill="none" />
          <path d="M 58,33 Q 64,40 58,47" stroke={stroke} strokeWidth="0.7" fill="none" opacity={0.7} />
          <path d="M 26,36 Q 22,40 26,44" stroke={stroke} strokeWidth="0.8" fill="none" />
          <path d="M 22,33 Q 16,40 22,47" stroke={stroke} strokeWidth="0.7" fill="none" opacity={0.7} />
          <circle cx="40" cy="40" r="2.5" fill={fill} />
        </g>
      );

    // ─── Ch3: Archivist's Key — emerald green ───────────────────────────
    case "ch3":
      return (
        <g>
          <circle cx="40" cy="30" r="8" stroke={stroke} strokeWidth="1" fill="none" />
          <circle cx="40" cy="30" r="4" stroke={stroke} strokeWidth="0.6" fill="none" opacity={0.5} />
          <line x1="40" y1="38" x2="40" y2="58" stroke={stroke} strokeWidth="1.2" />
          <line x1="40" y1="52" x2="46" y2="52" stroke={stroke} strokeWidth="1" />
          <line x1="40" y1="56" x2="44" y2="56" stroke={stroke} strokeWidth="1" />
          <circle cx="40" cy="30" r="1.5" fill={fill} />
        </g>
      );

    // ─── Default: hourglass — muted gold ────────────────────────────────
    default:
      return (
        <g>
          <path
            d="M 30,26 L 50,26 L 40,40 L 50,54 L 30,54 L 40,40 Z"
            stroke={stroke} strokeWidth="1" fill="none"
          />
          <circle cx="40" cy="48" r="1.5" fill={fill} />
          <circle cx="38" cy="50" r="1" fill={fill} opacity={0.6} />
          <circle cx="42" cy="50" r="1" fill={fill} opacity={0.6} />
          <circle cx="40" cy="34" r="1" fill={fill} />
        </g>
      );
  }
}

export const showcase: ShowcaseDefinition<SealSVGProps> = {
  category: "ui",
  label: "Seal SVG",
  description: "Per-chapter seal icon with unique color palettes and motifs — crimson eye, blue compass, violet frame, green key",
  defaults: { chapterId: "prologue", size: 80, earned: true },
};
