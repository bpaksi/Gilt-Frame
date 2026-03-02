import Link from "next/link";
import { getAdminTrack } from "@/lib/admin/track";
import {
  getPlayerState,
  getChapterMessageProgress,
  getAllChapterProgress,
} from "@/lib/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { gameConfig, getOrderedSteps } from "@/config";
import PlayerStateCard from "@/components/admin/PlayerStateCard";
import CurrentStepAction from "@/components/admin/CurrentStepAction";
import ActivateChapterButton from "@/components/admin/ActivateChapterButton";

export default async function AdminCurrentPage() {
  const track = await getAdminTrack();
  const state = await getPlayerState(track);

  // ── Active chapter: resolve current step + its message progress ───────────
  let currentStep = null;
  let currentStepProgress = null;
  let currentStepScheduledAt: string | null = null;

  if (state.chapterId) {
    const chapter = gameConfig.chapters[state.chapterId];
    if (chapter) {
      const orderedSteps = getOrderedSteps(chapter);
      currentStep = orderedSteps[state.stepIndex] ?? null;

      if (currentStep && currentStep.type !== "website") {
        const messageProgress = await getChapterMessageProgress(track, state.chapterId);
        currentStepProgress =
          messageProgress.find(
            (mp) => mp.step_id === currentStep!.id && mp.to === currentStep!.config.to
          ) ?? null;

        const supabase = createAdminClient();
        const { data: cp } = await supabase
          .from("chapter_progress")
          .select("id")
          .eq("track", track)
          .eq("chapter_id", state.chapterId)
          .single();

        if (cp) {
          const { data: sp } = await supabase
            .from("step_progress")
            .select("scheduled_at")
            .eq("chapter_progress_id", cp.id)
            .eq("step_id", currentStep.id)
            .single();
          currentStepScheduledAt = sp?.scheduled_at ?? null;
        }
      }
    }
  }

  // ── Idle: find next chapter to activate ───────────────────────────────────
  let nextChapterId: string | null = null;
  let nextChapterName: string | null = null;

  if (!state.chapterId) {
    const chapterProgress = await getAllChapterProgress(track);
    const completedIds = new Set(
      chapterProgress.filter((cp) => !!cp.completed_at).map((cp) => cp.chapter_id)
    );
    const chapterIds = Object.keys(gameConfig.chapters);
    nextChapterId = chapterIds.find((id) => !completedIds.has(id)) ?? chapterIds[0];
    const nextChapter = nextChapterId ? gameConfig.chapters[nextChapterId] : null;
    nextChapterName = nextChapter?.name ?? nextChapterId;
  }

  return (
    <div className="p-4 max-w-2xl">
      <PlayerStateCard state={state} />

      {state.chapterId && currentStep && (
        <CurrentStepAction
          key={`${state.chapterId}-${state.stepIndex}`}
          step={currentStep}
          track={track}
          chapterId={state.chapterId}
          stepIndex={state.stepIndex}
          messageProgress={currentStepProgress}
          scheduledAt={currentStepScheduledAt}
          location={gameConfig.chapters[state.chapterId]?.location ?? null}
          isChapterActive={true}
        />
      )}

      {!state.chapterId && nextChapterId && (
        <ActivateChapterButton
          chapterId={nextChapterId}
          chapterName={nextChapterName!}
          track={track}
        />
      )}

      <Link
        href="/the-order/send-hint"
        className="admin-card block text-center py-2.5 px-4 mb-4 text-[13px] font-semibold text-admin-blue no-underline transition-all duration-150 hover:shadow-md hover:-translate-y-px"
      >
        Send Hint Message
      </Link>
    </div>
  );
}
