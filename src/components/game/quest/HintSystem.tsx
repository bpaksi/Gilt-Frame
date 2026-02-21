"use client";

import { useState } from "react";
import TextButton from "@/components/ui/TextButton";
import { revealHint } from "@/lib/actions/quest";
import type { HintItem } from "@/config";

interface HintSystemProps {
  hints: HintItem[];
  chapterId: string;
  stepIndex: number;
  initialRevealedTiers?: number[];
}

const EMPTY_TIERS: number[] = [];

export default function HintSystem({
  hints,
  chapterId,
  stepIndex,
  initialRevealedTiers = EMPTY_TIERS,
}: HintSystemProps) {
  const [revealedTiers, setRevealedTiers] = useState<number[]>(initialRevealedTiers);
  const [loading, setLoading] = useState(false);

  const sortedHints = [...hints].sort((a, b) => a.tier - b.tier);
  const nextHint = sortedHints.find((h) => !revealedTiers.includes(h.tier));
  const allRevealed = !nextHint;

  const handleReveal = async () => {
    if (!nextHint || loading) return;
    setLoading(true);
    const result = await revealHint(chapterId, stepIndex, nextHint.tier);
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
              color: "rgba(200, 165, 75, 0.5)",
              fontFamily: "Georgia, 'Times New Roman', serif",
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
          disabled={loading}
          style={{ cursor: loading ? "wait" : undefined }}
        >
          {loading ? "Revealing..." : "Request a Hint"}
        </TextButton>
      )}
    </div>
  );
}
