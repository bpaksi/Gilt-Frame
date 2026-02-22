"use client";

import PageLayout from "./PageLayout";
import GhostButton from "@/components/ui/GhostButton";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface IntroPageProps {
  isReplay?: boolean;
  onComplete?: () => void;
}

export default function IntroPage({
  isReplay = false,
  onComplete,
}: IntroPageProps) {
  return (
    <PageLayout>
      {isReplay ? (
        <GhostButton onClick={onComplete} style={{ fontSize: "14px", padding: "12px 32px" }}>
          Return to Journey
        </GhostButton>
      ) : (
        <p
          style={{
            color: colors.gold,
            fontFamily,
            fontSize: "16px",
            fontStyle: "italic",
            letterSpacing: "1px",
          }}
        >
          You are not the one.
        </p>
      )}
    </PageLayout>
  );
}

export const showcase: ShowcaseDefinition<IntroPageProps> = {
  category: "game",
  label: "Intro Page",
  description: "Entry screen with marker ceremony and status message",
  uses: ["PageLayout", "GhostButton"],
  defaults: {},
  callbacks: { onComplete: "done" },
};
