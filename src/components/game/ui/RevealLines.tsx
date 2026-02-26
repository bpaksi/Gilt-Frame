"use client";

import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface RevealLinesProps {
  lines: string[];
  delayBetween?: number;
  baseDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  lineStyle?: React.CSSProperties;
}

export default function RevealLines({
  lines,
  delayBetween = 600,
  baseDelay = 0,
  style,
  lineStyle,
}: RevealLinesProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", ...style }}>
      {lines.map((line, i) => (
        <p
          key={`${i}-${line}`}
          style={{
            opacity: 0,
            animation: `fade-in 0.8s ease forwards`,
            animationDelay: `${baseDelay + i * delayBetween}ms`,
            color: colors.gold90,
            fontFamily,
            fontSize: "18px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.8,
            letterSpacing: "0.5px",
            ...lineStyle,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

export const showcase: ShowcaseDefinition<RevealLinesProps> = {
  category: "game",
  label: "Reveal Lines",
  description: "Staggered line-by-line text animation",
  defaults: {
    lines: ["The Sight stirs within you.", "What was lost is now reborn.", "The Order has heard you."],
  },
};
