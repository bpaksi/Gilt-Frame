"use client";

import { useState } from "react";
import TextButton from "@/components/ui/TextButton";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface HintSystemProps {
  hints: string[];
  chapterId: string;
  stepIndex: number;
  /** Offset added to the 1-based index when calling revealHintAction. Used by
   *  MultipleChoice to keep tiers globally unique across questions. */
  tierOffset?: number;
  initialRevealedTiers?: number[];
  revealHintAction?: (chapterId: string, stepIndex: number, tier: number) => Promise<{ hint: string } | null>;
}

const EMPTY_TIERS: number[] = [];

export default function HintSystem({
  hints,
  chapterId,
  stepIndex,
  tierOffset = 0,
  initialRevealedTiers = EMPTY_TIERS,
  revealHintAction,
}: HintSystemProps) {
  const [revealedTiers, setRevealedTiers] = useState<number[]>(initialRevealedTiers);
  const [loading, setLoading] = useState(false);
  const [pressing, setPressing] = useState(false);

  // Compute the global tier for each hint (1-based + offset)
  const nextIndex = hints.findIndex((_, i) => !revealedTiers.includes(tierOffset + i + 1));
  const allRevealed = nextIndex === -1;

  const handleReveal = async () => {
    if (allRevealed || loading) return;

    // Brief press-down animation on the button
    setPressing(true);
    setTimeout(() => setPressing(false), 180);

    const tier = tierOffset + nextIndex + 1;
    setRevealedTiers((prev) => [...prev, tier]);
    if (revealHintAction) {
      setLoading(true);
      await revealHintAction(chapterId, stepIndex, tier);
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
      {/* Revealed hints — above the button, each expanding to push it down */}
      {hints.map((hint, i) => {
        const tier = tierOffset + i + 1;
        if (!revealedTiers.includes(tier)) return null;
        return (
          <div
            key={tier}
            style={{
              overflow: "hidden",
              width: "100%",
              animation: "hint-expand 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
            }}
          >
            <p
              style={{
                color: colors.gold50,
                fontFamily,
                fontSize: "14px",
                fontStyle: "italic",
                textAlign: "center",
                lineHeight: 1.6,
                margin: 0,
                opacity: 0,
                animation: "hint-fade-slide 0.4s 0.06s ease forwards",
              }}
            >
              {hint}
            </p>
          </div>
        );
      })}

      {/* Request hint button — always below hints */}
      {!allRevealed && (
        <div
          style={{
            transform: pressing ? "scale(0.93) translateY(3px)" : "scale(1) translateY(0)",
            transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
    chapterId: "gallery",
    stepIndex: 0,
  },
  callbacks: { revealHintAction: "noop" },
};
