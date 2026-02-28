"use client";

import { useState } from "react";
import MomentCard from "./MomentCard";
import RevealNarrative from "@/components/game/quest/RevealNarrative";
import SealSVG from "@/components/ui/SealSVG";
import TextButton from "@/components/ui/TextButton";
import UppercaseLabel from "@/components/ui/UppercaseLabel";
import OrnateDivider from "@/components/ui/OrnateDivider";
import EmptyState from "@/components/ui/EmptyState";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { MomentRow } from "@/lib/actions/moments";
import type { SealConfig, StoryRevealConfig } from "@/config";

export type VaultChapter = {
  id: string;
  name: string;
  location: string | null;
  seal?: SealConfig;
  isCompleted: boolean;
  isActive: boolean;
  moments: MomentRow[];
};

interface JourneyVaultProps {
  chapters: VaultChapter[];
}

export default function JourneyVault({ chapters }: JourneyVaultProps) {
  // Start with the most recent (active or last completed) chapter expanded
  const activeIdx = chapters.findIndex((c) => c.isActive);
  const defaultOpen = activeIdx >= 0 ? activeIdx : chapters.length - 1;
  const [expandedIdx, setExpandedIdx] = useState<number | null>(defaultOpen);
  const [replayConfig, setReplayConfig] = useState<StoryRevealConfig | null>(null);

  if (chapters.length === 0) {
    return (
      <EmptyState centered>
        Your journey has not yet begun.
      </EmptyState>
    );
  }

  // ─── Full-screen ceremony replay ───────────────────────────
  if (replayConfig) {
    return (
      <RevealNarrative
        config={replayConfig}
        onAdvance={() => setReplayConfig(null)}
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "100%",
      }}
    >
      {/* ─── Page Title ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          padding: "32px 24px 8px",
        }}
      >
        <UppercaseLabel
          style={{
            color: colors.gold50,
            fontSize: "10px",
            letterSpacing: "4px",
          }}
        >
          The Vault
        </UppercaseLabel>

        {/* ─── Seal Navigation Strip ─────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            justifyContent: "center",
            padding: "8px 0",
          }}
        >
          {chapters.map((chapter, idx) => {
            const isExpanded = expandedIdx === idx;
            return (
              <button
                key={chapter.id}
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  opacity: isExpanded ? 1 : chapter.isCompleted ? 0.6 : 0.3,
                  transform: isExpanded ? "scale(1.15)" : "scale(1)",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
                aria-label={`${chapter.name}${chapter.isCompleted ? " (completed)" : chapter.isActive ? " (in progress)" : ""}`}
              >
                <SealSVG
                  chapterId={chapter.id}
                  size={36}
                  earned={chapter.isCompleted}
                />
                {/* Active indicator dot */}
                {chapter.isActive && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: colors.gold60,
                      animation: "pulse-soft 2s ease-in-out infinite",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <OrnateDivider />
      </div>

      {/* ─── Chapter Sections ─────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "0 0 32px",
        }}
      >
        {chapters.map((chapter, idx) => (
          <ChapterAccordion
            key={chapter.id}
            chapter={chapter}
            isExpanded={expandedIdx === idx}
            onToggle={() =>
              setExpandedIdx(expandedIdx === idx ? null : idx)
            }
            onReplaySeal={() => {
              if (chapter.seal) {
                setReplayConfig({
                  primary: `${chapter.name} has been sealed.`,
                  secondary: chapter.seal.description ?? "The vault remembers.",
                  chapter_name: chapter.name,
                  unlock_text: "Unseal",
                });
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Chapter Accordion ────────────────────────────────────────────────────────

function ChapterAccordion({
  chapter,
  isExpanded,
  onToggle,
  onReplaySeal,
}: {
  chapter: VaultChapter;
  isExpanded: boolean;
  onToggle: () => void;
  onReplaySeal: () => void;
}) {
  const momentCount = chapter.moments.length;

  return (
    <div
      style={{
        borderTop: `1px solid ${colors.gold08}`,
      }}
    >
      {/* ─── Chapter Header (always visible, tappable) ──────── */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: isExpanded ? colors.gold03 : "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "20px 24px",
          transition: "background 0.3s ease",
          textAlign: "left",
        }}
      >
        {/* Seal icon */}
        <div style={{ flexShrink: 0 }}>
          <SealSVG
            chapterId={chapter.id}
            size={44}
            earned={chapter.isCompleted}
          />
        </div>

        {/* Name + status */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            flex: 1,
            minWidth: 0,
          }}
        >
          <UppercaseLabel
            style={{
              color: chapter.isCompleted ? colors.gold70 : colors.gold50,
              fontSize: "12px",
              letterSpacing: "2px",
            }}
          >
            {chapter.name}
          </UppercaseLabel>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {chapter.location && (
              <span
                style={{
                  color: colors.gold30,
                  fontFamily,
                  fontSize: "11px",
                  fontStyle: "italic",
                }}
              >
                {chapter.location}
              </span>
            )}
            <span
              style={{
                color: chapter.isCompleted ? colors.gold40 : colors.gold25,
                fontFamily,
                fontSize: "11px",
              }}
            >
              {chapter.isCompleted
                ? `Sealed · ${momentCount} moment${momentCount !== 1 ? "s" : ""}`
                : chapter.isActive
                  ? `In progress · ${momentCount} moment${momentCount !== 1 ? "s" : ""}`
                  : "Awaiting"}
            </span>
          </div>
        </div>

        {/* Expand/collapse chevron */}
        <svg
          viewBox="0 0 16 16"
          width={14}
          height={14}
          style={{
            flexShrink: 0,
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          <path
            d="M3 6 L8 11 L13 6"
            stroke={colors.gold30}
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ─── Expanded Content ───────────────────────────────── */}
      {isExpanded && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1px",
            padding: "0 16px 16px",
          }}
        >
          {/* Moments */}
          {chapter.moments.length > 0 ? (
            chapter.moments.map((moment) => (
              <MomentCard
                key={moment.id}
                moment={moment}
                chapterName={chapter.name}
              />
            ))
          ) : (
            <p
              style={{
                color: colors.gold25,
                fontFamily,
                fontSize: "13px",
                fontStyle: "italic",
                textAlign: "center",
                padding: "20px 0",
                margin: 0,
              }}
            >
              No moments recorded yet.
            </p>
          )}

          {/* Earned seal celebration */}
          {chapter.isCompleted && chapter.seal && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                padding: "24px 16px 8px",
              }}
            >
              <div
                style={{
                  height: "1px",
                  width: "60%",
                  background: `linear-gradient(90deg, transparent, ${colors.gold12}, transparent)`,
                }}
              />
              <div
                style={{
                  position: "relative",
                  padding: "12px",
                }}
              >
                {/* Glow behind seal */}
                <div
                  style={{
                    position: "absolute",
                    inset: "-8px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${colors.gold15} 0%, transparent 70%)`,
                    animation: "pulse-soft 3s ease-in-out infinite",
                  }}
                />
                <SealSVG
                  chapterId={chapter.id}
                  size={64}
                  earned
                  colored
                />
              </div>
              <UppercaseLabel
                style={{
                  color: colors.gold55,
                  fontSize: "10px",
                  letterSpacing: "3px",
                }}
              >
                {chapter.seal.name}
              </UppercaseLabel>
              {chapter.seal.description && (
                <p
                  style={{
                    color: colors.gold35,
                    fontFamily,
                    fontSize: "12px",
                    fontStyle: "italic",
                    textAlign: "center",
                    margin: 0,
                    maxWidth: "240px",
                  }}
                >
                  {chapter.seal.description}
                </p>
              )}
              <TextButton
                onClick={onReplaySeal}
                style={{
                  fontSize: "11px",
                  letterSpacing: "2px",
                  marginTop: "4px",
                }}
              >
                Replay
              </TextButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
