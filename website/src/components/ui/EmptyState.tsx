import type { CSSProperties, ReactNode } from "react";
import { colors, fontFamily } from "./tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface EmptyStateProps {
  children: ReactNode;
  /** Wrap in a full-height centered flex container */
  centered?: boolean;
  style?: CSSProperties;
}

const textStyle: CSSProperties = {
  color: colors.gold50,
  fontFamily,
  fontSize: "16px",
  fontStyle: "italic",
  textAlign: "center",
  letterSpacing: "1px",
  lineHeight: 1.8,
};

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100%",
  flex: 1,
  padding: "40px 24px",
};

export default function EmptyState({ children, centered, style }: EmptyStateProps) {
  const text = <p style={{ ...textStyle, ...style }}>{children}</p>;

  if (centered) {
    return <div style={containerStyle}>{text}</div>;
  }

  return text;
}

export const showcase: ShowcaseDefinition<EmptyStateProps> = {
  category: "ui",
  label: "Empty State",
  description: "Placeholder text for empty views",
  defaults: { children: "No moments captured yet.", centered: true },
};
