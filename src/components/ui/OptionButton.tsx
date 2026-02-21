"use client";

import { useState, type CSSProperties } from "react";
import { colors, fontFamily, MIN_TAP_TARGET } from "./tokens";

type OptionState = "default" | "correct" | "wrong";

interface OptionButtonProps {
  label: string;
  state?: OptionState;
  disabled?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

const stateStyles: Record<OptionState, { border: string; bg: string; text: string; opacity: number; shadow: string }> = {
  default: {
    border: colors.gold25,
    bg: "transparent",
    text: colors.gold80,
    opacity: 1,
    shadow: "none",
  },
  correct: {
    border: colors.gold80,
    bg: colors.gold10,
    text: colors.gold,
    opacity: 1,
    shadow: `inset 0 0 20px rgba(200, 165, 75, 0.06), 0 0 8px rgba(200, 165, 75, 0.04)`,
  },
  wrong: {
    border: colors.errorRed50,
    bg: "transparent",
    text: colors.errorRed70,
    opacity: 0.5,
    shadow: "none",
  },
};

export default function OptionButton({
  label,
  state = "default",
  disabled,
  onClick,
  style,
}: OptionButtonProps) {
  const [hover, setHover] = useState(false);
  const s = stateStyles[state];

  const borderColor = state === "default" && hover && !disabled
    ? colors.gold35
    : s.border;

  const textColor = state === "default" && hover && !disabled
    ? colors.gold90
    : s.text;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{
        background: s.bg,
        border: `1px solid ${borderColor}`,
        color: textColor,
        fontFamily,
        fontSize: "15px",
        fontStyle: "italic",
        padding: "14px 20px",
        textAlign: "left" as const,
        cursor: disabled ? "default" : "pointer",
        transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease, opacity 0.3s ease, box-shadow 0.4s ease",
        opacity: s.opacity,
        minHeight: MIN_TAP_TARGET,
        WebkitTapHighlightColor: "transparent",
        boxShadow: s.shadow,
        ...style,
      }}
    >
      {label}
    </button>
  );
}
