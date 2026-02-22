"use client";

import PageLayout from "./PageLayout";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface WaitingScreenProps {
  message: string;
}

export default function WaitingScreen({ message }: WaitingScreenProps) {
  return (
    <PageLayout>
      <p
        style={{
          color: colors.gold50,
          fontFamily,
          fontSize: "16px",
          fontStyle: "italic",
          textAlign: "center",
          letterSpacing: "1px",
          lineHeight: "1.8",
          maxWidth: "280px",
          whiteSpace: "pre-line",
        }}
      >
        {message}
      </p>
    </PageLayout>
  );
}

export const showcase: ShowcaseDefinition<WaitingScreenProps> = {
  category: "game",
  label: "Waiting Screen",
  description: "Full-page waiting screen with marker animation",
  uses: ["PageLayout"],
  defaults: {
    message: "The Order will contact you\nwhen ready.",
  },
};
