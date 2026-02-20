"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import MarkerSVG from "../MarkerSVG";
import HintSystem from "./HintSystem";
import type { GuidedIdentificationConfig } from "@/config";

interface GuidedIdentificationProps {
  config: GuidedIdentificationConfig;
  onAdvance: () => void;
  chapterId?: string;
  stepIndex?: number;
  revealedHintTiers?: number[];
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

export default function GuidedIdentification({
  config,
  onAdvance,
  chapterId,
  stepIndex,
  revealedHintTiers,
}: GuidedIdentificationProps) {
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
  const [lineVisibility, setLineVisibility] = useState<boolean[]>([]);
  const [markerVisible, setMarkerVisible] = useState(false);
  const [instructionVisible, setInstructionVisible] = useState(false);
  const [tapReady, setTapReady] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Stagger title lines on mount and on return from identification
  useEffect(() => {
    if (phase !== "guidance") return;

    const timers = timersRef.current;

    guidanceLines.forEach((_line: string, i: number) => {
      const t = setTimeout(() => {
        setLineVisibility((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 500 + 400);
      timers.push(t);
    });

    const lastLineDelay = (guidanceLines.length - 1) * 500 + 400 + 800;
    const markerDelay = lastLineDelay + 1000;
    timers.push(setTimeout(() => setMarkerVisible(true), markerDelay));
    timers.push(setTimeout(() => setInstructionVisible(true), markerDelay + 800));
    timers.push(setTimeout(() => setTapReady(true), markerDelay + 1200));

    return () => {
      timers.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [phase, guidanceLines]);

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
      setLineVisibility([]);
      setMarkerVisible(false);
      setInstructionVisible(false);
      setTapReady(false);
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
            <svg
              width="120"
              height="10"
              viewBox="0 0 120 10"
              fill="none"
              style={{ opacity: instructionVisible ? 0.3 : 0, transition: "opacity 0.4s ease", margin: "-8px 0" }}
            >
              <path
                d="M0 5 Q15 1 30 5 Q45 9 60 5 Q75 1 90 5 Q105 9 120 5"
                stroke="rgba(200, 165, 75, 1)"
                strokeWidth="1"
                fill="none"
              />
            </svg>
            <HintSystem
              hints={hints}
              chapterId={chapterId}
              stepIndex={stepIndex}
              initialRevealedTiers={revealedHintTiers}
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
              disabled={locked}
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                color: textColor,
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "15px",
                fontStyle: "italic",
                padding: "14px 20px",
                textAlign: "left",
                cursor: locked ? "default" : "pointer",
                transition:
                  "background 0.3s ease, border-color 0.3s ease, color 0.3s ease, opacity 0.3s ease",
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
    </div>
  );
}
