import type { CSSProperties } from "react";

// ── Color tokens ────────────────────────────────────────────────────────
// Matches @theme block in globals.css

export const colors = {
  gold: "rgba(200, 165, 75, 1)",
  gold90: "rgba(200, 165, 75, 0.9)",
  gold85: "rgba(200, 165, 75, 0.85)",
  gold80: "rgba(200, 165, 75, 0.8)",
  gold70: "rgba(200, 165, 75, 0.7)",
  gold60: "rgba(200, 165, 75, 0.6)",
  gold50: "rgba(200, 165, 75, 0.5)",
  gold40: "rgba(200, 165, 75, 0.4)",
  gold35: "rgba(200, 165, 75, 0.35)",
  gold30: "rgba(200, 165, 75, 0.3)",
  gold25: "rgba(200, 165, 75, 0.25)",
  gold20: "rgba(200, 165, 75, 0.2)",
  gold12: "rgba(200, 165, 75, 0.12)",
  gold10: "rgba(200, 165, 75, 0.1)",
  gold08: "rgba(200, 165, 75, 0.08)",
  gold06: "rgba(200, 165, 75, 0.06)",
  gold04: "rgba(200, 165, 75, 0.04)",
  gold03: "rgba(200, 165, 75, 0.03)",
  gold55: "rgba(200, 165, 75, 0.55)",
  gold45: "rgba(200, 165, 75, 0.45)",
  gold15: "rgba(200, 165, 75, 0.15)",
  goldBright: "rgba(232, 204, 106, 1)",
  goldBright90: "rgba(232, 204, 106, 0.9)",
  goldBright80: "rgba(232, 204, 106, 0.8)",
  errorRed70: "rgba(180, 50, 40, 0.7)",
  errorRed50: "rgba(180, 50, 40, 0.5)",
  bg: "#0a0a0a",
  surface: "rgba(30, 25, 18, 0.8)",
  dark: "#1e1912",
  white: "#ffffff",
  // Warm-white glow — used by animation orbs and particle effects
  warmGlow60: "rgba(255, 248, 220, 0.6)",
  warmGlow50: "rgba(255, 248, 220, 0.5)",
  warmGlow40: "rgba(255, 248, 220, 0.4)",
  orbWhite90: "rgba(255, 253, 240, 0.9)",
  flashWhite25: "rgba(255, 251, 230, 0.25)",
} as const;

// ── Color bases (RGB only) ───────────────────────────────────────────────
// Use these for dynamic-alpha template literals: `rgba(${colorBases.gold}, ${alpha})`

export const colorBases = {
  gold: "200, 165, 75",
  goldBright: "232, 204, 106",
} as const;

// ── Typography ──────────────────────────────────────────────────────────

export const fontFamily = "Georgia, 'Times New Roman', serif";

// ── Layout ──────────────────────────────────────────────────────────────

export const MIN_TAP_TARGET = "44px";

export const questContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100%",
  flex: 1,
  padding: "40px 24px",
};
