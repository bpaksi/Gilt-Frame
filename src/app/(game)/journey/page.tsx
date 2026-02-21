import type { Metadata } from "next";
import { resolveTrack } from "@/lib/track";
import { getMoments } from "@/lib/actions/moments";
import { gameConfig } from "@/config";
import JourneyTimeline from "@/components/game/JourneyTimeline";
import EmptyState from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Journey | The Order of the Gilt Frame",
};

export default async function JourneyPage() {
  const trackInfo = await resolveTrack();

  if (!trackInfo) {
    return (
      <EmptyState centered>
        Your journey has not yet begun.
      </EmptyState>
    );
  }

  const moments = await getMoments(trackInfo.track);

  const chapterNames: Record<string, string> = Object.fromEntries(
    Object.entries(gameConfig.chapters).map(([id, ch]) => [id, ch.name])
  );

  return <JourneyTimeline moments={moments} chapterNames={chapterNames} />;
}
