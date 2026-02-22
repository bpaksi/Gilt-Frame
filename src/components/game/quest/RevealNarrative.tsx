"use client";

import { useState, useEffect, useRef } from "react";
import AmbientParticles from "@/components/ui/AmbientParticles";
import GhostButton from "@/components/ui/GhostButton";
import UppercaseLabel from "@/components/ui/UppercaseLabel";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { StoryRevealConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";
import UnlockAnimation from "../UnlockAnimation";

interface RevealNarrativeProps {
  config: StoryRevealConfig;
  onAdvance: () => void;
  chapterName?: string;
}

export default function RevealNarrative({ config, onAdvance, chapterName }: RevealNarrativeProps) {
  const [phase, setPhase] = useState<"ceremony" | "text">(
    config.skip_ceremony ? "text" : "ceremony"
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 40,
      }}
    >
      <AmbientParticles opacity={0.3} />

      {phase === "ceremony" ? (
        <UnlockAnimation
          supernova
          onComplete={() => setPhase("text")}
          unlockText={config.unlock_text}
        />
      ) : (
        <TextPhase config={config} onAdvance={onAdvance} chapterName={chapterName} continueText={config.continue_text} />
      )}
    </div>
  );
}

export const showcase: ShowcaseDefinition<RevealNarrativeProps> = {
  category: "quest",
  label: "Reveal Narrative",
  description: "Ceremony animation with story text reveal and continue button",
  uses: ["AmbientParticles", "GhostButton", "UppercaseLabel", "UnlockAnimation"],
  defaults: {
    config: {
      primary: "You have uncovered the first thread. The mystery deepens.",
      secondary: "The Order watches. The Sparrow rises.",
      skip_ceremony: true,
    },
    onAdvance: () => {},
  },
};

/* ─── Text Phase ──────────────────────────────────────────────────────────── */

function TextPhase({
  config,
  onAdvance,
  chapterName,
  continueText = "Continue",
}: {
  config: StoryRevealConfig;
  onAdvance: () => void;
  chapterName?: string;
  continueText?: string;
}) {
  const [showTitle, setShowTitle] = useState(false);
  const [showLines, setShowLines] = useState<boolean[]>([]);
  const [showSecondary, setShowSecondary] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const primaryLines = config.primary
    .split(/(?<=\.)\s+/)
    .filter((l) => l.trim().length > 0);

  useEffect(() => {
    const timers = timersRef.current;
    timers.push(setTimeout(() => setShowTitle(true), 600));

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "15vh",
        padding: "15vh 24px 40px",
        gap: "12px",
        opacity: 0,
        animation: "fade-in 0.8s ease forwards",
        width: "100%",
      }}
    >
      {/* Particle field */}
      {Array.from({ length: 14 }).map((_, i) => {
        const variant = i % 3;
        const xDrift = 30 + (i % 5) * 12;
        const yDrift = 25 + (i % 4) * 10;
        return (
          <div
            key={`tp-${i}`}
            style={{
              position: "absolute",
              width: variant === 0 ? "3px" : "2px",
              height: variant === 0 ? "3px" : "2px",
              borderRadius: "50%",
              background: [colors.gold15, colors.gold20, colors.gold25, colors.gold30][i % 4],
              left: `${8 + ((i * 17 + 5) % 84)}%`,
              top: `${6 + ((i * 23 + 11) % 82)}%`,
              animation: `rewardDrift-${i % 4} ${6 + (i % 5) * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
              willChange: "transform, opacity",
              ["--xd" as string]: `${i % 2 === 0 ? xDrift : -xDrift}px`,
              ["--yd" as string]: `${i % 3 === 0 ? -yDrift : yDrift}px`,
            }}
          />
        );
      })}

      <style>{`
        @keyframes rewardDrift-0 {
          0%   { opacity: 0.1; transform: translate(0, 0); }
          25%  { opacity: 0.35; transform: translate(35px, -20px); }
          50%  { opacity: 0.15; transform: translate(-15px, -45px); }
          75%  { opacity: 0.3; transform: translate(20px, -25px); }
          100% { opacity: 0.1; transform: translate(0, 0); }
        }
        @keyframes rewardDrift-1 {
          0%   { opacity: 0.15; transform: translate(0, 0); }
          25%  { opacity: 0.3; transform: translate(-30px, -30px); }
          50%  { opacity: 0.1; transform: translate(-50px, 10px); }
          75%  { opacity: 0.35; transform: translate(-20px, -40px); }
          100% { opacity: 0.15; transform: translate(0, 0); }
        }
        @keyframes rewardDrift-2 {
          0%   { opacity: 0.1; transform: translate(0, 0); }
          25%  { opacity: 0.25; transform: translate(25px, 30px); }
          50%  { opacity: 0.35; transform: translate(45px, -15px); }
          75%  { opacity: 0.15; transform: translate(10px, 20px); }
          100% { opacity: 0.1; transform: translate(0, 0); }
        }
        @keyframes rewardDrift-3 {
          0%   { opacity: 0.15; transform: translate(0, 0); }
          25%  { opacity: 0.2; transform: translate(-40px, 20px); }
          50%  { opacity: 0.3; transform: translate(10px, 40px); }
          75%  { opacity: 0.25; transform: translate(-25px, -15px); }
          100% { opacity: 0.15; transform: translate(0, 0); }
        }
      `}</style>

      {/* Chapter title */}
      {chapterName && (
        <UppercaseLabel
          style={{
            opacity: showTitle ? 1 : 0,
            transform: showTitle ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            fontSize: "14px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          {chapterName}
        </UppercaseLabel>
      )}

      {/* Primary text lines */}
      {primaryLines.map((line, i) => (
        <p
          key={`${i}-${line}`}
          style={{
            opacity: showLines[i] ? 1 : 0,
            transform: showLines[i] ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            color: colors.gold90,
            fontFamily: fontFamily,
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

      {/* Continue button */}
      <GhostButton
        onClick={onAdvance}
        disabled={!showContinue}
        style={{
          opacity: showContinue ? 1 : 0,
          transition: "opacity 0.8s ease",
          fontSize: "14px",
          padding: "12px 28px",
          marginTop: "24px",
          minWidth: "44px",
        }}
      >
        {continueText}
      </GhostButton>

      {/* Secondary text — below continue */}
      {config.secondary && (
        <p
          style={{
            opacity: showSecondary ? 0.7 : 0,
            transform: showSecondary ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            color: colors.gold70,
            fontFamily: fontFamily,
            fontSize: "14px",
            fontStyle: "italic",
            textAlign: "center",
            lineHeight: 1.8,
            maxWidth: "300px",
            marginTop: "16px",
          }}
        >
          {config.secondary}
        </p>
      )}
    </div>
  );
}
