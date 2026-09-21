"use client";

import Link from "next/link";
import UppercaseLabel from "@/components/ui/UppercaseLabel";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { MomentMetadata, QAReplay } from "@/config";
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

interface MomentCardProps {
  moment: MomentLike;
  chapterName?: string;
}

// ─── Type-specific label + badge ─────────────────────────────────────────────

function getMomentLabel(type?: string): string {
  switch (type) {
    case "passphrase":
      return "Passphrase";
    case "narrative_revealed":
      return "Narrative";
    case "gps_arrival":
      return "Arrival";
    case "bearing_aligned":
      return "Bearing";
    case "questions_answered":
      return "Questions";
    case "find_confirmed":
      return "Discovery";
    case "chapter_complete":
      return "Sealed";
    case "chapter_start":
      return "Begun";
    default:
      return "Moment";
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function getQAScore(questions?: QAReplay[]): string | null {
  if (!questions || questions.length === 0) return null;
  const correct = questions.filter((q) => q.correct).length;
  return `${correct}/${questions.length}`;
}

function MomentBadge({ metadata }: { metadata?: MomentMetadata | null }) {
  if (!metadata) return null;

  let text: string | null = null;

  switch (metadata.type) {
    case "gps_arrival":
      text =
        metadata.duration_seconds > 0
          ? formatDuration(metadata.duration_seconds)
          : null;
      break;
    case "bearing_aligned":
      text = `${metadata.target_bearing}°`;
      break;
    case "questions_answered":
      text = getQAScore(metadata.questions);
      break;
    case "find_confirmed":
      text = metadata.question.correct ? "Found" : null;
      break;
    default:
      return null;
  }

  if (!text) return null;

  return (
    <span
      style={{
        color: colors.gold50,
        fontFamily,
        fontSize: "11px",
        fontStyle: "normal",
        border: `1px solid ${colors.gold12}`,
        padding: "2px 8px",
        borderRadius: "2px",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

// ─── MomentCard ──────────────────────────────────────────────────────────────

export default function MomentCard({ moment }: MomentCardProps) {
  const date = new Date(moment.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const typeLabel = getMomentLabel(moment.moment_type);
  const metadata = moment.metadata as MomentMetadata | null;

  return (
    <div
      style={{
        border: `1px solid ${colors.gold12}`,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Header row: type label + badge | date */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UppercaseLabel
            style={{
              letterSpacing: "2px",
              fontSize: "10px",
              color: colors.gold45,
            }}
          >
            {typeLabel}
          </UppercaseLabel>
          <MomentBadge metadata={metadata} />
        </div>
        <p
          style={{
            color: colors.gold35,
            fontFamily,
            fontSize: "11px",
            margin: 0,
          }}
        >
          {date}
        </p>
      </div>

      {/* Narrative text preview */}
      {moment.narrative_text && (
        <Link
          href={`/journey/${moment.id}`}
          style={{
            color: colors.gold80,
            fontFamily,
            fontSize: "15px",
            fontStyle: "italic",
            lineHeight: 1.7,
            textDecoration: "none",
          }}
        >
          {moment.narrative_text.length > 120
            ? moment.narrative_text.slice(0, 120) + "..."
            : moment.narrative_text}
        </Link>
      )}

    </div>
  );
}

export const showcase: ShowcaseDefinition<MomentCardProps> = {
  category: "game",
  label: "Moment Card",
  description:
    "Journey timeline entry with type badge, date, narrative preview and share action",
  uses: ["UppercaseLabel", "TextButton"],
  defaults: {
    moment: {
      id: "demo-moment-1",
      chapter_id: "ch1",
      narrative_text:
        "You stood before the frame as the afternoon light caught its gilded edge. Something stirred within you.",
      moment_type: "narrative_revealed",
      metadata: {
        type: "narrative_revealed",
        primary:
          "You stood before the frame as the afternoon light caught its gilded edge.",
        secondary: null,
        chapter_name: "The First Sight",
      },
      share_token: "demo-token",
      created_at: new Date().toISOString(),
    },
    chapterName: "The First Sight",
  },
};
