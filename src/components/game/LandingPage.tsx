"use client";

import GiltFrame from "./GiltFrame";
import GhostButton from "@/components/ui/GhostButton";

interface LandingPageProps {
  isReplay?: boolean;
  onReplayEnd?: () => void;
}

export default function LandingPage({
  isReplay = false,
  onReplayEnd,
}: LandingPageProps) {
  return (
    <GiltFrame>
      {isReplay ? (
        <GhostButton onClick={onReplayEnd} style={{ fontSize: "14px", padding: "12px 32px" }}>
          Return to Journey
        </GhostButton>
      ) : (
        <p
          style={{
            color: "rgba(200, 165, 75, 0.35)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "16px",
            fontStyle: "italic",
            letterSpacing: "1px",
          }}
        >
          You are not the one.
        </p>
      )}
    </GiltFrame>
  );
}
