"use client";

import { useState, type CSSProperties, type ReactNode, type ButtonHTMLAttributes } from "react";
import { colors, fontFamily, MIN_TAP_TARGET } from "./tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface TextButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children: ReactNode;
  style?: CSSProperties;
}

export default function TextButton({ children, disabled, style, ...rest }: TextButtonProps) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const textColor = disabled
    ? colors.gold20
    : pressed
      ? colors.gold70
      : hover
        ? colors.gold50
        : colors.gold40;

  return (
    <button
      disabled={disabled}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => { setHover(false); setPressed(false); }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      {...rest}
      style={{
        background: "none",
        border: "none",
        color: textColor,
        fontFamily,
        fontSize: "13px",
        fontStyle: "italic",
        cursor: disabled ? "default" : "pointer",
        padding: "8px 0",
        minHeight: MIN_TAP_TARGET,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
        transition: "color 0.3s ease",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export const showcase: ShowcaseDefinition<TextButtonProps> = {
  category: "ui",
  label: "Text Button",
  description: "Lightweight text-only button with hover states",
  defaults: { children: "Request a Hint" },
};
