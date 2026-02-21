import type { Metadata } from "next";
import { resolveTrack } from "@/lib/track";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllLore } from "@/lib/lore";
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
