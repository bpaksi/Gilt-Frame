"use client";

import MarkerSVG from "../MarkerSVG";
import HintSystem from "./HintSystem";
import type { WayfindingCompassConfig, HintItem } from "@/config/chapters";

interface IndoorWayfindingProps {
  config: WayfindingCompassConfig;
  onAdvance: () => void;
  chapterId?: string;
  flowIndex?: number;
  revealedHintTiers?: number[];
}

export default function IndoorWayfinding({
  config,
  onAdvance,
  chapterId,
  flowIndex,
  revealedHintTiers,
}: IndoorWayfindingProps) {
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
      }}
    >
      <MarkerSVG size={48} variant="gold" animated />

      {config.wayfinding_text && (
        <p
          style={{
            color: "rgba(200, 165, 75, 0.9)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "18px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.8,
            maxWidth: "320px",
          }}
        >
          {config.wayfinding_text}
        </p>
      )}

      <button
        onClick={onAdvance}
        style={{
          background: "none",
          border: "1px solid rgba(200, 165, 75, 0.3)",
          color: "rgba(200, 165, 75, 0.7)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "15px",
          fontStyle: "italic",
          letterSpacing: "2px",
          padding: "14px 28px",
          cursor: "pointer",
          minHeight: "44px",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        I have arrived
      </button>

      {config.hints && chapterId && flowIndex !== undefined && (
        <HintSystem
          hints={config.hints as HintItem[]}
          chapterId={chapterId}
          flowIndex={flowIndex}
          initialRevealedTiers={revealedHintTiers}
        />
      )}
    </div>
  );
}
