import type { CSSProperties, ReactNode } from "react";
import { colors, fontFamily } from "./tokens";

type Variant = "body" | "heading" | "hint" | "muted";

const variantStyles: Record<Variant, CSSProperties> = {
  body: {
    color: colors.gold90,
    fontSize: "18px",
    lineHeight: 1.8,
  },
  heading: {
    color: colors.gold90,
    fontSize: "20px",
    lineHeight: 1.6,
    maxWidth: "340px",
  },
  hint: {
    color: colors.gold70,
    fontSize: "15px",
    lineHeight: 1.8,
  },
  muted: {
    color: colors.gold60,
    fontSize: "14px",
    lineHeight: 1.8,
  },
};

interface GoldTextProps {
  variant?: Variant;
  children: ReactNode;
  style?: CSSProperties;
}

export default function GoldText({ variant = "body", children, style }: GoldTextProps) {
  return (
    <p
      style={{
        fontFamily,
        fontStyle: "italic",
        textAlign: "center",
        margin: 0,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </p>
  );
}
