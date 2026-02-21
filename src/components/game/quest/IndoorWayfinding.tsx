"use client";

import MarkerSVG from "../MarkerSVG";
import HintSystem from "./HintSystem";
import GhostButton from "@/components/ui/GhostButton";
import type { WayfindingCompassConfig, HintItem } from "@/config";

interface IndoorWayfindingProps {
  config: WayfindingCompassConfig;
  onAdvance: () => void;
  chapterId?: string;
  stepIndex?: number;
  revealedHintTiers?: number[];
}

export default function IndoorWayfinding({
  config,
  onAdvance,
  chapterId,
  stepIndex,
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

      <GhostButton onClick={onAdvance}>
        I have arrived
      </GhostButton>

      {config.hints && chapterId && stepIndex !== undefined && (
        <HintSystem
          hints={config.hints as HintItem[]}
          chapterId={chapterId}
          stepIndex={stepIndex}
          initialRevealedTiers={revealedHintTiers}
        />
      )}
    </div>
  );
}
