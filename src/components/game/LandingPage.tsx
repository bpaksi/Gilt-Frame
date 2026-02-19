"use client";

import GiltFrame from "./GiltFrame";

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
        <button
          onClick={onReplayEnd}
          style={{
            background: "transparent",
            border: "1px solid rgba(200, 165, 75, 0.3)",
            color: "rgba(200, 165, 75, 0.7)",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "14px",
            fontStyle: "italic",
            letterSpacing: "2px",
            padding: "12px 32px",
            cursor: "pointer",
            transition: "border-color 0.3s ease, color 0.3s ease",
            minHeight: "44px",
          }}
        >
          Return to The Journey
        </button>
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
