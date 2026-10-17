"use client";

import { colors } from "./tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface MarkerSVGProps {
  size?: number;
  variant?: "gold" | "dark" | "white";
  animated?: boolean;
}

const SAND: [number, number][] = [
  [18, 35],
  [22, 35],
  [20, 32],
  [20, 16],
];

const COLORS = {
  gold: colors.gold,
  dark: colors.dark,
  white: colors.white,
};

export default function MarkerSVG({
  size = 40,
  variant = "gold",
  animated = false,
}: MarkerSVGProps) {
  const color = COLORS[variant];
  const height = Math.round(size * 1.3); // preserve 40:52 aspect ratio

  // Below 24px use the small cut: no inner frame line, heavier strokes and dots.
  const small = size <= 24;

  return (
    <svg
      viewBox="0 0 40 52"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={height}
      style={animated ? { animation: "pulse-soft 2s ease-in-out infinite" } : undefined}
    >
      <g fill={color}>
        {small ? (
          <>
            <rect x="1" y="1" width="38" height="50" rx="1.2" fill="none" stroke={color} strokeWidth="2" />
            <path d="M 11.2,12 C 9.9,26 25.9,22 27.2,36 L 28.8,36 C 30.1,22 14.1,26 12.8,12 Z M 10.75,12 a 1.25,1.25 0 1,0 2.5,0 a 1.25,1.25 0 1,0 -2.5,0 Z M 26.75,36 a 1.25,1.25 0 1,0 2.5,0 a 1.25,1.25 0 1,0 -2.5,0 Z" />
            <path d="M 28.8,12 C 30.1,26 14.1,22 12.8,36 L 11.2,36 C 9.9,22 25.9,26 27.2,12 Z M 26.75,12 a 1.25,1.25 0 1,0 2.5,0 a 1.25,1.25 0 1,0 -2.5,0 Z M 10.75,36 a 1.25,1.25 0 1,0 2.5,0 a 1.25,1.25 0 1,0 -2.5,0 Z" />
          </>
        ) : (
          <>
            {/* Outer frame + fine inner gilt line */}
            <rect x="0.7" y="0.7" width="38.6" height="50.6" rx="1" fill="none" stroke={color} strokeWidth="1.4" />
            <rect x="3.4" y="3.4" width="33.2" height="45.2" rx="0.8" fill="none" stroke={color} strokeWidth="0.5" opacity={0.7} />
            {/* Two crossing tapered S-curves with end dots */}
            <path d="M 11.55,12 C 10.4,26 26.4,22 27.55,36 L 28.45,36 C 29.6,22 13.6,26 12.45,12 Z M 11.1,12 a 0.9,0.9 0 1,0 1.8,0 a 0.9,0.9 0 1,0 -1.8,0 Z M 27.1,36 a 0.9,0.9 0 1,0 1.8,0 a 0.9,0.9 0 1,0 -1.8,0 Z" />
            <path d="M 28.45,12 C 29.6,26 13.6,22 12.45,36 L 11.55,36 C 10.4,22 26.4,26 27.55,12 Z M 27.1,12 a 0.9,0.9 0 1,0 1.8,0 a 0.9,0.9 0 1,0 -1.8,0 Z M 11.1,36 a 0.9,0.9 0 1,0 1.8,0 a 0.9,0.9 0 1,0 -1.8,0 Z" />
          </>
        )}
        {/* Sand: three grains below the waist, one falling grain above */}
        {SAND.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={small ? 1.45 : 1.1} />
        ))}
      </g>
    </svg>
  );
}

export const showcase: ShowcaseDefinition<MarkerSVGProps> = {
  category: "ui",
  label: "Marker SVG",
  description: "Marker v4 (tapered crossing S-curves, sand, inner gilt line) with gold/dark/white variants; small cut at <= 24px",
  defaults: { size: 80, variant: "gold", animated: true },
};
