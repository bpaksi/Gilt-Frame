"use client";

import { useState, type CSSProperties, type ReactNode, type ButtonHTMLAttributes } from "react";
import { colors, fontFamily, MIN_TAP_TARGET } from "./tokens";

interface GhostButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  children: ReactNode;
  style?: CSSProperties;
}

export default function GhostButton({ children, disabled, style, ...rest }: GhostButtonProps) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);

  const borderColor = disabled
    ? colors.gold12
    : pressed
      ? colors.gold50
      : hover
        ? colors.gold40
        : colors.gold30;

  const textColor = disabled
    ? colors.gold30
    : pressed
      ? colors.gold90
      : hover
        ? colors.gold80
        : colors.gold70;

  const shadowGlow = !disabled && hover
    ? `0 0 12px rgba(200, 165, 75, 0.06), inset 0 0 12px rgba(200, 165, 75, 0.03)`
    : "none";

  return (
    <button
      disabled={disabled}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => { setHover(false); setPressed(false); }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      {...rest}
      style={{
        background: "transparent",
        border: `1px solid ${borderColor}`,
        color: textColor,
        fontFamily,
        fontSize: "15px",
        fontStyle: "italic",
        letterSpacing: "2px",
        padding: "14px 28px",
        cursor: disabled ? "default" : "pointer",
        minHeight: MIN_TAP_TARGET,
        WebkitTapHighlightColor: "transparent",
        transition: "border-color 0.4s ease, color 0.35s ease, box-shadow 0.5s ease",
        boxShadow: shadowGlow,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
