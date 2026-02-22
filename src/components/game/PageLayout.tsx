"use client";

import { useState, useCallback } from "react";
import { colors, fontFamily } from "@/components/ui/tokens";
import OrbAnimation from "./OrbAnimation";
import type { ShowcaseDefinition } from "@/components/showcase";

interface PageLayoutProps {
  children: React.ReactNode;
  delayMs?: number;
  onComplete?: () => void;
}

export default function PageLayout({
  children,
  delayMs = 800,
  onComplete,
}: PageLayoutProps) {
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
      <OrbAnimation onComplete={handleAnimationComplete} delayMs={delayMs} />

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

export const showcase: ShowcaseDefinition<PageLayoutProps> = {
  category: "game",
  label: "Page Layout",
  description: "Layout wrapper with marker ceremony animation",
  uses: ["OrbAnimation"],
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
