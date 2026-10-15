"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RevealLines from "@/components/game/ui/RevealLines";
import RevealNarrative from "@/components/game/quest/RevealNarrative";
import SealSVG from "@/components/ui/SealSVG";
import ReplayQuestions from "./ReplayQuestions";
import MarkerSVG from "@/components/ui/MarkerSVG";
import GhostButton from "@/components/ui/GhostButton";
import TextButton from "@/components/ui/TextButton";
import UppercaseLabel from "@/components/ui/UppercaseLabel";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { MomentMetadata, StoryRevealConfig } from "@/config";
import type { ShowcaseDefinition } from "@/components/showcase";

type MomentLike = {
  id: string;
  chapter_id?: string | null;
  narrative_text?: string | null;
  moment_type?: string;
  metadata?: MomentMetadata | null;
  share_token: string;
  created_at: string;
};

interface MomentDetailProps {
  moment: MomentLike;
  chapterName?: string;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`;
}

// ─── Build a StoryRevealConfig from moment metadata for replay ──────────────

function buildReplayConfig(metadata: MomentMetadata, chapterName?: string): StoryRevealConfig | null {
  if (metadata.type === "narrative_revealed") {
    return {
      primary: metadata.primary,
      secondary: metadata.secondary ?? null,
      chapter_name: metadata.chapter_name ?? chapterName,
      unlock_text: "Replay",
    };
  }
  if (metadata.type === "chapter_complete") {
    return {
      primary: `${metadata.chapter_name} has been sealed.`,
      secondary: "The vault remembers.",
      chapter_name: metadata.chapter_name,
      unlock_text: "Unseal",
    };
  }
  return null;
}

// ─── Can this moment be replayed as a full ceremony? ────────────────────────

function isReplayable(metadata?: MomentMetadata | null): boolean {
  if (!metadata) return false;
  return metadata.type === "narrative_revealed" || metadata.type === "chapter_complete";
}

// ─── Metadata-Driven Replay Panels ───────────────────────────────────────────

function MetadataPanel({ metadata }: { metadata: MomentMetadata }) {
  switch (metadata.type) {
    case "narrative_revealed":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            width: "100%",
          }}
        >
          <RevealLines
            lines={metadata.primary.split(/(?<=\.)\s+/).filter((l) => l.trim())}
            delayBetween={500}
          />
          {metadata.secondary && (
            <p
              style={{
                color: colors.gold50,
                fontFamily,
                fontSize: "14px",
                fontStyle: "italic",
                textAlign: "center",
                opacity: 0,
                animation: "fade-in 0.8s ease forwards",
                animationDelay: `${
                  metadata.primary.split(/(?<=\.)\s+/).length * 0.5 + 0.5
                }s`,
              }}
            >
              {metadata.secondary}
            </p>
          )}
        </div>
      );

    case "gps_arrival":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            width: "100%",
          }}
        >
          {metadata.duration_seconds > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <UppercaseLabel style={{ fontSize: "10px", color: colors.gold40 }}>
                Duration
              </UppercaseLabel>
              <p style={{ color: colors.gold70, fontFamily, fontSize: "16px", margin: 0 }}>
                {formatDuration(metadata.duration_seconds)}
              </p>
            </div>
          )}
          {metadata.questions && metadata.questions.length > 0 && (
            <ReplayQuestions questions={metadata.questions} />
          )}
        </div>
      );

    case "bearing_aligned":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <p
            style={{
              color: colors.gold80,
              fontFamily,
              fontSize: "32px",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            {metadata.target_bearing}°
          </p>
          <UppercaseLabel style={{ fontSize: "10px", color: colors.gold40 }}>
            Bearing Aligned
          </UppercaseLabel>
          {metadata.duration_seconds > 0 && (
            <p style={{ color: colors.gold50, fontFamily, fontSize: "13px", margin: 0 }}>
              {formatDuration(metadata.duration_seconds)}
            </p>
          )}
        </div>
      );

    case "questions_answered":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            width: "100%",
          }}
        >
          {metadata.duration_seconds > 0 && (
            <p style={{ color: colors.gold50, fontFamily, fontSize: "13px", margin: 0 }}>
              Completed in {formatDuration(metadata.duration_seconds)}
            </p>
          )}
          <ReplayQuestions questions={metadata.questions} />
        </div>
      );

    case "find_confirmed":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            width: "100%",
          }}
        >
          <p
            style={{
              color: colors.gold60,
              fontFamily,
              fontSize: "14px",
              fontStyle: "italic",
              textAlign: "center",
              lineHeight: 1.7,
              maxWidth: "340px",
              whiteSpace: "pre-line",
              margin: 0,
            }}
          >
            {metadata.guidance_text}
          </p>
          <ReplayQuestions questions={[metadata.question]} />
          {metadata.duration_seconds > 0 && (
            <p style={{ color: colors.gold40, fontFamily, fontSize: "12px", margin: 0 }}>
              {formatDuration(metadata.duration_seconds)}
            </p>
          )}
        </div>
      );

    case "passphrase":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {metadata.hints_used.length > 0 && (
            <p style={{ color: colors.gold40, fontFamily, fontSize: "13px", margin: 0 }}>
              {metadata.hints_used.length} hint{metadata.hints_used.length !== 1 ? "s" : ""} used
            </p>
          )}
        </div>
      );

    case "chapter_complete":
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <SealSVG chapterId={metadata.chapter_name ?? ""} size={64} earned colored />
          <UppercaseLabel style={{ color: colors.gold60, letterSpacing: "3px" }}>
            Chapter Sealed
          </UppercaseLabel>
        </div>
      );

    default:
      return null;
  }
}

// ─── MomentDetail ────────────────────────────────────────────────────────────

export default function MomentDetail({ moment, chapterName }: MomentDetailProps) {
  const router = useRouter();
  const [replaying, setReplaying] = useState(false);

  const date = new Date(moment.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const metadata = moment.metadata as MomentMetadata | null;
  const hasMetadata = metadata && metadata.type;

  // For narrative_revealed, use metadata for the full replay instead of narrative_text
  const useNarrativeText = !hasMetadata || metadata.type !== "narrative_revealed";
  const lines =
    useNarrativeText && moment.narrative_text
      ? moment.narrative_text.split(/(?<=\.)\s+/).filter((l) => l.trim())
      : [];

  const canReplay = isReplayable(metadata);
  const replayConfig = hasMetadata ? buildReplayConfig(metadata, chapterName) : null;

  // ─── Full-screen ceremony replay ─────────────────────────────
  if (replaying && replayConfig) {
    return (
      <RevealNarrative
        config={replayConfig}
        onAdvance={() => setReplaying(false)}
      />
    );
  }

  // ─── Normal detail view ──────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
        padding: "40px 24px",
        minHeight: "100%",
        flex: 1,
      }}
    >
      {/* Back to Journey */}
      <div
        style={{
          alignSelf: "flex-start",
          marginBottom: "-16px",
        }}
      >
        <TextButton
          onClick={() => router.push("/journey")}
          style={{
            fontSize: "12px",
            letterSpacing: "1px",
          }}
        >
          ← Journey
        </TextButton>
      </div>

      {/* Chapter name */}
      {chapterName && (
        <UppercaseLabel style={{ color: colors.gold55 }}>
          {chapterName}
        </UppercaseLabel>
      )}

      {/* Date */}
      <p
        style={{
          color: colors.gold60,
          fontFamily,
          fontSize: "12px",
          margin: 0,
        }}
      >
        {date}
      </p>

      {/* Metadata-driven replay panel */}
      {hasMetadata && <MetadataPanel metadata={metadata} />}

      {/* Fallback: plain narrative text */}
      {useNarrativeText && lines.length > 0 && (
        <RevealLines lines={lines} delayBetween={500} />
      )}

      {/* Replay button */}
      {canReplay && (
        <GhostButton
          onClick={() => setReplaying(true)}
          style={{ fontSize: "13px", letterSpacing: "1px", padding: "10px 24px" }}
        >
          Replay
        </GhostButton>
      )}

      {/* Watermark */}
      <div style={{ opacity: 0.15, marginTop: "auto" }}>
        <MarkerSVG size={32} variant="gold" />
      </div>
    </div>
  );
}

export const showcase: ShowcaseDefinition<MomentDetailProps> = {
  category: "game",
  label: "Moment Detail",
  description: "Full narrative reveal for a journey moment with metadata replay and share action",
  uses: ["RevealLines", "ReplayQuestions", "GhostButton", "UppercaseLabel", "MarkerSVG"],
  defaults: {
    moment: {
      id: "demo-moment-1",
      chapter_id: "ch1",
      narrative_text: "You stood before the frame as the afternoon light caught its gilded edge. Something stirred within you. The Order had seen you arrive.",
      moment_type: "narrative_revealed",
      metadata: {
        type: "narrative_revealed",
        primary: "You stood before the frame as the afternoon light caught its gilded edge. Something stirred within you. The Order had seen you arrive.",
        secondary: "Your first fragment has been placed in the vault.",
        chapter_name: "The First Sight",
      },
      share_token: "demo-token",
      created_at: new Date().toISOString(),
    },
    chapterName: "The First Sight",
  },
};
