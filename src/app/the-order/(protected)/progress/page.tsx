import { getAdminTrack } from "@/lib/admin/track";
import {
  getPlayerEvents,
  getAllChapterProgress,
  getAllMessageProgress,
} from "@/lib/admin/actions";
import { chaptersConfig } from "@/config/chapters";
import EventTimeline from "@/components/admin/EventTimeline";

export default async function AdminProgressPage() {
  const track = await getAdminTrack();
  const [events, chapterProgress, messageProgress] = await Promise.all([
    getPlayerEvents(track),
    getAllChapterProgress(track),
    getAllMessageProgress(track),
  ]);

  const completedIds = new Set(
    chapterProgress
      .filter((cp) => cp.status === "complete")
      .map((cp) => cp.chapter_id)
  );

  const chapterIds = Object.keys(chaptersConfig.chapters);
  const firstIncomplete = chapterIds.find((id) => !completedIds.has(id)) ?? chapterIds[0];

  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "#666666",
          marginBottom: "12px",
        }}
      >
        Activity Log
      </div>
      <EventTimeline
        events={events}
        initialChapter={firstIncomplete}
        chapterProgress={chapterProgress}
        messageProgress={messageProgress}
        track={track}
      />
    </div>
  );
}
