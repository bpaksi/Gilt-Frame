"use client";

import { useState, useCallback } from "react";
import { colors, fontFamily } from "@/components/ui/tokens";
import MarkerAnimation from "./MarkerAnimation";
import type { ShowcaseDefinition } from "@/components/showcase";

interface GiltFrameProps {
  children: React.ReactNode;
  delayMs?: number;
  onComplete?: () => void;
}

export default function GiltFrame({
  children,
  delayMs = 800,
  onComplete,
}: GiltFrameProps) {
  const [animationDone, setAnimationDone] = useState(false);

  const handleAnimationComplete = useCallback(() => {
    setAnimationDone(true);
    onComplete?.();
  }, [onComplete]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: colors.bg,
        overflow: "hidden",
        position: "relative",
        padding: "40px 24px",
      }}
    >
      <MarkerAnimation onComplete={handleAnimationComplete} delayMs={delayMs} />

      <div
        style={{
          marginTop: "60px",
          opacity: animationDone ? 1 : 0,
          transition: "opacity 2s ease",
          textAlign: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export const showcase: ShowcaseDefinition<GiltFrameProps> = {
  category: "game",
  label: "Gilt Frame",
  description: "Layout wrapper with marker ceremony animation",
  uses: ["MarkerAnimation"],
  defaults: {
    children: (
      <p
        style={{
          color: colors.gold50,
          fontFamily,
          fontSize: "16px",
          fontStyle: "italic",
          textAlign: "center",
          letterSpacing: "1px",
          lineHeight: "1.8",
        }}
      >
        The ceremony is complete.
      </p>
    ),
  },
  callbacks: { onComplete: "noop" },
};
