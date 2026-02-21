"use client";

import MarkerSVG from "@/components/ui/MarkerSVG";
import HintSystem from "./HintSystem";
import GhostButton from "@/components/ui/GhostButton";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

type IndoorConfig = {
  wayfinding_text?: string;
  hints?: string[];
};

interface IndoorWayfindingProps {
  config: IndoorConfig;
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
            color: colors.gold90,
            fontFamily,
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
          hints={config.hints}
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
  uses: ["MarkerSVG", "HintSystem", "GhostButton"],
  defaults: {
    config: { wayfinding_text: "Proceed to the east gallery and locate the gilded frame." },
    onAdvance: () => {},
  },
};
