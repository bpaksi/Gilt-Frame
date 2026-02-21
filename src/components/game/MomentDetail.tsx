"use client";

import TextReveal from "./TextReveal";
import MarkerSVG from "@/components/ui/MarkerSVG";
import GhostButton from "@/components/ui/GhostButton";
import UppercaseLabel from "@/components/ui/UppercaseLabel";
import { colors, fontFamily } from "@/components/ui/tokens";
import { useShareAction } from "@/lib/hooks/useShareAction";
import type { ShowcaseDefinition } from "@/components/showcase";

type MomentLike = {
  id: string;
  chapter_id?: string | null;
  narrative_text?: string | null;
  share_token: string;
  created_at: string;
};

interface MomentDetailProps {
  moment: MomentLike;
  chapterName?: string;
}

export default function MomentDetail({ moment, chapterName }: MomentDetailProps) {
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
      {chapterName && (
        <UppercaseLabel style={{ color: colors.gold55 }}>
          {chapterName}
        </UppercaseLabel>
      )}

      {/* Date */}
      <p
        style={{
          color: colors.gold50,
          fontFamily,
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

export const showcase: ShowcaseDefinition<MomentDetailProps> = {
  category: "game",
  label: "Moment Detail",
  description: "Full narrative reveal for a journey moment with share action",
  uses: ["TextReveal", "GhostButton", "UppercaseLabel", "MarkerSVG"],
  defaults: {
    moment: {
      id: "demo-moment-1",
      chapter_id: "ch1",
      narrative_text: "You stood before the frame as the afternoon light caught its gilded edge. Something stirred within you. The Order had seen you arrive.",
      share_token: "demo-token",
      created_at: new Date().toISOString(),
    },
    chapterName: "The First Sight",
  },
};
