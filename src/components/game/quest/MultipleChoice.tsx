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
  const [questionKey, setQuestionKey] = useState(0);

  const question = questions[currentQ];

  // Compute tier offset for globally unique hint tiers across questions
  const hintTierOffset = useMemo(
    () => questions.slice(0, currentQ).reduce((sum, q) => sum + (q.hints?.length ?? 0), 0),
    [questions, currentQ]
  );

  const handleResult = useCallback(
    (correct: boolean) => {
      if (transitioning) return;

      // Record the answer (fire-and-forget — does not affect control flow)
      void onAnswerRecord?.(currentQ, question.options[question.correct], correct);

      if (correct) {
        if (currentQ === questions.length - 1) {
          // Last question — advance after a brief pause
          setTimeout(onAdvance, 400);
        } else {
          // Transition to next question: fade out → swap → fade in
          setTransitioning(true);
          setQuestionsVisible(false);
          setTimeout(() => {
            setCurrentQ((prev) => prev + 1);
            setQuestionKey((k) => k + 1);
            setQuestionsVisible(true);
            setTransitioning(false);
          }, 850);
        }
      }
      // Wrong: QuizQuestion already reset its own state; nothing to do here
    },
    [transitioning, currentQ, questions.length, question, onAdvance, onAnswerRecord]
  );

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
        key={questionKey}
        question={question.question}
        options={question.options}
        correctIndex={question.correct}
        onResult={handleResult}
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
  description: "Sequential multiple-choice questions with hints",
  uses: ["HintSystem", "AnswerQuestion", "OrnateDivider"],
  defaults: {
    config: {
      questions: [
        {
          question: "Who founded the Order of the Gilt Frame?",
          options: ["A scholar", "A painter", "A merchant", "A knight"],
          correct: 1,
        },
      ],
    },
    onAdvance: () => {},
  },
};
