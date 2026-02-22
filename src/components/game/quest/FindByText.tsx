"use client";

import { useState, useCallback, useMemo } from "react";
import TapToContinue from "../TapToContinue";
import MultipleChoice from "./MultipleChoice";
import HintSystem from "../HintSystem";
import OrnateDivider from "@/components/ui/OrnateDivider";
import type { FindByTextConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";

interface FindByTextProps {
  config: FindByTextConfig;
  onAdvance: () => void;
  revealedHintTiers?: number[];
  onHintReveal?: (tier: number) => Promise<void>;
}

type Phase = "guidance" | "identification";

export default function FindByText({
  config,
  onAdvance,
  revealedHintTiers,
  onHintReveal,
}: FindByTextProps) {
  const { guidance_text, hints, question, confirmation_instruction = "I think I've found it." } =
    config;

  const [phase, setPhase] = useState<Phase>("guidance");
  const [fadeState, setFadeState] = useState<"in" | "out">("in");

  const guidanceLines = useMemo(() => (guidance_text ?? "").split("\n"), [guidance_text]);

  const goToIdentification = useCallback(() => {
    setFadeState("out");
    setTimeout(() => {
      setPhase("identification");
      setFadeState("in");
    }, 500);
  }, []);

  // ── Render: Guidance phase ───────────────────────────────────────────
  if (phase === "guidance") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          flex: 1,
          gap: "28px",
          padding: "40px 24px",
          opacity: fadeState === "in" ? 1 : 0,
          transition: "opacity 0.45s ease",
        }}
      >
        <TapToContinue
          lines={guidanceLines}
          instruction={confirmation_instruction}
          onComplete={goToIdentification}
          active={phase === "guidance"}
          markerDelay={1000}
          textDelay={800}
          tapDelay={1200}
        />

        {/* Hint system — always available, player-initiated */}
        {hints.length > 0 && (
          <>
            <OrnateDivider
              style={{ opacity: 0.3, transition: "opacity 0.4s ease", margin: "-8px 0" }}
            />
            <HintSystem
              hints={hints}
              initialRevealedTiers={revealedHintTiers}
              onHintReveal={onHintReveal}
            />
          </>
        )}
      </div>
    );
  }

  // ── Render: Identification phase ─────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100%",
        flex: 1,
        opacity: fadeState === "in" ? 1 : 0,
        transition: "opacity 0.45s ease",
      }}
    >
      <MultipleChoice
        config={{ questions: [question] }}
        onAdvance={onAdvance}
      />
    </div>
  );
}

export const showcase: ShowcaseDefinition<FindByTextProps> = {
  category: "quest",
  label: "Find by Text",
  description:
    "Text-guided search leading to pool-based multiple-choice identification. Wrong answers re-shuffle distractors in place via MultipleChoice.",
  uses: ["TapToContinue", "MultipleChoice", "HintSystem", "OrnateDivider"],
  defaults: {
    config: {
      guidance_text: "In the east wing, seek the canvas that glows.\nLook for what time has gilded.",
      hints: ["It hangs near the window.", "The title begins with 'The'."],
      question: {
        question: "What is the name of the painting?",
        correct_answer: "The Golden Hour",
        answer_pool: ["The Silver Mist", "The Amber Tide", "The Copper Dawn"],
      },
    },
    onAdvance: () => {},
  },
};
