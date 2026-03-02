import type { CSSProperties } from "react";

// ── Color tokens ────────────────────────────────────────────────────────
// Matches @theme block in globals.css

// ── Color bases (RGB only) ───────────────────────────────────────────────
// Single-dial tuning: change these values to retune all derived tokens.
// Update globals.css --gold-rgb and --color-bg to match.

export const colorBases = {
  gold: "220, 185, 95",        // ← tune here; all gold* tokens derive from this
  goldBright: "232, 204, 106",
} as const;

export const colors = {
  gold:      `rgba(${colorBases.gold}, 1)`,
  gold90:    `rgba(${colorBases.gold}, 0.9)`,
  gold85:    `rgba(${colorBases.gold}, 0.85)`,
  gold80:    `rgba(${colorBases.gold}, 0.8)`,
  gold70:    `rgba(${colorBases.gold}, 0.7)`,
  gold60:    `rgba(${colorBases.gold}, 0.6)`,
  gold55:    `rgba(${colorBases.gold}, 0.55)`,
  gold50:    `rgba(${colorBases.gold}, 0.5)`,
  gold45:    `rgba(${colorBases.gold}, 0.45)`,
  gold40:    `rgba(${colorBases.gold}, 0.4)`,
  gold35:    `rgba(${colorBases.gold}, 0.35)`,
  gold30:    `rgba(${colorBases.gold}, 0.3)`,
  gold25:    `rgba(${colorBases.gold}, 0.25)`,
  gold20:    `rgba(${colorBases.gold}, 0.2)`,
  gold15:    `rgba(${colorBases.gold}, 0.15)`,
  gold12:    `rgba(${colorBases.gold}, 0.12)`,
  gold10:    `rgba(${colorBases.gold}, 0.1)`,
  gold08:    `rgba(${colorBases.gold}, 0.08)`,
  gold06:    `rgba(${colorBases.gold}, 0.06)`,
  gold04:    `rgba(${colorBases.gold}, 0.04)`,
  gold03:    `rgba(${colorBases.gold}, 0.03)`,
  goldBright:    `rgba(${colorBases.goldBright}, 1)`,
  goldBright90:  `rgba(${colorBases.goldBright}, 0.9)`,
  goldBright80:  `rgba(${colorBases.goldBright}, 0.8)`,
  errorRed70: "rgba(180, 50, 40, 0.7)",
  errorRed50: "rgba(180, 50, 40, 0.5)",
  bg: "#1a1816",               // ← tune here; background
  surface: "rgba(30, 25, 18, 0.8)",
  dark: "#1e1912",
  white: "#ffffff",
  // Warm-white glow — used by animation orbs and particle effects
  warmGlow60: "rgba(255, 248, 220, 0.6)",
  warmGlow50: "rgba(255, 248, 220, 0.5)",
  warmGlow40: "rgba(255, 248, 220, 0.4)",
  orbWhite90: "rgba(255, 253, 240, 0.9)",
  flashWhite25: "rgba(255, 251, 230, 0.25)",
  flashWhite60: "rgba(255, 251, 230, 0.6)",
  flashWhite: "rgba(255, 255, 255, 0.95)",
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
