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

interface GameViewportProps {
  device: DeviceSize;
  children: ReactNode;
}

/**
 * Replicates the game layout container in a phone-portrait viewport.
 * `transform: scale(1)` creates a containing block for `position: fixed`
 * children (e.g. RewardReveal), keeping them inside the viewport frame.
 * `overflow: hidden` clips content at the phone edges (no visible scrollbar,
 * matching real phone behavior). UI/Game components receive a scrollable inner
 * container injected by ComponentGallery.
 */
export default function GameViewport({ device, children }: GameViewportProps) {
  return (
    <div
      style={{
        width: device.width,
        height: device.height,
        borderRadius: 20,
        border: "2px solid #d0d0d0",
        overflow: "hidden",
        flexShrink: 0,
        // Replicate (game)/layout.tsx inline styles exactly
        background: colors.bg,
        display: "flex",
        flexDirection: "column",
        color: colors.gold90,
        fontFamily: fontFamily,
        // Creates containing block for position:fixed children
        transform: "scale(1)",
        position: "relative",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
