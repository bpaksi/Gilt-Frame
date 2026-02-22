"use client";

import { useState, useCallback, useMemo } from "react";
import HintSystem from "../HintSystem";
import AnswerQuestion from "../AnswerQuestion";
import OrnateDivider from "@/components/ui/OrnateDivider";
import type { MultipleChoiceConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";

interface MultipleChoiceProps {
  config: MultipleChoiceConfig;
  onAdvance: () => void;
  revealedHintTiers?: number[];
  onAnswerRecord?: (questionIndex: number, selectedOption: string, correct: boolean) => Promise<void>;
  onHintReveal?: (tier: number) => Promise<void>;
}

export default function MultipleChoice({
  config,
  onAdvance,
  revealedHintTiers,
  onAnswerRecord,
  onHintReveal,
}: MultipleChoiceProps) {
  const { questions } = config;
  const [currentQ, setCurrentQ] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(true);

  const question = questions[currentQ];

  // Compute tier offset for globally unique hint tiers across questions
  const hintTierOffset = useMemo(
    () => questions.slice(0, currentQ).reduce((sum, q) => sum + (q.hints?.length ?? 0), 0),
    [questions, currentQ]
  );

  const handleCorrect = useCallback(() => {
    if (transitioning) return;
    void onAnswerRecord?.(currentQ, questions[currentQ].correct_answer, true);

    if (currentQ === questions.length - 1) {
      setTimeout(onAdvance, 400);
    } else {
      setTransitioning(true);
      setQuestionsVisible(false);
      setTimeout(() => {
        setCurrentQ((q) => q + 1);
        setQuestionsVisible(true);
        setTransitioning(false);
      }, 850);
    }
  }, [transitioning, currentQ, questions, onAdvance, onAnswerRecord]);

  const handleWrong = useCallback(() => {
    void onAnswerRecord?.(currentQ, questions[currentQ].correct_answer, false);
  }, [currentQ, questions, onAnswerRecord]);

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
      <AnswerQuestion
        key={currentQ}
        question={question.question}
        correct_answer={question.correct_answer}
        answer_pool={question.answer_pool}
        num_distractors={question.num_distractors}
        onCorrect={handleCorrect}
        onWrong={handleWrong}
        disabled={transitioning}
        visible={questionsVisible}
      />

      {/* Scrollwork divider + per-question hints */}
      {question.hints?.length && (
        <>
          <OrnateDivider
            style={{
              opacity: questionsVisible ? 0.3 : 0,
              transition: "opacity 0.4s ease",
              margin: "-12px 0",
            }}
          />
          <HintSystem
            key={currentQ}
            hints={question.hints}
            tierOffset={hintTierOffset}
            initialRevealedTiers={revealedHintTiers}
            onHintReveal={onHintReveal}
          />
        </>
      )}
    </div>
  );
}

export const showcase: ShowcaseDefinition<MultipleChoiceProps> = {
  category: "quest",
  label: "Multiple Choice",
  description:
    "Sequential questions with hints. Distractors are randomly drawn from a pool and re-shuffled on wrong answers.",
  uses: ["HintSystem", "AnswerQuestion", "OrnateDivider"],
  defaults: {
    config: {
      questions: [
        {
          question: "Who founded the Order of the Gilt Frame?",
          correct_answer: "A painter",
          answer_pool: ["A scholar", "A merchant", "A knight"],
          hints: [
            "The founder worked with their hands.",
            "Think of what hangs in the halls.",
          ],
        },
        {
          question: "Which painting is described as 'light given memory'?",
          correct_answer: "The Golden Hour",
          answer_pool: [
            "The Silver Mist",
            "The Amber Tide",
            "The Copper Dawn",
            "The Violet Dusk",
          ],
        },
      ],
    },
    onAdvance: () => {},
  },
  tips: [
    "Wrong answers fade only the options out, reshuffle from the pool, and fade back in.",
    "Correct answer on the last question triggers onAdvance after a brief pause.",
  ],
};
