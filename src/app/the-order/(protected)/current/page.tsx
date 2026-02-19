import Link from "next/link";
import { getAdminTrack } from "@/lib/admin/track";
import {
  getPlayerState,
  getChapterMessageProgress,
} from "@/lib/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { chaptersConfig, getOrderedFlow } from "@/config/chapters";
import PlayerStateCard from "@/components/admin/PlayerStateCard";
import CurrentStepAction from "@/components/admin/CurrentStepAction";

export default async function AdminCurrentPage() {
  const track = await getAdminTrack();
  const state = await getPlayerState(track);

  // Default to first chapter + step 0 when no progress exists
  const firstChapterId = Object.keys(chaptersConfig.chapters)[0];
  const chapterId = state.chapterId ?? firstChapterId;
  const flowIndex = state.chapterId ? state.flowIndex : 0;

  const messageProgress = chapterId
    ? await getChapterMessageProgress(track, chapterId)
    : [];

  // Resolve current step + its message_progress row
  let currentStep = null;
  let currentStepProgress = null;
  let revealedTiers: number[] = [];

  if (chapterId) {
    const chapter = chaptersConfig.chapters[chapterId];
    if (chapter) {
      const orderedFlow = getOrderedFlow(chapter);
      currentStep = orderedFlow[flowIndex] ?? null;

      if (currentStep && "progress_key" in currentStep) {
        currentStepProgress =
          messageProgress.find(
            (mp) => mp.progress_key === currentStep!.progress_key
          ) ?? null;
      }

      if (currentStep?.type === "website") {
        const supabase = createAdminClient();
        const { data: hintViews } = await supabase
          .from("hint_views")
          .select("hint_tier")
          .eq("track", track)
          .eq("chapter_id", chapterId)
          .eq("flow_index", flowIndex);
        revealedTiers = (hintViews ?? []).map((h) => h.hint_tier);
      }
    }
  }

  // Enrich state with defaults so PlayerStateCard always shows chapter info
  const chapter = chaptersConfig.chapters[chapterId];
  const enrichedState = state.chapterId
    ? state
    : {
        ...state,
        chapterId,
        chapterName: chapter?.name ?? chapterId,
        location: chapter?.location ?? null,
        stepName: currentStep?.name ?? null,
      };

  return (
    <div style={{ padding: "16px" }}>
      <PlayerStateCard state={enrichedState} />

      {currentStep && (
        <CurrentStepAction
          step={currentStep}
          track={track}
          chapterId={chapterId}
          flowIndex={flowIndex}
          messageProgress={currentStepProgress}
          revealedTiers={revealedTiers}
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
