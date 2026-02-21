"use client";

import Link from "next/link";
import TextButton from "@/components/ui/TextButton";
import UppercaseLabel from "@/components/ui/UppercaseLabel";
import { useShareAction } from "@/lib/hooks/useShareAction";
import type { MomentRow } from "@/lib/actions/moments";
import { gameConfig } from "@/config";

interface MomentCardProps {
  moment: MomentRow;
}

export default function MomentCard({ moment }: MomentCardProps) {
  const chapter = moment.chapter_id
    ? gameConfig.chapters[moment.chapter_id]
    : null;

  const date = new Date(moment.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleShare = useShareAction(moment.share_token);

  return (
    <div
      style={{
        border: "1px solid rgba(200, 165, 75, 0.12)",
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
          {chapter?.name ?? "Unknown Chapter"}
        </UppercaseLabel>
        <p
          style={{
            color: "rgba(200, 165, 75, 0.3)",
            fontFamily: "Georgia, 'Times New Roman', serif",
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
            color: "rgba(200, 165, 75, 0.8)",
            fontFamily: "Georgia, 'Times New Roman', serif",
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
