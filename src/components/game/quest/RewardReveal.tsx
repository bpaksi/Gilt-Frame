"use client";

import { useState, useEffect, useRef } from "react";
import type { RewardRevealConfig } from "@/config";

interface RewardRevealProps {
  config: RewardRevealConfig;
  onAdvance: () => void;
  chapterName?: string;
}

export default function RewardReveal({ config, onAdvance, chapterName }: RewardRevealProps) {
  const [showTitle, setShowTitle] = useState(false);
  const [showLines, setShowLines] = useState<boolean[]>([]);
  const [showSecondary, setShowSecondary] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Split primary text into sentences for multi-line reveal
  const primaryLines = config.primary
    .split(/(?<=\.)\s+/)
    .filter((l) => l.trim().length > 0);

  useEffect(() => {
    const timers = timersRef.current;
    timers.push(setTimeout(() => setShowTitle(true), 600));

    // Stagger primary lines at 1800, 3200, 5000ms
    const lineDelays = [1800, 3200, 5000];
    primaryLines.forEach((_, i) => {
      const delay = lineDelays[i] ?? lineDelays[lineDelays.length - 1] + (i - 2) * 1800;
      timers.push(
        setTimeout(() => {
          setShowLines((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, delay)
      );
    });

    const lastLineDelay = lineDelays[Math.min(primaryLines.length - 1, lineDelays.length - 1)] ?? 5000;

    if (config.secondary) {
      timers.push(setTimeout(() => setShowSecondary(true), lastLineDelay + 1500));
      timers.push(setTimeout(() => setShowContinue(true), lastLineDelay + 3000));
    } else {
      timers.push(setTimeout(() => setShowContinue(true), lastLineDelay + 2000));
    }

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        gap: "24px",
        zIndex: 40,
      }}
    >
      {/* Ambient drift particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "2px",
            height: "2px",
            borderRadius: "50%",
            background: "rgba(200, 165, 75, 0.3)",
            left: `${15 + i * 13}%`,
            top: `${20 + (i % 3) * 25}%`,
            animation: `drift ${5 + i * 1.2}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}
        />
      ))}

      {/* Chapter title */}
      {chapterName && (
        <p
          style={{
            opacity: showTitle ? 1 : 0,
            transform: showTitle ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            color: "rgba(200, 165, 75, 0.5)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "14px",
            textTransform: "uppercase",
            letterSpacing: "3px",
            textAlign: "center",
          }}
        >
          {chapterName}
        </p>
      )}

      {/* Primary text lines */}
      {primaryLines.map((line, i) => (
        <p
          key={`${i}-${line}`}
          style={{
            opacity: showLines[i] ? 1 : 0,
            transform: showLines[i] ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            color: "rgba(200, 165, 75, 0.9)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "18px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.8,
            maxWidth: "340px",
          }}
        >
          {line}
        </p>
      ))}

      {/* Secondary text */}
      {config.secondary && (
        <p
          style={{
            opacity: showSecondary ? 0.5 : 0,
            transform: showSecondary ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            color: "rgba(200, 165, 75, 0.5)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "14px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.8,
            maxWidth: "300px",
          }}
        >
          {config.secondary}
        </p>
      )}

      {/* Continue button */}
      <button
        onClick={onAdvance}
        style={{
          opacity: showContinue ? 1 : 0,
          transition: "opacity 0.8s ease",
          background: "none",
          border: "1px solid rgba(200, 165, 75, 0.3)",
          color: "rgba(200, 165, 75, 0.7)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "14px",
          fontStyle: "italic",
          letterSpacing: "2px",
          padding: "12px 28px",
          marginTop: "16px",
          cursor: showContinue ? "pointer" : "default",
          minHeight: "44px",
          minWidth: "44px",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        Continue
      </button>
    </div>
  );
}
