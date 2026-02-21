import type { CSSProperties, ReactNode } from "react";
import { colors, fontFamily } from "./tokens";

interface UppercaseLabelProps {
  children: ReactNode;
  style?: CSSProperties;
}

export default function UppercaseLabel({ children, style }: UppercaseLabelProps) {
  return (
    <p
      style={{
        color: colors.gold50,
        fontFamily,
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "3px",
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  );
}
