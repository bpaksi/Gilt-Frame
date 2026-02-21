"use client";

import { useState, useCallback } from "react";
import AmbientParticles from "@/components/ui/AmbientParticles";
import { colors, fontFamily } from "@/components/ui/tokens";
import MarkerAnimation from "./MarkerAnimation";
import type { ShowcaseDefinition } from "@/components/showcase";

interface GiltFrameProps {
  children: React.ReactNode;
  delayMs?: number;
  onAnimationComplete?: () => void;
}

export default function GiltFrame({
  children,
  delayMs = 800,
  onAnimationComplete,
}: GiltFrameProps) {
  const [animationDone, setAnimationDone] = useState(false);

  const handleAnimationComplete = useCallback(() => {
    setAnimationDone(true);
    onAnimationComplete?.();
  }, [onAnimationComplete]);

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
      <AmbientParticles count={5} opacity={0.3} active={animationDone} />

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
  uses: ["AmbientParticles", "MarkerAnimation"],
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
};
