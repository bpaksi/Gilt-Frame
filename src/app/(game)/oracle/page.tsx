import type { Metadata } from "next";
import { resolveTrack } from "@/lib/track";
import { createAdminClient } from "@/lib/supabase/admin";
import OracleView from "@/components/game/OracleView";

export const metadata: Metadata = {
  title: "The Oracle | The Order of the Gilt Frame",
};

export default async function OraclePage() {
  const trackInfo = await resolveTrack();

  if (!trackInfo) {
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
          The Oracle listens.
          <br />
          Ask when you are ready.
        </p>
      </div>
    );
  }

  const supabase = createAdminClient();

  // Get completed chapters
  const { data: completedProgress } = await supabase
    .from("chapter_progress")
    .select("chapter_id")
    .eq("track", trackInfo.track)
    .eq("status", "complete");

  const completedChapters = (completedProgress ?? []).map((p) => p.chapter_id);

  // Get lore entries
  const { data: loreData } = await supabase
    .from("lore_entries")
    .select("id, title, content, unlock_chapter_id")
    .order("order", { ascending: true });

  const loreEntries = (loreData ?? []).map((l) => ({
    ...l,
    unlocked: !l.unlock_chapter_id || completedChapters.includes(l.unlock_chapter_id),
  }));

  // Get today's conversations
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const { data: convData } = await supabase
    .from("oracle_conversations")
    .select("question, response")
    .eq("track", trackInfo.track)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: true });

  const conversations = (convData ?? []).map((c) => ({
    question: c.question,
    response: c.response,
  }));

  return (
    <OracleView
      loreEntries={loreEntries}
      completedChapters={completedChapters}
      conversations={conversations}
    />
  );
}
