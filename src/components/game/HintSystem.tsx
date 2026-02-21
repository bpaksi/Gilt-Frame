"use client";

import { useState } from "react";
import TextButton from "@/components/ui/TextButton";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

type HintItem = { tier: number; hint: string };

interface HintSystemProps {
  hints: HintItem[];
  chapterId: string;
  stepIndex: number;
  initialRevealedTiers?: number[];
  revealHintAction?: (chapterId: string, stepIndex: number, tier: number) => Promise<{ hint: string } | null>;
}

const EMPTY_TIERS: number[] = [];

export default function HintSystem({
  hints,
  chapterId,
  stepIndex,
  initialRevealedTiers = EMPTY_TIERS,
  revealHintAction,
}: HintSystemProps) {
  const [revealedTiers, setRevealedTiers] = useState<number[]>(initialRevealedTiers);
  const [loading, setLoading] = useState(false);

  const sortedHints = [...hints].sort((a, b) => a.tier - b.tier);
  const nextHint = sortedHints.find((h) => !revealedTiers.includes(h.tier));
  const allRevealed = !nextHint;

  const handleReveal = async () => {
    if (!nextHint || loading || !revealHintAction) return;
    setLoading(true);
    const result = await revealHintAction(chapterId, stepIndex, nextHint.tier);
    if (result) {
      setRevealedTiers((prev) => [...prev, nextHint.tier]);
    }
    setLoading(false);
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
      {/* Revealed hints */}
      {sortedHints
        .filter((h) => revealedTiers.includes(h.tier))
        .map((h) => (
          <p
            key={h.tier}
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
            {h.hint}
          </p>
        ))}

      {/* Request hint button */}
      {!allRevealed && (
        <TextButton
          onClick={handleReveal}
          disabled={loading || !revealHintAction}
          style={{ cursor: loading ? "wait" : undefined }}
        >
          {loading ? "Revealing..." : "Request a Hint"}
        </TextButton>
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
      { tier: 1, hint: "Look for something gilded." },
      { tier: 2, hint: "The frame catches the afternoon light." },
    ],
    chapterId: "gallery",
    stepIndex: 0,
  },
};
