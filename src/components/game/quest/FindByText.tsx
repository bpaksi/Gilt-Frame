"use client";

import { useState, useCallback, useMemo } from "react";
import TapToContinue from "../TapToContinue";
import AnswerQuestion from "../AnswerQuestion";
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

/** Shuffle array (Fisher–Yates) — returns new array. */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Pick `n` random items from `pool`, excluding `exclude`. */
function pickDistractors(pool: string[], exclude: string, n: number): string[] {
  const filtered = pool.filter((p) => p !== exclude);
  return shuffle(filtered).slice(0, n);
}

type Phase = "guidance" | "identification";

export default function FindByText({
  config,
  onAdvance,
  revealedHintTiers,
  onHintReveal,
}: FindByTextProps) {
  const {
    guidance_text,
    hints,
    question,
    correct_answer,
    painting_pool,
    num_distractors = 3,
    confirmation_instruction = "I think I've found it.",
  } = config;

  const [phase, setPhase] = useState<Phase>("guidance");
  const [fadeState, setFadeState] = useState<"in" | "out">("in");

  // ── Guidance phase entrance animation ────────────────────────────────
  const guidanceLines = useMemo(() => guidance_text.split("\n"), [guidance_text]);

  // ── Build shuffled options each time we enter identification ──────────
  const [options, setOptions] = useState<string[]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);

  const buildOptions = useCallback(() => {
    const distractors = pickDistractors(painting_pool, correct_answer, num_distractors);
    const all = shuffle([correct_answer, ...distractors]);
    setOptions(all);
    setCorrectIdx(all.indexOf(correct_answer));
  }, [painting_pool, correct_answer, num_distractors]);

  // ── Phase transitions ────────────────────────────────────────────────
  const goToIdentification = useCallback(() => {
    setFadeState("out");
    setTimeout(() => {
      buildOptions();
      setPhase("identification");
      setFadeState("in");
    }, 500);
  }, [buildOptions]);

  const returnToGuidance = useCallback(() => {
    setFadeState("out");
    setTimeout(() => {
      setPhase("guidance");
      setFadeState("in");
    }, 500);
  }, []);

  // ── Handle quiz result ───────────────────────────────────────────────
  const handleResult = useCallback(
    (correct: boolean) => {
      if (correct) {
        setTimeout(onAdvance, 400);
      } else {
        // QuizQuestion already reset its own state; return to guidance phase
        returnToGuidance();
      }
    },
    [onAdvance, returnToGuidance]
  );

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",
        flex: 1,
        padding: "40px 24px",
        opacity: fadeState === "in" ? 1 : 0,
        transition: "opacity 0.45s ease",
      }}
    >
      <AnswerQuestion
        question={question}
        options={options}
        correctIndex={correctIdx}
        onResult={handleResult}
      />
    </div>
  );
}

export const showcase: ShowcaseDefinition<FindByTextProps> = {
  category: "quest",
  label: "Find by Text",
  description: "Text-guided search leading to looping multiple-choice identification",
  uses: ["TapToContinue", "AnswerQuestion", "HintSystem", "OrnateDivider"],
  defaults: {
    config: {
      guidance_text: "In the east wing, seek the canvas that glows.\nLook for what time has gilded.",
      hints: [
        "It hangs near the window.",
        "The title begins with 'The'.",
      ],
      question: "What is the name of the painting?",
      correct_answer: "The Golden Hour",
      painting_pool: [
        "The Silver Mist",
        "The Amber Tide",
        "The Copper Dawn",
      ],
    },
    onAdvance: () => {},
  },
};
