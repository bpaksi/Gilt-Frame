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
  let revealedTiers: number[] = [];

  if (chapterId) {
    const chapter = gameConfig.chapters[chapterId];
    if (chapter) {
      const orderedSteps = getOrderedSteps(chapter);
      currentStep = orderedSteps[stepIndex] ?? null;

      if (currentStep && currentStep.type !== "website") {
        currentStepProgress =
          messageProgress.find(
            (mp) => mp.progress_key === currentStep!.config.progress_key
          ) ?? null;
      }

      if (currentStep?.type === "website") {
        const supabase = createAdminClient();
        const { data: hintViews } = await supabase
          .from("hint_views")
          .select("hint_tier")
          .eq("track", track)
          .eq("chapter_id", chapterId)
          .eq("step_id", currentStep.id);
        revealedTiers = (hintViews ?? []).map((h) => h.hint_tier);
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
    <div style={{ padding: "16px" }}>
      <PlayerStateCard state={enrichedState} />

      {currentStep && (
        <CurrentStepAction
          key={`${chapterId}-${stepIndex}`}
          step={currentStep}
          track={track}
          chapterId={chapterId}
          stepIndex={stepIndex}
          messageProgress={currentStepProgress}
          revealedTiers={revealedTiers}
          location={chapter?.location ?? null}
        />
      )}

      <Link
        href="/the-order/send-hint"
        style={{
          display: "block",
          textAlign: "center",
          padding: "10px 16px",
          background: "#fff",
          border: "1px solid #d0d0d0",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "13px",
          fontWeight: 600,
          color: "#336699",
          textDecoration: "none",
        }}
      >
        Send Hint Message
      </Link>

    </div>
  );
}
