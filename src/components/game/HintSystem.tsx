"use client";

import { useState } from "react";
import TextButton from "@/components/ui/TextButton";
import OrnateDivider from "@/components/ui/OrnateDivider";
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

  // Compute the global tier for each hint (1-based + offset)
  const nextIndex = hints.findIndex((_, i) => !revealedTiers.includes(tierOffset + i + 1));
  const allRevealed = nextIndex === -1;

  const handleReveal = async () => {
    if (allRevealed || loading || !revealHintAction) return;
    setLoading(true);
    const tier = tierOffset + nextIndex + 1;
    const result = await revealHintAction(chapterId, stepIndex, tier);
    if (result) {
      setRevealedTiers((prev) => [...prev, tier]);
    }
    setLoading(false);
  };

  if (hints.length === 0) return null;

  const anyRevealed = revealedTiers.length > 0;

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
      {/* Request hint button — always on top */}
      {!allRevealed && (
        <TextButton
          onClick={handleReveal}
          disabled={loading || !revealHintAction}
          style={{ cursor: loading ? "wait" : undefined }}
        >
          {loading ? "Revealing..." : "Request a Hint"}
        </TextButton>
      )}

      {/* Divider appears once any hint is revealed, stays when button is gone */}
      {anyRevealed && (
        <OrnateDivider style={{ opacity: 0.3, margin: "-4px 0" }} />
      )}

      {/* Revealed hints */}
      {hints.map((hint, i) => {
        const tier = tierOffset + i + 1;
        if (!revealedTiers.includes(tier)) return null;
        return (
          <p
            key={tier}
            style={{
              color: colors.gold50,
              fontFamily,
              fontSize: "14px",
              fontStyle: "italic",
              textAlign: "center",
              lineHeight: 1.6,
              opacity: 0,
              animation: "fade-in 0.6s ease forwards",
            }}
          >
            {hint}
          </p>
        );
      })}
    </div>
  );
}

export const showcase: ShowcaseDefinition<HintSystemProps> = {
  category: "game",
  label: "Hint System",
  description: "Tiered hint reveal with progressive disclosure",
  uses: ["TextButton", "OrnateDivider"],
  defaults: {
    hints: [
      "Look for something gilded.",
      "The frame catches the afternoon light.",
    ],
    chapterId: "gallery",
    stepIndex: 0,
    revealHintAction: async () => ({ hint: "" }),
  },
};
