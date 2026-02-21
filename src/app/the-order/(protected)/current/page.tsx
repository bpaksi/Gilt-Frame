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

export default async function AdminCurrentPage() {
  const track = await getAdminTrack();
  const state = await getPlayerState(track);

  // When idle, find the first incomplete chapter (not the first chapter overall)
  let chapterId: string;
  let stepIndex: number;

  if (state.chapterId) {
    chapterId = state.chapterId;
    stepIndex = state.stepIndex;
  } else {
    const chapterProgress = await getAllChapterProgress(track);
    const completedIds = new Set(
      chapterProgress.filter((cp) => !!cp.completed_at).map((cp) => cp.chapter_id)
    );
    const chapterIds = Object.keys(gameConfig.chapters);
    chapterId = chapterIds.find((id) => !completedIds.has(id)) ?? chapterIds[0];
    stepIndex = 0;
  }

  const messageProgress = chapterId
    ? await getChapterMessageProgress(track, chapterId)
    : [];

  // Resolve current step + its message_progress row
  let currentStep = null;
  let currentStepProgress = null;
  let currentStepScheduledAt: string | null = null;
  let revealedTiers: number[] = [];

  if (chapterId) {
    const chapter = gameConfig.chapters[chapterId];
    if (chapter) {
      const orderedSteps = getOrderedSteps(chapter);
      currentStep = orderedSteps[stepIndex] ?? null;

      if (currentStep && currentStep.type !== "website") {
        // Find message_progress by step_id (player's message)
        currentStepProgress =
          messageProgress.find(
            (mp) => mp.step_id === currentStep!.id && mp.to === currentStep!.config.to
          ) ?? null;

        // Check step_progress for scheduled_at
        const supabase = createAdminClient();
        const { data: cp } = await supabase
          .from("chapter_progress")
          .select("id")
          .eq("track", track)
          .eq("chapter_id", chapterId)
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

      if (currentStep?.type === "website") {
        const supabase = createAdminClient();
        const { data: cp } = await supabase
          .from("chapter_progress")
          .select("id")
          .eq("track", track)
          .eq("chapter_id", chapterId)
          .single();

        if (cp) {
          const { data: sp } = await supabase
            .from("step_progress")
            .select("id")
            .eq("chapter_progress_id", cp.id)
            .eq("step_id", currentStep.id)
            .single();

          if (sp) {
            const { data: hintViews } = await supabase
              .from("hint_views")
              .select("hint_tier")
              .eq("step_progress_id", sp.id);
            revealedTiers = (hintViews ?? []).map((h) => h.hint_tier);
          }
        }
      }
    }
  }

  // Enrich state with defaults so PlayerStateCard always shows chapter info
  const chapter = gameConfig.chapters[chapterId];
  let enrichedState = state;

  if (!state.chapterId) {
    // Fetch last activity even when idle
    const supabase = createAdminClient();
    const { data: lastEvent } = await supabase
      .from("activity_log")
      .select("created_at")
      .eq("track", track)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    enrichedState = {
      ...state,
      chapterId,
      chapterName: chapter?.name ?? chapterId,
      location: chapter?.location ?? null,
      stepName: currentStep?.name ?? null,
      status: "pending",
      lastActivity: lastEvent?.created_at ?? null,
    };
  }

  return (
    <div className="p-4 max-w-2xl">
      <PlayerStateCard state={enrichedState} />

      {currentStep && (
        <CurrentStepAction
          key={`${chapterId}-${stepIndex}`}
          step={currentStep}
          track={track}
          chapterId={chapterId}
          stepIndex={stepIndex}
          messageProgress={currentStepProgress}
          scheduledAt={currentStepScheduledAt}
          revealedTiers={revealedTiers}
          location={chapter?.location ?? null}
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
