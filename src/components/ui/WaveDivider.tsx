import type { CSSProperties } from "react";
import { colors } from "./tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface WaveDividerProps {
  style?: CSSProperties;
}

export default function WaveDivider({ style }: WaveDividerProps) {
  return (
    <svg
      width="120"
      height="10"
      viewBox="0 0 120 10"
      fill="none"
      style={style}
    >
      <path
        d="M0 5 Q15 1 30 5 Q45 9 60 5 Q75 1 90 5 Q105 9 120 5"
        stroke={colors.gold}
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

export const showcase: ShowcaseDefinition<WaveDividerProps> = {
  category: "ui",
  label: "Wave Divider",
  description: "SVG wavy line divider",
};
