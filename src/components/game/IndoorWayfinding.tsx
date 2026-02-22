"use client";

import MarkerTap from "./MarkerTap";
import HintSystem from "./HintSystem";
import OrnateDivider from "@/components/ui/OrnateDivider";
import type { ShowcaseDefinition } from "@/components/showcase";

type IndoorConfig = {
  wayfinding_text?: string;
  arrival_instruction?: string;
  hints?: string[];
};

interface IndoorWayfindingProps {
  config: IndoorConfig;
  onComplete: () => void;
  chapterId?: string;
  stepIndex?: number;
  revealedHintTiers?: number[];
  revealHintAction?: (chapterId: string, stepIndex: number, tier: number) => Promise<{ hint: string } | null>;
}

export default function IndoorWayfinding({
  config,
  onComplete,
  chapterId,
  stepIndex,
  revealedHintTiers,
  revealHintAction,
}: IndoorWayfindingProps) {
  const lines = config.wayfinding_text?.split("\n").filter(Boolean) ?? [];

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
      <MarkerTap lines={lines} instruction={config.arrival_instruction} onComplete={onComplete} />

      {config.hints && chapterId && stepIndex !== undefined && (
        <>
          <OrnateDivider />
          <HintSystem
            hints={config.hints}
            chapterId={chapterId}
            stepIndex={stepIndex}
            initialRevealedTiers={revealedHintTiers}
            revealHintAction={revealHintAction}
          />
        </>
      )}
    </div>
  );
}

export const showcase: ShowcaseDefinition<IndoorWayfindingProps> = {
  category: "game",
  label: "Indoor Wayfinding",
  description: "Text-based indoor directions with arrival tap via MarkerTap",
  uses: ["MarkerTap", "OrnateDivider", "HintSystem"],
  defaults: {
    config: {
      wayfinding_text: "Proceed to the east gallery and locate the gilded frame.",
      arrival_instruction: "Tap when you find it.",
      hints: ["Look for the gold leaf border.", "It hangs near the north window.", "Third painting from the left."],
    },
    chapterId: "gallery",
    stepIndex: 0,
  },
  callbacks: { onComplete: "done", revealHintAction: "action" },
};
