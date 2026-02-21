"use client";

import MomentCard from "./MomentCard";
import EmptyState from "@/components/ui/EmptyState";
import type { ShowcaseDefinition } from "@/components/showcase";

type MomentLike = {
  id: string;
  chapter_id?: string | null;
  narrative_text?: string | null;
  share_token: string;
  created_at: string;
};

interface JourneyTimelineProps {
  moments: MomentLike[];
  chapterNames?: Record<string, string>;
}

export default function JourneyTimeline({ moments, chapterNames }: JourneyTimelineProps) {
  if (moments.length === 0) {
    return (
      <EmptyState centered>
        Your journey has not yet begun.
      </EmptyState>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1px",
        padding: "16px",
        flex: 1,
      }}
    >
      {moments.map((moment) => (
        <MomentCard
          key={moment.id}
          moment={moment}
          chapterName={chapterNames?.[moment.chapter_id ?? ""]}
        />
      ))}
    </div>
  );
}

export const showcase: ShowcaseDefinition<JourneyTimelineProps> = {
  category: "game",
  label: "Journey Timeline",
  description: "Scrollable list of captured journey moments",
  uses: ["MomentCard", "EmptyState"],
  defaults: {
    moments: [
      {
        id: "demo-1",
        chapter_id: "ch1",
        narrative_text: "You stood before the frame as the afternoon light caught its gilded edge.",
        share_token: "demo-token-1",
        created_at: new Date().toISOString(),
      },
    ],
    chapterNames: { ch1: "The First Sight" },
  },
};
