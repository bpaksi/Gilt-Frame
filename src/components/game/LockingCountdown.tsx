"use client";

import { useState, useEffect } from "react";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

// ── Props ─────────────────────────────────────────────────────────────────────

interface LockingCountdownProps {
  /** Message shown above the countdown digits. */
  message: string;
  /** Text shown after the countdown completes, before onComplete fires. */
  resolution: string;
  /** Starting count. Default 5. */
  from?: number;
  /** Milliseconds to display the resolution before calling onComplete. Default 2000. */
  resolutionDelay?: number;
  /** Called after the resolution has been displayed. */
  onComplete: () => void;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STYLES = `
  @keyframes lockingFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes countdownPulse {
    0%   { opacity: 0.3; transform: scale(0.85); }
    20%  { opacity: 1;   transform: scale(1); }
    80%  { opacity: 1;   transform: scale(1); }
    100% { opacity: 0.6; transform: scale(0.97); }
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * GAME component: animated countdown sequence with a resolution message.
 * Counts from `from` down to 1, then shows `resolution` and fires `onComplete`.
 * Used after a puzzle is solved to create a dramatic pause before advancing.
 */
export default function LockingCountdown({
  message,
  resolution,
  from = 5,
  resolutionDelay = 2000,
  onComplete,
}: LockingCountdownProps) {
  const [count, setCount] = useState(from);
  const [resolved, setResolved] = useState(false);

  // Countdown interval
  useEffect(() => {
    let current = from;
    const interval = setInterval(() => {
      current -= 1;
      if (current <= 0) {
        clearInterval(interval);
        setResolved(true);
      } else {
        setCount(current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [from]);

  // Resolution → onComplete delay
  useEffect(() => {
    if (!resolved) return;
    const timer = setTimeout(onComplete, resolutionDelay);
    return () => clearTimeout(timer);
  }, [resolved, resolutionDelay, onComplete]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        flex: 1,
        gap: "32px",
        padding: "40px 24px",
        animation: "lockingFadeIn 400ms ease-out both",
      }}
    >
      <style>{STYLES}</style>

      {resolved ? (
        <div
          style={{
            color: colors.goldBright90,
            fontFamily: fontFamily,
            fontSize: "22px",
            fontStyle: "italic",
            textAlign: "center",
            letterSpacing: "4px",
            lineHeight: 1.8,
            animation: "lockingFadeIn 600ms ease-out both",
          }}
        >
          {resolution}
        </div>
      ) : (
        <>
          <div
            style={{
              color: colors.gold70,
              fontFamily: fontFamily,
              fontSize: "17px",
              fontStyle: "italic",
              textAlign: "center",
              letterSpacing: "3px",
              lineHeight: 1.8,
            }}
          >
            {message}
          </div>
          <div
            key={count}
            style={{
              color: colors.goldBright90,
              fontFamily: fontFamily,
              fontSize: "64px",
              fontStyle: "italic",
              letterSpacing: "4px",
              animation: "countdownPulse 1s ease-out both",
            }}
          >
            {count}
          </div>
        </>
      )}
    </div>
  );
}

// ── Showcase ──────────────────────────────────────────────────────────────────

export const showcase: ShowcaseDefinition<LockingCountdownProps> = {
  category: "game",
  label: "Locking Countdown",
  description: "Animated countdown sequence with resolution message — shown after a puzzle is solved before advancing",
  defaults: {
    message: "The compass yields its secret…",
    resolution: "The way is found",
    from: 5,
    onComplete: () => {},
  },
};
