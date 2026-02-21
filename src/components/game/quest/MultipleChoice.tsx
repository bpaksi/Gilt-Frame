"use client";

import { useState, useCallback, useMemo } from "react";
import HintSystem from "../HintSystem";
import QuizQuestion from "../QuizQuestion";
import WaveDivider from "@/components/ui/WaveDivider";
import { recordAnswer } from "@/lib/actions/quest";
import type { MultipleChoiceConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";

interface MultipleChoiceProps {
  config: MultipleChoiceConfig;
  onAdvance: () => void;
  chapterId?: string;
  stepIndex?: number;
  revealedHintTiers?: number[];
  recordAnswerAction?: (chapterId: string, stepIndex: number, questionIndex: number, selectedOption: string, correct: boolean) => Promise<void>;
  revealHintAction?: (chapterId: string, stepIndex: number, tier: number) => Promise<{ hint: string } | null>;
}


export default function MultipleChoice({
  config,
  onAdvance,
  chapterId,
  stepIndex,
  revealedHintTiers,
  recordAnswerAction,
  revealHintAction,
}: MultipleChoiceProps) {
  const { questions } = config;
  const [currentQ, setCurrentQ] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(true);
  const [questionKey, setQuestionKey] = useState(0);

  const question = questions[currentQ];

  // Derive HintItems with globally unique tiers from per-question string[]
  const currentHints = useMemo(() => {
    if (!question.hints?.length) return null;
    // Tier offset: sum of hint counts from all preceding questions
    const offset = questions
      .slice(0, currentQ)
      .reduce((sum, q) => sum + (q.hints?.length ?? 0), 0);
    return question.hints.map((hint, i) => ({ tier: offset + i + 1, hint }));
  }, [questions, currentQ, question.hints]);

  const handleResult = useCallback(
    (correct: boolean) => {
      if (transitioning) return;

      // Record the answer (fired after QuizQuestion's visual feedback settles)
      if (chapterId !== undefined && stepIndex !== undefined) {
        (recordAnswerAction ?? recordAnswer)(
          chapterId,
          stepIndex,
          currentQ,
          question.options[question.correct], // always record which option was correct
          correct
        );
      }

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
    [transitioning, currentQ, questions.length, question, onAdvance, chapterId, stepIndex, recordAnswerAction]
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
      <QuizQuestion
        key={questionKey}
        question={question.question}
        options={question.options}
        correctIndex={question.correct}
        onResult={handleResult}
        disabled={transitioning}
        visible={questionsVisible}
      />

      {/* Scrollwork divider + per-question hints */}
      {currentHints && chapterId && stepIndex !== undefined && (
        <>
          <WaveDivider
            style={{
              opacity: questionsVisible ? 0.3 : 0,
              transition: "opacity 0.4s ease",
              margin: "-12px 0",
            }}
          />
          <HintSystem
            key={currentQ}
            hints={currentHints}
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

export const showcase: ShowcaseDefinition<MultipleChoiceProps> = {
  category: "quest",
  label: "Multiple Choice",
  description: "Sequential multiple-choice questions with hints",
  uses: ["HintSystem", "QuizQuestion", "WaveDivider"],
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
