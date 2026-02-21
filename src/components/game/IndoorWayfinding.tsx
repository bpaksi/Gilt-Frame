"use client";

import MarkerSVG from "@/components/ui/MarkerSVG";
import HintSystem from "./HintSystem";
import GhostButton from "@/components/ui/GhostButton";
import type { WayfindingCompassConfig, HintItem } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";

interface IndoorWayfindingProps {
  config: WayfindingCompassConfig;
  onAdvance: () => void;
  chapterId?: string;
  stepIndex?: number;
  revealedHintTiers?: number[];
  revealHintAction?: (chapterId: string, stepIndex: number, tier: number) => Promise<{ hint: string } | null>;
}

export default function IndoorWayfinding({
  config,
  onAdvance,
  chapterId,
  stepIndex,
  revealedHintTiers,
  revealHintAction,
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
          revealHintAction={revealHintAction}
        />
      )}
    </div>
  );
}

export const showcase: ShowcaseDefinition<IndoorWayfindingProps> = {
  category: "game",
  label: "Indoor Wayfinding",
  description: "Text-based indoor directions with arrival button",
};
