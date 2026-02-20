"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import HintSystem from "./HintSystem";
import { recordAnswer } from "@/lib/actions/quest";
import type { MultipleChoiceConfig } from "@/config";

interface MultipleChoiceProps {
  config: MultipleChoiceConfig;
  onAdvance: () => void;
  chapterId?: string;
  stepIndex?: number;
  revealedHintTiers?: number[];
}


export default function MultipleChoice({
  config,
  onAdvance,
  chapterId,
  stepIndex,
  revealedHintTiers,
}: MultipleChoiceProps) {
  const { questions } = config;
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(true);
  const shakeRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = useCallback(
    async (optionIdx: number) => {
      if (locked || transitioning) return;

      const correct = optionIdx === question.correct;
      setSelectedIdx(optionIdx);
      setIsCorrect(correct);

      // Record answer
      if (chapterId !== undefined && stepIndex !== undefined) {
        recordAnswer(
          chapterId,
          stepIndex,
          currentQ,
          question.options[optionIdx],
          correct
        );
      }

      if (correct) {
        setLocked(true);

        // Check if last question
        if (currentQ === questions.length - 1) {
          setTimeout(onAdvance, 1200);
        } else {
          // Transition to next question
          setTimeout(() => {
            setTransitioning(true);
            setOptionsVisible(false);
          }, 1000);

          setTimeout(() => {
            setCurrentQ((prev) => prev + 1);
            setSelectedIdx(null);
            setIsCorrect(null);
            setLocked(false);
            setOptionsVisible(true);
            setTransitioning(false);
          }, 1850); // 1000 + 400 fade out + 450 wait
        }
      } else {
        // Shake
        if (shakeRef.current) {
          shakeRef.current.classList.remove("shake");
          void shakeRef.current.offsetWidth; // Force reflow
          shakeRef.current.classList.add("shake");
        }

        // Reset after fade
        setTimeout(() => {
          setSelectedIdx(null);
          setIsCorrect(null);
        }, 800);
      }
    },
    [locked, transitioning, question, currentQ, questions.length, onAdvance, chapterId, stepIndex]
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
      {/* Question text */}
      <p
        style={{
          color: "rgba(200, 165, 75, 0.9)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "20px",
          fontStyle: "italic",
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: "340px",
          opacity: optionsVisible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {question.question}
      </p>

      {/* Options */}
      <div
        ref={shakeRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          maxWidth: "340px",
          opacity: optionsVisible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}
      >
        {question.options.map((option, i) => {
          const isSelected = selectedIdx === i;
          const isCorrectOption = isSelected && isCorrect === true;
          const isWrongOption = isSelected && isCorrect === false;

          let borderColor = "rgba(200, 165, 75, 0.25)";
          let bgColor = "transparent";
          let textColor = "rgba(200, 165, 75, 0.8)";

          if (isCorrectOption) {
            borderColor = "rgba(200, 165, 75, 0.8)";
            bgColor = "rgba(200, 165, 75, 0.1)";
            textColor = "rgba(200, 165, 75, 1)";
          } else if (isWrongOption) {
            borderColor = "rgba(180, 50, 40, 0.5)";
            textColor = "rgba(180, 50, 40, 0.7)";
          }

          return (
            <button
              key={option}
              onClick={() => handleSelect(i)}
              disabled={locked || transitioning}
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                color: textColor,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "15px",
                fontStyle: "italic",
                padding: "14px 20px",
                textAlign: "left",
                cursor: locked || transitioning ? "default" : "pointer",
                transition: "background 0.3s ease, border-color 0.3s ease, color 0.3s ease, opacity 0.3s ease",
                opacity: isWrongOption ? 0.5 : 1,
                minHeight: "44px",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Scrollwork divider + per-question hints */}
      {currentHints && chapterId && stepIndex !== undefined && (
        <>
          <svg
            width="120"
            height="10"
            viewBox="0 0 120 10"
            fill="none"
            style={{
              opacity: optionsVisible ? 0.3 : 0,
              transition: "opacity 0.4s ease",
              margin: "-12px 0",
            }}
          >
            <path
              d="M0 5 Q15 1 30 5 Q45 9 60 5 Q75 1 90 5 Q105 9 120 5"
              stroke="rgba(200, 165, 75, 1)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
          <HintSystem
            key={currentQ}
            hints={currentHints}
            chapterId={chapterId}
            stepIndex={stepIndex}
            initialRevealedTiers={revealedHintTiers}
          />
        </>
      )}
    </div>
  );
}
