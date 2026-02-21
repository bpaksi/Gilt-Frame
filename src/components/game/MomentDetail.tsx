"use client";

import TextReveal from "./quest/TextReveal";
import MarkerSVG from "./MarkerSVG";
import GhostButton from "@/components/ui/GhostButton";
import UppercaseLabel from "@/components/ui/UppercaseLabel";
import { colors } from "@/components/ui/tokens";
import { useShareAction } from "@/lib/hooks/useShareAction";
import type { MomentRow } from "@/lib/actions/moments";
import { gameConfig } from "@/config";

interface MomentDetailProps {
  moment: MomentRow;
}

export default function MomentDetail({ moment }: MomentDetailProps) {
  const chapter = moment.chapter_id
    ? gameConfig.chapters[moment.chapter_id]
    : null;

  const date = new Date(moment.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const lines = moment.narrative_text
    ? moment.narrative_text.split(/(?<=\.)\s+/).filter((l) => l.trim())
    : [];

  const handleShare = useShareAction(moment.share_token);

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
        <UppercaseLabel style={{ color: colors.gold40 }}>
          {chapter.name}
        </UppercaseLabel>
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
      <GhostButton
        onClick={handleShare}
        style={{ fontSize: "13px", letterSpacing: "1px", padding: "10px 24px" }}
      >
        Share this moment
      </GhostButton>

      {/* Watermark */}
      <div style={{ opacity: 0.15, marginTop: "auto" }}>
        <MarkerSVG size={32} variant="gold" />
      </div>
    </div>
  );
}
