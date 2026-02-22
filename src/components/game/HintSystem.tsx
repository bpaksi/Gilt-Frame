"use client";

import { useState, useEffect } from "react";
import TextButton from "@/components/ui/TextButton";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface HintSystemProps {
  hints: string[];
  /** Offset added to the 1-based index when calling onHintReveal. Used by
   *  MultipleChoice to keep tiers globally unique across questions. */
  tierOffset?: number;
  initialRevealedTiers?: number[];
  onHintReveal?: (tier: number) => Promise<void>;
}

const EMPTY_TIERS: number[] = [];

// Expands smoothly from zero height using the CSS grid-rows technique,
// which correctly interpolates to auto height (unlike max-height).
function HintItem({ hint }: { hint: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        width: "100%",
      }}
    >
      <div style={{ overflow: "hidden", minHeight: 0 }}>
        <p
          style={{
            color: colors.gold50,
            fontFamily,
            fontSize: "14px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.6,
            margin: 0,
            paddingBottom: "2px",
            opacity: open ? 1 : 0,
            transform: open ? "translateY(0)" : "translateY(-4px)",
            transition: "opacity 0.4s 0.15s ease, transform 0.4s 0.15s ease",
          }}
        >
          {hint}
        </p>
      </div>
    </div>
  );
}

export default function HintSystem({
  hints,
  tierOffset = 0,
  initialRevealedTiers = EMPTY_TIERS,
  onHintReveal,
}: HintSystemProps) {
  const [revealedTiers, setRevealedTiers] = useState<number[]>(initialRevealedTiers);
  const [loading, setLoading] = useState(false);
  const [btnPressed, setBtnPressed] = useState(false);

  const nextIndex = hints.findIndex((_, i) => !revealedTiers.includes(tierOffset + i + 1));
  const allRevealed = nextIndex === -1;

  const handleReveal = async () => {
    if (allRevealed || loading) return;
    const tier = tierOffset + nextIndex + 1;
    setRevealedTiers((prev) => [...prev, tier]);
    if (onHintReveal) {
      setLoading(true);
      await onHintReveal(tier);
      setLoading(false);
    }
  };

  if (hints.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        maxWidth: "320px",
      }}
    >
      {/* Revealed hints — above the button */}
      {hints.map((hint, i) => {
        const tier = tierOffset + i + 1;
        if (!revealedTiers.includes(tier)) return null;
        return <HintItem key={tier} hint={hint} />;
      })}

      {/* Request hint button — below hints, with tactile press feel */}
      {!allRevealed && (
        <div
          onPointerDown={() => setBtnPressed(true)}
          onPointerUp={() => setBtnPressed(false)}
          onPointerLeave={() => setBtnPressed(false)}
          style={{
            transform: btnPressed ? "scale(0.96) translateY(2px)" : "scale(1) translateY(0px)",
            transition: btnPressed
              ? "transform 0.08s ease"
              : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <TextButton
            onClick={handleReveal}
            disabled={loading}
            style={{ cursor: loading ? "wait" : undefined }}
          >
            {loading ? "Revealing..." : "Request a Hint"}
          </TextButton>
        </div>
      )}
    </div>
  );
}

export const showcase: ShowcaseDefinition<HintSystemProps> = {
  category: "game",
  label: "Hint System",
  description: "Tiered hint reveal with progressive disclosure",
  uses: ["TextButton"],
  defaults: {
    hints: [
      "Look for something gilded.",
      "The frame catches the afternoon light.",
    ],
  },
  callbacks: { onHintReveal: "noop" },
};
