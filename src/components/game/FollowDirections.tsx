"use client";

import TapToContinue from "./TapToContinue";
import HintSystem from "./HintSystem";
import OrnateDivider from "@/components/ui/OrnateDivider";
import type { ShowcaseDefinition } from "@/components/showcase";

type IndoorConfig = {
  wayfinding_text?: string;
  arrival_instruction?: string;
  hints?: string[];
};

interface FollowDirectionsProps {
  config: IndoorConfig;
  onComplete: () => void;
  revealedHintTiers?: number[];
  onHintReveal?: (tier: number) => Promise<void>;
}

export default function FollowDirections({
  config,
  onComplete,
  revealedHintTiers,
  onHintReveal,
}: FollowDirectionsProps) {
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
      <TapToContinue lines={lines} instruction={config.arrival_instruction} onComplete={onComplete} />

      {config.hints && (
        <>
          <OrnateDivider />
          <HintSystem
            hints={config.hints}
            initialRevealedTiers={revealedHintTiers}
            onHintReveal={onHintReveal}
          />
        </>
      )}
    </div>
  );
}

export const showcase: ShowcaseDefinition<FollowDirectionsProps> = {
  category: "game",
  label: "Follow Directions",
  description: "Text-based indoor directions with arrival tap via TapToContinue",
  uses: ["TapToContinue", "OrnateDivider", "HintSystem"],
  defaults: {
    config: {
      wayfinding_text: "Proceed to the east gallery and locate the gilded frame.",
      arrival_instruction: "Tap when you find it.",
      hints: ["Look for the gold leaf border.", "It hangs near the north window.", "Third painting from the left."],
    },
  },
  callbacks: { onComplete: "done", onHintReveal: "action" },
};
