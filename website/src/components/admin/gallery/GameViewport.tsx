"use client";

import type { ReactNode } from "react";
import { colors, fontFamily } from "@/components/ui/tokens";

export type DeviceSize = {
  label: string;
  width: number;
  height: number;
};

export const DEVICE_SIZES: DeviceSize[] = [
  { label: "iPhone 8", width: 375, height: 667 },
  { label: "iPhone 14", width: 390, height: 844 },
  { label: "iPad", width: 810, height: 1080 },
];

type NotchStyle = "dynamic-island" | "home-button" | "none";

type PhoneShell = {
  bezel: { top: number; bottom: number; side: number };
  notch: NotchStyle;
  bodyRadius: number;
  screenRadius: number;
};

const SHELLS: Record<string, PhoneShell> = {
  "iPhone 8": {
    bezel: { top: 84, bottom: 96, side: 14 },
    notch: "home-button",
    bodyRadius: 44,
    screenRadius: 8,
  },
  "iPhone 14": {
    bezel: { top: 12, bottom: 10, side: 8 },
    notch: "dynamic-island",
    bodyRadius: 54,
    screenRadius: 46,
  },
  "iPad": {
    bezel: { top: 20, bottom: 20, side: 20 },
    notch: "none",
    bodyRadius: 20,
    screenRadius: 8,
  },
};

const SHELL_BG = "linear-gradient(160deg, #1c1c1c 0%, #0d0d0d 100%)";
const SHELL_BORDER = "#2c2c2c";
const BUTTON_COLOR = "#1a1a1a";
const BUTTON_SHADOW = "inset 0 1px 0 rgba(255,255,255,0.06)";

interface GameViewportProps {
  device: DeviceSize;
  children: ReactNode;
}

/**
 * Renders a styled phone/tablet shell around the game viewport.
 * Device-specific features: dynamic island (iPhone 14), home button + earpiece
 * (iPhone 8), side buttons. The screen area replicates (game)/layout.tsx styles
 * and uses `transform: scale(1)` to create a containing block for
 * `position: fixed` children (e.g. RewardReveal).
 */
export default function GameViewport({ device, children }: GameViewportProps) {
  const shell = SHELLS[device.label] ?? SHELLS["iPhone 14"];
  const { bezel, notch, bodyRadius, screenRadius } = shell;

  const bodyWidth = device.width + bezel.side * 2;
  const bodyHeight = device.height + bezel.top + bezel.bottom;
  const isPhone = device.label !== "iPad";

  return (
    <div style={{ position: "relative", width: bodyWidth, height: bodyHeight, flexShrink: 0 }}>

      {/* ── Phone / tablet body ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: SHELL_BG,
          borderRadius: bodyRadius,
          border: `1.5px solid ${SHELL_BORDER}`,
          boxShadow:
            "0 28px 72px rgba(0,0,0,0.75), 0 0 0 0.5px rgba(255,255,255,0.07) inset",
        }}
      />

      {/* ── Left side buttons (phones only) ── */}
      {isPhone && (
        <>
          {/* Mute / ringer switch */}
          <div style={{
            position: "absolute", left: -3, top: bezel.top + 28,
            width: 3, height: 22,
            background: BUTTON_COLOR, borderRadius: "2px 0 0 2px",
            boxShadow: BUTTON_SHADOW,
          }} />
          {/* Volume up */}
          <div style={{
            position: "absolute", left: -3, top: bezel.top + 64,
            width: 3, height: 34,
            background: BUTTON_COLOR, borderRadius: "2px 0 0 2px",
            boxShadow: BUTTON_SHADOW,
          }} />
          {/* Volume down */}
          <div style={{
            position: "absolute", left: -3, top: bezel.top + 108,
            width: 3, height: 34,
            background: BUTTON_COLOR, borderRadius: "2px 0 0 2px",
            boxShadow: BUTTON_SHADOW,
          }} />
        </>
      )}

      {/* ── Right side / power button (phones only) ── */}
      {isPhone && (
        <div style={{
          position: "absolute",
          right: -3,
          top: bezel.top + (notch === "home-button" ? 64 : 90),
          width: 3,
          height: notch === "home-button" ? 24 : 52,
          background: BUTTON_COLOR, borderRadius: "0 2px 2px 0",
          boxShadow: BUTTON_SHADOW,
        }} />
      )}

      {/* ── iPhone 8 top bezel: earpiece + front camera ── */}
      {notch === "home-button" && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: bezel.top,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, pointerEvents: "none",
        }}>
          {/* Earpiece */}
          <div style={{
            width: 44, height: 5,
            background: "#080808", borderRadius: 3,
            boxShadow: "0 0 0 1px #252525 inset",
          }} />
          {/* Front camera */}
          <div style={{
            width: 9, height: 9, borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #1a2a3a, #050510)",
            border: "1px solid #1c1c1c",
          }} />
        </div>
      )}

      {/* ── Screen ── */}
      <div
        style={{
          position: "absolute",
          left: bezel.side,
          top: bezel.top,
          width: device.width,
          height: device.height,
          borderRadius: screenRadius,
          overflow: "hidden",
          // Replicate (game)/layout.tsx inline styles exactly
          background: colors.bg,
          display: "flex",
          flexDirection: "column",
          color: colors.gold90,
          fontFamily: fontFamily,
          // Creates containing block for position:fixed children
          transform: "scale(1)",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </div>

        {/* Dynamic Island */}
        {notch === "dynamic-island" && (
          <div style={{
            position: "absolute", top: 14, left: "50%",
            transform: "translateX(-50%)",
            width: 126, height: 36,
            background: "#000", borderRadius: 20,
            pointerEvents: "none", zIndex: 100,
            boxShadow: "0 0 0 1.5px rgba(255,255,255,0.04)",
          }} />
        )}

        {/* Home indicator bar (iPhone 14 / iPad) */}
        {notch !== "home-button" && (
          <div style={{
            position: "absolute", bottom: 8, left: "50%",
            transform: "translateX(-50%)",
            width: 134, height: 5,
            background: "rgba(255,255,255,0.22)", borderRadius: 3,
            pointerEvents: "none", zIndex: 100,
          }} />
        )}
      </div>

      {/* ── iPhone 8 home button ── */}
      {notch === "home-button" && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: bezel.bottom,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: "radial-gradient(circle at 40% 35%, #1e1e1e, #0a0a0a)",
            border: "1px solid #282828",
            boxShadow: "0 0 0 3px #141414, 0 0 0 4px #242424",
          }} />
        </div>
      )}
    </div>
  );
}
