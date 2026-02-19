"use client";

import { useState, useCallback } from "react";
import { revealHint } from "@/lib/actions/quest";
import type { HintItem } from "@/config/chapters";

interface HintSystemProps {
  hints: HintItem[];
  chapterId: string;
  flowIndex: number;
  initialRevealedTiers?: number[];
}

export default function HintSystem({
  hints,
  chapterId,
  flowIndex,
  initialRevealedTiers = [],
}: HintSystemProps) {
  const [revealedTiers, setRevealedTiers] = useState<number[]>(initialRevealedTiers);
  const [loading, setLoading] = useState(false);

  const sortedHints = [...hints].sort((a, b) => a.tier - b.tier);
  const nextHint = sortedHints.find((h) => !revealedTiers.includes(h.tier));
  const allRevealed = !nextHint;

  const handleReveal = useCallback(async () => {
    if (!nextHint || loading) return;
    setLoading(true);
    const result = await revealHint(chapterId, flowIndex, nextHint.tier);
    if (result) {
      setRevealedTiers((prev) => [...prev, nextHint.tier]);
    }
    setLoading(false);
  }, [nextHint, loading, chapterId, flowIndex]);

  if (hints.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginTop: "24px",
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
              paddingLeft: "16px",
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
        <button
          onClick={handleReveal}
          disabled={loading}
          style={{
            background: "none",
            border: "none",
            color: "rgba(200, 165, 75, 0.4)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "13px",
            fontStyle: "italic",
            cursor: loading ? "wait" : "pointer",
            padding: "8px 0",
            textAlign: "left",
            paddingLeft: "16px",
            minHeight: "44px",
            display: "flex",
            alignItems: "center",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {loading ? "Revealing..." : "Request a Hint"}
        </button>
      )}
    </div>
  );
}
