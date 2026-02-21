"use client";

import type { ReactNode } from "react";

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
 * `overflow: auto` handles components taller than the viewport (e.g. GiltFrame with 100dvh).
 */
export default function GameViewport({ device, children }: GameViewportProps) {
  return (
    <div
      style={{
        width: device.width,
        height: device.height,
        borderRadius: 20,
        border: "2px solid #d0d0d0",
        overflow: "auto",
        flexShrink: 0,
        // Replicate (game)/layout.tsx inline styles exactly
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        color: "rgba(200, 165, 75, 0.9)",
        fontFamily: "Georgia, 'Times New Roman', serif",
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
