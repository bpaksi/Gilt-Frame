"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useStaggeredReveal } from "@/lib/hooks/useStaggeredReveal";
import MarkerSVG from "@/components/ui/MarkerSVG";
import HintSystem from "../HintSystem";
import OptionButton from "@/components/ui/OptionButton";
import WaveDivider from "@/components/ui/WaveDivider";
import type { FindByTextConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";

interface FindByTextProps {
  config: FindByTextConfig;
  onAdvance: () => void;
  chapterId?: string;
  stepIndex?: number;
  revealedHintTiers?: number[];
  revealHintAction?: (chapterId: string, stepIndex: number, tier: number) => Promise<{ hint: string } | null>;
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
  chapterId,
  stepIndex,
  revealedHintTiers,
  revealHintAction,
}: FindByTextProps) {
  const {
    guidance_text,
    hints,
    question,
    correct_answer,
    painting_pool,
    num_distractors = 3,
  } = config;

  const [phase, setPhase] = useState<Phase>("guidance");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const shakeRef = useRef<HTMLDivElement>(null);

  // ── Guidance phase entrance animation ────────────────────────────────
  const guidanceLines = useMemo(() => guidance_text.split("\n"), [guidance_text]);
  const { lineVisibility, markerVisible, textVisible: instructionVisible, tapReady } = useStaggeredReveal({
    lines: guidanceLines,
    active: phase === "guidance",
    markerDelay: 1000,
    textDelay: 800,
    tapDelay: 1200,
  });

  // ── Build shuffled options each time we enter identification ──────────
  const [options, setOptions] = useState<string[]>([]);
  const [correctIdx, setCorrectIdx] = useState(0);

  const buildOptions = useCallback(() => {
    const distractors = pickDistractors(painting_pool, correct_answer, num_distractors);
    const all = shuffle([correct_answer, ...distractors]);
    setOptions(all);
    setCorrectIdx(all.indexOf(correct_answer));
    setSelectedIdx(null);
    setIsCorrect(null);
    setLocked(false);
  }, [painting_pool, correct_answer, num_distractors]);

  // ── Phase transitions ────────────────────────────────────────────────
  const goToIdentification = useCallback(() => {
    if (!tapReady) return;
    setFadeState("out");
    setTimeout(() => {
      buildOptions();
      setPhase("identification");
      setFadeState("in");
    }, 500);
  }, [tapReady, buildOptions]);

  const returnToGuidance = useCallback(() => {
    setFadeState("out");
    setTimeout(() => {
      setPhase("guidance");
      setFadeState("in");
    }, 500);
  }, []);

  // ── Handle answer selection ──────────────────────────────────────────
  const handleSelect = useCallback(
    (optionIdx: number) => {
      if (locked) return;

      const correct = optionIdx === correctIdx;
      setSelectedIdx(optionIdx);
      setIsCorrect(correct);

      if (correct) {
        setLocked(true);
        setTimeout(onAdvance, 1200);
      } else {
        // Shake gently
        if (shakeRef.current) {
          shakeRef.current.classList.remove("shake");
          void shakeRef.current.offsetWidth;
          shakeRef.current.classList.add("shake");
        }
        // After shake settles, return to guidance
        setTimeout(() => {
          returnToGuidance();
        }, 1200);
      }
    },
    [locked, correctIdx, onAdvance, returnToGuidance]
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
        {/* Guidance text lines — stagger in */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {guidanceLines.map((line: string, i: number) => (
            <p
              key={i}
              style={{
                opacity: lineVisibility[i] ? 1 : 0,
                transition: "opacity 0.8s ease",
                color: "rgba(200, 165, 75, 0.85)",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "18px",
                fontStyle: "italic",
                textAlign: "center",
                lineHeight: 1.8,
                maxWidth: "320px",
                margin: 0,
              }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Marker + "I think I've found it" */}
        <button
          onClick={goToIdentification}
          disabled={!tapReady}
          style={{
            background: "none",
            border: "none",
            cursor: tapReady ? "pointer" : "default",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            padding: "20px",
            minWidth: "44px",
            minHeight: "44px",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <div
            style={{
              opacity: markerVisible ? 1 : 0,
              transition: "opacity 0.8s ease",
              animation: markerVisible
                ? "pulse-soft 2s ease-in-out infinite"
                : undefined,
            }}
          >
            <MarkerSVG size={100} variant="gold" />
          </div>

          <p
            style={{
              opacity: instructionVisible ? 1 : 0,
              transition: "opacity 0.8s ease",
              color: "rgba(200, 165, 75, 0.7)",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "16px",
              fontStyle: "italic",
              textAlign: "center",
              letterSpacing: "1px",
              lineHeight: 1.8,
              maxWidth: "280px",
            }}
          >
            I think I&rsquo;ve found it.
          </p>
        </button>

        {/* Hint system — always available, player-initiated */}
        {hints.length > 0 && chapterId && stepIndex !== undefined && (
          <>
            <WaveDivider
              style={{ opacity: instructionVisible ? 0.3 : 0, transition: "opacity 0.4s ease", margin: "-8px 0" }}
            />
            <HintSystem
              hints={hints}
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
        gap: "32px",
        padding: "40px 24px",
        opacity: fadeState === "in" ? 1 : 0,
        transition: "opacity 0.45s ease",
      }}
    >
      {/* Question */}
      <p
        style={{
          color: "rgba(200, 165, 75, 0.9)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "20px",
          fontStyle: "italic",
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: "340px",
        }}
      >
        {question}
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
        }}
      >
        {options.map((option, i) => {
          const isSelected = selectedIdx === i;
          const state = isSelected && isCorrect === true
            ? "correct" as const
            : isSelected && isCorrect === false
              ? "wrong" as const
              : "default" as const;

          return (
            <OptionButton
              key={option}
              label={option}
              state={state}
              disabled={locked}
              onClick={() => handleSelect(i)}
            />
          );
        })}
      </div>
    </div>
  );
}

export const showcase: ShowcaseDefinition<FindByTextProps> = {
  category: "quest",
  label: "Find by Text",
  description: "Text-guided search leading to looping multiple-choice identification",
  uses: ["MarkerSVG", "HintSystem", "OptionButton", "WaveDivider"],
};
