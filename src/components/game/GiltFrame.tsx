"use client";

import { useState, useCallback } from "react";
import AmbientParticles from "@/components/ui/AmbientParticles";
import MarkerAnimation from "./MarkerAnimation";

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
        background: "#0a0a0a",
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
