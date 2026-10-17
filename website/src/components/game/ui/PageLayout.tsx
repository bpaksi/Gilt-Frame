"use client";

import { useState, useCallback, useEffect } from "react";
import { colors, fontFamily } from "@/components/ui/tokens";
import OrbAnimation from "./OrbAnimation";
import type { ShowcaseDefinition } from "@/components/showcase";

interface PageLayoutProps {
  children: React.ReactNode;
  skipLabel: string;
  delayMs?: number;
  onComplete?: () => void;
  /**
   * When set, the intro is remembered in localStorage under this key: after
   * the first full viewing (or skip) it jumps straight to the settled Marker.
   * prefers-reduced-motion always skips the intro, with or without a key.
   */
  introKey?: string;
}

export default function PageLayout({
  children,
  skipLabel,
  delayMs = 800,
  onComplete,
  introKey,
}: PageLayoutProps) {
  const [animationDone, setAnimationDone] = useState(false);
  const [settled, setSettled] = useState(false);

  // Decide after mount (localStorage / matchMedia are client-only).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    if (introKey) {
      try {
        seen = localStorage.getItem(`gf:intro-seen:${introKey}`) === "1";
      } catch {
        /* storage blocked (private mode) — just play the intro */
      }
    }
    if (!reduce && !seen) return;
    const id = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(id);
  }, [introKey]);

  const handleAnimationComplete = useCallback(() => {
    setAnimationDone(true);
    if (introKey) {
      try {
        localStorage.setItem(`gf:intro-seen:${introKey}`, "1");
      } catch {
        /* ignore */
      }
    }
    onComplete?.();
  }, [onComplete, introKey]);

  return (
    <div
      style={{
        minHeight: "100%",
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
      <OrbAnimation onComplete={handleAnimationComplete} skipLabel={skipLabel} delayMs={delayMs} settled={settled} />

      <div
        style={{
          marginTop: "60px",
          opacity: animationDone ? 1 : 0,
          transition: settled ? "none" : "opacity 2s ease",
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
    skipLabel: "tap to skip",
    children: (
      <p
        style={{
          color: colors.gold60,
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
