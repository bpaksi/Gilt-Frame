"use client";

import { useState, useRef } from "react";
import OptionButton from "@/components/ui/OptionButton";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface QuizQuestionProps {
  question: string;
  options: string[];
  /** Index into `options` that is the correct answer. */
  correctIndex: number;
  /**
   * Called after visual feedback settles:
   * - correct=true fires after ~800ms (correct state shown)
   * - correct=false fires after ~800ms (shake + wrong state shown, internal state reset)
   */
  onResult: (correct: boolean) => void;
  /** Prevents selection. Use during inter-question transitions. */
  disabled?: boolean;
  /**
   * Controls overall opacity — lets the parent fade the question in/out during
   * transitions without unmounting (which would lose shake mid-animation).
   */
  visible?: boolean;
}

/**
 * GAME component: renders a single quiz question with option buttons.
 * Handles selection state, correct/wrong visual feedback, and shake animation.
 * Calls `onResult` after feedback settles so the parent can drive next steps.
 *
 * Used by MultipleChoice and FindByText.
 */
export default function QuizQuestion({
  question,
  options,
  correctIndex,
  onResult,
  disabled = false,
  visible = true,
}: QuizQuestionProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const shakeRef = useRef<HTMLDivElement>(null);

  function handleSelect(optionIdx: number) {
    if (disabled || selectedIdx !== null) return;

    const correct = optionIdx === correctIndex;
    setSelectedIdx(optionIdx);
    setIsCorrect(correct);

    if (correct) {
      setTimeout(() => onResult(true), 800);
    } else {
      // Trigger shake animation (rAF ensures the browser commits one frame
      // without the class before re-adding it, reliably restarting the animation)
      if (shakeRef.current) {
        const el = shakeRef.current;
        el.classList.remove("shake");
        requestAnimationFrame(() => el.classList.add("shake"));
      }
      // Reset visual state, then report
      setTimeout(() => {
        setSelectedIdx(null);
        setIsCorrect(null);
        onResult(false);
      }, 800);
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

export const showcase: ShowcaseDefinition<QuizQuestionProps> = {
  category: "game",
  label: "Quiz Question",
  description: "Single question with option buttons, correct/wrong feedback, and shake on wrong answer",
  uses: ["OptionButton"],
  defaults: {
    question: "Who founded the Order of the Gilt Frame?",
    options: ["A scholar", "A painter", "A merchant", "A knight"],
    correctIndex: 1,
    visible: true,
  },
  callbacks: { onResult: "noop" },
};
