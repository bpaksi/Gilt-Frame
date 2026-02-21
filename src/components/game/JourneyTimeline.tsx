"use client";

import MomentCard from "./MomentCard";
import EmptyState from "@/components/ui/EmptyState";
import type { MomentRow } from "@/lib/actions/moments";

interface JourneyTimelineProps {
  moments: MomentRow[];
}

export default function JourneyTimeline({ moments }: JourneyTimelineProps) {
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
        <MomentCard key={moment.id} moment={moment} />
      ))}
    </div>
  );
}
