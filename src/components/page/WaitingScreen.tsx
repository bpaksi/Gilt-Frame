"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/game/ui/PageLayout";
import { colors, fontFamily } from "@/components/ui/tokens";
import type { ShowcaseDefinition } from "@/components/showcase";

interface WaitingScreenProps {
  message: string;
  pollInterval?: number; // ms — if set, refresh the page on this interval
}

export default function WaitingScreen({ message, pollInterval }: WaitingScreenProps) {
  const router = useRouter();

  useEffect(() => {
    if (!pollInterval) return;
    const id = setInterval(() => router.refresh(), pollInterval);
    return () => clearInterval(id);
  }, [pollInterval, router]);

  return (
    <PageLayout skipLabel="tap to skip">
      <p
        style={{
          color: colors.gold60,
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
