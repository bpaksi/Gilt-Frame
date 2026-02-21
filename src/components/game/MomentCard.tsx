"use client";

import Link from "next/link";
import TextButton from "@/components/ui/TextButton";
import UppercaseLabel from "@/components/ui/UppercaseLabel";
import { useShareAction } from "@/lib/hooks/useShareAction";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

type MomentLike = {
  id: string;
  chapter_id?: string | null;
  narrative_text?: string | null;
  share_token: string;
  created_at: string;
};

interface MomentCardProps {
  moment: MomentLike;
  chapterName?: string;
}

export default function MomentCard({ moment, chapterName }: MomentCardProps) {
  const date = new Date(moment.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleShare = useShareAction(moment.share_token);

  return (
    <div
      style={{
        border: `1px solid ${colors.gold12}`,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <UppercaseLabel style={{ letterSpacing: "2px" }}>
          {chapterName ?? "Unknown Chapter"}
        </UppercaseLabel>
        <p
          style={{
            color: colors.gold50,
            fontFamily,
            fontSize: "11px",
          }}
        >
          {date}
        </p>
      </div>

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

      <TextButton
        onClick={handleShare}
        style={{ alignSelf: "flex-end", fontSize: "12px", letterSpacing: "1px" }}
      >
        Share
      </TextButton>
    </div>
  );
}

export const showcase: ShowcaseDefinition<MomentCardProps> = {
  category: "game",
  label: "Moment Card",
  description: "Journey timeline entry with chapter, date, narrative preview and share action",
  uses: ["UppercaseLabel", "TextButton"],
  defaults: {
    moment: {
      id: "demo-moment-1",
      chapter_id: "ch1",
      narrative_text: "You stood before the frame as the afternoon light caught its gilded edge. Something stirred within you.",
      share_token: "demo-token",
      created_at: new Date().toISOString(),
    },
    chapterName: "The First Sight",
  },
};
