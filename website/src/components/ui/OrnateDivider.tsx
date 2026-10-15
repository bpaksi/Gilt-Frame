import type { CSSProperties } from "react";
import { colors } from "./tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface OrnateDividerProps {
  style?: CSSProperties;
}

export default function OrnateDivider({ style }: OrnateDividerProps) {
  const c = colors.gold;
  const sw = "0.7";
  return (
    <svg
      width="220"
      height="20"
      viewBox="0 0 220 20"
      fill="none"
      style={style}
    >
      {/* Left line */}
      <line x1="0" y1="10" x2="38" y2="10" stroke={c} strokeWidth={sw} />

      {/* Left eye/leaf */}
      <path d="M38,10 Q56,4 74,10 Q56,16 38,10 Z" stroke={c} strokeWidth={sw} fill="none" />

      {/* Line: left eye → left dot */}
      <line x1="74" y1="10" x2="85" y2="10" stroke={c} strokeWidth={sw} />

      {/* Left dot */}
      <circle cx="88" cy="10" r="2.5" stroke={c} strokeWidth={sw} fill="none" />

      {/* Line: left dot → center diamond */}
      <line x1="91" y1="10" x2="102" y2="10" stroke={c} strokeWidth={sw} />

      {/* Center diamond */}
      <polygon points="110,2 118,10 110,18 102,10" stroke={c} strokeWidth={sw} fill="none" />

      {/* Line: center diamond → right dot */}
      <line x1="118" y1="10" x2="129" y2="10" stroke={c} strokeWidth={sw} />

      {/* Right dot */}
      <circle cx="132" cy="10" r="2.5" stroke={c} strokeWidth={sw} fill="none" />

      {/* Line: right dot → right eye */}
      <line x1="135" y1="10" x2="146" y2="10" stroke={c} strokeWidth={sw} />

      {/* Right eye/leaf */}
      <path d="M146,10 Q164,4 182,10 Q164,16 146,10 Z" stroke={c} strokeWidth={sw} fill="none" />

      {/* Right line */}
      <line x1="182" y1="10" x2="220" y2="10" stroke={c} strokeWidth={sw} />
    </svg>
  );
}

export const showcase: ShowcaseDefinition<OrnateDividerProps> = {
  category: "ui",
  label: "Ornate Divider",
  description: "SVG ornate horizontal divider with central diamond, eye shapes, and dot accents",
};
