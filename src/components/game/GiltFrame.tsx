"use client";

import { useState, useCallback } from "react";
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
      {/* Ambient particles */}
      {[0, 1, 2, 3, 4].map((particleId) => (
        <div
          key={particleId}
          style={{
            position: "absolute",
            width: "2px",
            height: "2px",
            background: "#C8A54B",
            borderRadius: "50%",
            filter: "blur(0.5px)",
            opacity: animationDone ? 0.3 : 0,
            animation: animationDone
              ? `drift ${5 + particleId}s ease-in-out ${particleId * 0.8}s infinite`
              : "none",
            top: `${20 + particleId * 15}%`,
            left: `${10 + particleId * 20}%`,
          }}
        />
      ))}

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
