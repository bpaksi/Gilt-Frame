import type { CSSProperties, ReactNode } from "react";
import { colors, fontFamily } from "./tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

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

export const showcase: ShowcaseDefinition<UppercaseLabelProps> = {
  category: "ui",
  label: "Uppercase Label",
  description: "Small uppercase label with letter spacing",
  defaults: { children: "Chapter I" },
};
