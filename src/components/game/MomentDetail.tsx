"use client";

import { useCallback } from "react";
import TextReveal from "./quest/TextReveal";
import MarkerSVG from "./MarkerSVG";
import type { MomentRow } from "@/lib/actions/moments";
import { chaptersConfig } from "@/config/chapters";

interface MomentDetailProps {
  moment: MomentRow;
}

export default function MomentDetail({ moment }: MomentDetailProps) {
  const chapter = moment.chapter_id
    ? chaptersConfig.chapters[moment.chapter_id]
    : null;

  const date = new Date(moment.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const lines = moment.narrative_text
    ? moment.narrative_text.split(/(?<=\.)\s+/).filter((l) => l.trim())
    : [];

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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
        padding: "40px 24px",
        minHeight: "100%",
        flex: 1,
      }}
    >
      {/* Chapter name */}
      {chapter && (
        <p
          style={{
            color: "rgba(200, 165, 75, 0.4)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "3px",
          }}
        >
          {chapter.name}
        </p>
      )}

      {/* Date */}
      <p
        style={{
          color: "rgba(200, 165, 75, 0.3)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "12px",
        }}
      >
        {date}
      </p>

      {/* Narrative */}
      {lines.length > 0 && <TextReveal lines={lines} delayBetween={500} />}

      {/* Share */}
      <button
        onClick={handleShare}
        style={{
          background: "none",
          border: "1px solid rgba(200, 165, 75, 0.2)",
          color: "rgba(200, 165, 75, 0.5)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "13px",
          fontStyle: "italic",
          letterSpacing: "1px",
          padding: "10px 24px",
          cursor: "pointer",
          minHeight: "44px",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        Share this moment
      </button>

      {/* Watermark */}
      <div style={{ opacity: 0.15, marginTop: "auto" }}>
        <MarkerSVG size={32} variant="gold" />
      </div>
    </div>
  );
}
