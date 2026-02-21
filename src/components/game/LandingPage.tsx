"use client";

import GiltFrame from "./GiltFrame";
import GhostButton from "@/components/ui/GhostButton";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

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
            color: colors.gold35,
            fontFamily,
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

export const showcase: ShowcaseDefinition<LandingPageProps> = {
  category: "game",
  label: "Landing Page",
  description: "Entry screen with marker ceremony and status message",
  uses: ["GiltFrame", "GhostButton"],
  defaults: {},
};
