"use client";

import Link from "next/link";
import { useCallback } from "react";
import type { MomentRow } from "@/lib/actions/moments";
import { gameConfig } from "@/config/chapters";

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

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/moment/${moment.share_token}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "A Moment from the Order", url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [moment.share_token]);

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
        <p
          style={{
            color: "rgba(200, 165, 75, 0.5)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          {chapter?.name ?? "Unknown Chapter"}
        </p>
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

      <button
        onClick={handleShare}
        style={{
          alignSelf: "flex-end",
          background: "none",
          border: "none",
          color: "rgba(200, 165, 75, 0.4)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "12px",
          fontStyle: "italic",
          letterSpacing: "1px",
          cursor: "pointer",
          padding: "8px 0",
          minHeight: "44px",
          display: "flex",
          alignItems: "center",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        Share
      </button>
    </div>
  );
}
