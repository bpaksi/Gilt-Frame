import { getAdminTrack } from "@/lib/admin/track";
import { createAdminClient } from "@/lib/supabase/admin";
import { chaptersConfig } from "@/config/chapters";
import SummonsManager from "@/components/admin/settings/SummonsManager";

export default async function SummonsSettingsPage() {
  const track = await getAdminTrack();
  const supabase = createAdminClient();

  const { data: progressRows } = await supabase
    .from("chapter_progress")
    .select("chapter_id")
    .eq("track", track);

  const activeChapterIds = new Set(
    (progressRows ?? []).map((r) => r.chapter_id)
  );

  const chapterStatuses = Object.entries(chaptersConfig.chapters).map(
    ([id, chapter]) => ({
      chapterId: id,
      name: chapter.name,
      hasProgress: activeChapterIds.has(id),
    })
  );

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "#6b7280",
          marginBottom: "12px",
        }}
      >
        Summons
      </div>
      <SummonsManager track={track} chapterStatuses={chapterStatuses} />
    </div>
  );
}
