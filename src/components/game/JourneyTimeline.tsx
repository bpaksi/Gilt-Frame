"use client";

import MomentCard from "./MomentCard";
import type { MomentRow } from "@/lib/actions/moments";

interface JourneyTimelineProps {
  moments: MomentRow[];
}

export default function JourneyTimeline({ moments }: JourneyTimelineProps) {
  if (moments.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          flex: 1,
          padding: "40px 24px",
        }}
      >
        <p
          style={{
            color: "rgba(200, 165, 75, 0.5)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "16px",
            fontStyle: "italic",
            textAlign: "center",
            letterSpacing: "1px",
            lineHeight: 1.8,
          }}
        >
          Your journey has not yet begun.
        </p>
      </div>
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
