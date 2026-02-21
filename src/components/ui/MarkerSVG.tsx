"use client";

import type { ShowcaseDefinition } from "@/components/showcase";

interface MarkerSVGProps {
  size?: number;
  variant?: "gold" | "dark" | "white";
  animated?: boolean;
}

const COLORS = {
  gold: "#C8A54B",
  dark: "#1e1912",
  white: "#ffffff",
};

export default function MarkerSVG({
  size = 40,
  variant = "gold",
  animated = false,
}: MarkerSVGProps) {
  const color = COLORS[variant];
  const height = Math.round(size * 1.3); // preserve 40:52 aspect ratio

  return (
    <svg
      viewBox="0 0 40 52"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={height}
      style={animated ? { animation: "pulse-soft 2s ease-in-out infinite" } : undefined}
    >
      {/* Rectangular frame */}
      <rect
        x="0.7"
        y="0.7"
        width="38.6"
        height="50.6"
        rx="1"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
      />
      {/* Two crossing S-curves (hourglass) */}
      <path
        d="M 12,12 C 12,26 28,22 28,36"
        fill="none"
        stroke={color}
        strokeWidth="1"
      />
      <path
        d="M 28,12 C 28,26 12,22 12,36"
        fill="none"
        stroke={color}
        strokeWidth="1"
      />
      {/* Sand triangle inside lower bulge */}
      <circle cx="18" cy="35" r="1" fill={color} />
      <circle cx="22" cy="35" r="1" fill={color} />
      <circle cx="20" cy="32" r="1" fill={color} />
      {/* Falling grain inside upper bulge */}
      <circle cx="20" cy="16" r="1" fill={color} />
    </svg>
  );
}

export const showcase: ShowcaseDefinition<MarkerSVGProps> = {
  category: "ui",
  label: "Marker SVG",
  description: "Hourglass marker icon with gold/dark/white variants",
  defaults: { size: 80, variant: "gold", animated: true },
};
