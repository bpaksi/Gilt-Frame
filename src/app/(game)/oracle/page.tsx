import type { Metadata } from "next";
import { resolveTrack } from "@/lib/track";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllLore } from "@/lib/lore";
import OracleView from "@/components/game/OracleView";
import EmptyState from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "The Oracle | The Order of the Gilt Frame",
};

export default async function OraclePage() {
  const trackInfo = await resolveTrack();

  if (!trackInfo) {
    return (
      <EmptyState centered>
        The Oracle listens.
        <br />
        Ask when you are ready.
      </EmptyState>
    );
  }

  const supabase = createAdminClient();

  // Get completed chapters
  const { data: completedProgress } = await supabase
    .from("chapter_progress")
    .select("chapter_id")
    .eq("track", trackInfo.track)
    .not("completed_at", "is", null);

  const completedChapters = (completedProgress ?? []).map((p) => p.chapter_id);

  // Get lore entries
  const loreEntries = getAllLore().map((l) => ({
    ...l,
    unlocked: !l.unlock_chapter_id || completedChapters.includes(l.unlock_chapter_id),
  }));

  // Get conversations for history
  const { data: convData } = await supabase
    .from("oracle_conversations")
    .select("question, response, created_at")
    .eq("track", trackInfo.track)
    .order("created_at", { ascending: true })
    .limit(50);

  const conversations = (convData ?? []).map((c) => ({
    question: c.question,
    response: c.response,
    created_at: c.created_at,
  }));

  return (
    <OracleView
      loreEntries={loreEntries}
      conversations={conversations}
    />
  );
}
