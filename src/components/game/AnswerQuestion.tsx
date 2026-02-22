"use client";

import { useState, useRef } from "react";
import OptionButton from "@/components/ui/OptionButton";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

// ── Pool helpers ──────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function drawOptions(correctAnswer: string, pool: string[], n: number): string[] {
  const distractors = shuffle(pool.filter((p) => p !== correctAnswer)).slice(0, n);
  return shuffle([correctAnswer, ...distractors]);
}

// ─────────────────────────────────────────────────────────────────────────────

interface AnswerQuestionProps {
  question: string;
  correct_answer: string;
  answer_pool: string[];
  num_distractors?: number;
  /** Called after correct feedback settles (~800ms). */
  onCorrect: () => void;
  /** Called after wrong feedback + reshuffle settles (~800ms). */
  onWrong?: () => void;
  /** Prevents selection. Use during inter-question transitions. */
  disabled?: boolean;
  /**
   * Controls overall opacity — lets the parent fade the question in/out during
   * transitions without unmounting.
   */
  visible?: boolean;
}

/**
 * GAME component: renders a single quiz question with option buttons.
 * Draws distractors from `answer_pool` on mount. On wrong answer, only the
 * options container fades out, reshuffles, and fades back in — the question
 * text stays visible throughout.
 *
 * Used by MultipleChoice (FindByText delegates to MultipleChoice).
 */
export default function AnswerQuestion({
  question,
  correct_answer,
  answer_pool,
  num_distractors = 3,
  onCorrect,
  onWrong,
  disabled = false,
  visible = true,
}: AnswerQuestionProps) {
  const [options, setOptions] = useState(() => drawOptions(correct_answer, answer_pool, num_distractors));
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(true);
  const shakeRef = useRef<HTMLDivElement>(null);

  function handleSelect(optionIdx: number) {
    if (disabled || selectedIdx !== null) return;

    const correct = options[optionIdx] === correct_answer;
    setSelectedIdx(optionIdx);
    setIsCorrect(correct);

    if (correct) {
      setTimeout(() => onCorrect(), 800);
    } else {
      // Shake, then fade options out, reshuffle, fade back in
      if (shakeRef.current) {
        const el = shakeRef.current;
        el.classList.remove("shake");
        requestAnimationFrame(() => el.classList.add("shake"));
      }
      setTimeout(() => {
        setOptionsVisible(false);
        setTimeout(() => {
          setOptions(drawOptions(correct_answer, answer_pool, num_distractors));
          setSelectedIdx(null);
          setIsCorrect(null);
          setOptionsVisible(true);
          onWrong?.();
        }, 400);
      }, 400);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
        width: "100%",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <p
        style={{
          color: colors.gold90,
          fontFamily: fontFamily,
          fontSize: "20px",
          fontStyle: "italic",
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: "340px",
          margin: 0,
        }}
      >
        {question}
      </p>

      <div
        ref={shakeRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          maxWidth: "340px",
          opacity: optionsVisible ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      >
        {options.map((option, i) => {
          const isSelected = selectedIdx === i;
          const state =
            isSelected && isCorrect === true
              ? ("correct" as const)
              : isSelected && isCorrect === false
                ? ("wrong" as const)
                : ("default" as const);

          return (
            <OptionButton
              key={option}
              label={option}
              state={state}
              disabled={disabled || selectedIdx !== null}
              onClick={() => handleSelect(i)}
            />
          );
        })}
      </div>
    </div>
  );
}

export const showcase: ShowcaseDefinition<AnswerQuestionProps> = {
  category: "game",
  label: "Answer Question",
  description:
    "Single question with option buttons. Wrong answers fade the options out, reshuffle the pool, and fade back in. Correct answer shows feedback then fires onResult.",
  uses: ["OptionButton"],
  defaults: {
    question: "Who founded the Order of the Gilt Frame?",
    correct_answer: "A painter",
    answer_pool: ["A scholar", "A merchant", "A knight", "A cartographer", "A navigator"],
    visible: true,
  },
  callbacks: { onCorrect: "done", onWrong: "noop" },
};
