import { getAdminTrack } from "@/lib/admin/track";
import {
  getPlayerEvents,
  getAllChapterProgress,
  getAllMessageProgress,
  getCompletedStepCounts,
} from "@/lib/admin/actions";
import { gameConfig } from "@/config";
import EventTimeline from "@/components/admin/EventTimeline";

export default async function AdminProgressPage() {
  const track = await getAdminTrack();
  const [events, chapterProgress, messageProgress, completedStepCounts] =
    await Promise.all([
      getPlayerEvents(track),
      getAllChapterProgress(track),
      getAllMessageProgress(track),
      getCompletedStepCounts(track),
    ]);

  const completedIds = new Set(
    chapterProgress
      .filter((cp) => !!cp.completed_at)
      .map((cp) => cp.chapter_id)
  );

  const chapterIds = Object.keys(gameConfig.chapters);
  const firstIncomplete = chapterIds.find((id) => !completedIds.has(id)) ?? chapterIds[0];

  return (
    <div className="p-4">
      <div className="text-[11px] font-semibold tracking-[1.5px] uppercase text-admin-text-muted mb-3">
        Activity Log
      </div>
      <EventTimeline
        events={events}
        initialChapter={firstIncomplete}
        chapterProgress={chapterProgress}
        messageProgress={messageProgress}
        completedStepCounts={completedStepCounts}
        track={track}
      />
    </div>
  );
}
