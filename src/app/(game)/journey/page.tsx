import type { Metadata } from "next";
import { resolveTrack } from "@/lib/track";
import { getMoments } from "@/lib/actions/moments";
import { createAdminClient } from "@/lib/supabase/admin";
import { gameConfig } from "@/config";
import JourneyVault from "@/components/page/JourneyVault";
import type { VaultChapter } from "@/components/page/JourneyVault";
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

  // Fetch chapter progress to determine active/completed status
  const supabase = createAdminClient();
  const { data: progress } = await supabase
    .from("chapter_progress")
    .select("chapter_id, completed_at")
    .eq("track", trackInfo.track);

  // Build vault data: only include chapters that have progress (future ones hidden)
  const chapters: VaultChapter[] = [];
  for (const [id, ch] of Object.entries(gameConfig.chapters)) {
    const cp = progress?.find((p) => p.chapter_id === id);
    if (!cp) continue;
    chapters.push({
      id,
      name: ch.name,
      location: ch.location,
      seal: ch.seal,
      isCompleted: !!cp.completed_at,
      isActive: !cp.completed_at,
      moments: moments.filter((m) => m.chapter_id === id),
    });
  }

  if (chapters.length === 0) {
    return (
      <EmptyState centered>
        Your journey has not yet begun.
      </EmptyState>
    );
  }

  return <JourneyVault chapters={chapters} />;
}
