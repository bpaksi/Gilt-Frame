import { getAdminTrack } from "@/lib/admin/track";
import {
  getPlayerState,
  getChapterMessageProgress,
} from "@/lib/admin/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { chaptersConfig, getOrderedFlow } from "@/config/chapters";
import PlayerStateCard from "@/components/admin/PlayerStateCard";
import FlowList from "@/components/admin/FlowList";
import HintPush from "@/components/admin/HintPush";
import FreeformCompose from "@/components/admin/FreeformCompose";
import ResetChapter from "@/components/admin/ResetChapter";

export default async function AdminCurrentPage() {
  const track = await getAdminTrack();
  const state = await getPlayerState(track);

  const chapterId = state.chapterId;
  const messageProgress = chapterId
    ? await getChapterMessageProgress(track, chapterId)
    : [];

  // Get revealed hints for current step if active
  let revealedTiers: number[] = [];
  if (chapterId && state.status === "active") {
    const chapter = chaptersConfig.chapters[chapterId];
    if (chapter) {
      const orderedFlow = getOrderedFlow(chapter);
      const currentStep = orderedFlow[state.flowIndex];
      if (currentStep?.type === "website") {
        const supabase = createAdminClient();
        const { data: hintViews } = await supabase
          .from("hint_views")
          .select("hint_tier")
          .eq("track", track)
          .eq("chapter_id", chapterId)
          .eq("flow_index", state.flowIndex);
        revealedTiers = (hintViews ?? []).map((h) => h.hint_tier);
      }
    }
  }

  return (
    <div style={{ padding: "16px" }}>
      <PlayerStateCard state={state} />

      {chapterId && (
        <FlowList
          chapterId={chapterId}
          currentFlowIndex={state.flowIndex}
          messageProgress={messageProgress}
          track={track}
        />
      )}

      {chapterId && state.status === "active" && (
        <HintPush
          track={track}
          chapterId={chapterId}
          flowIndex={state.flowIndex}
          revealedTiers={revealedTiers}
        />
      )}

      <FreeformCompose track={track} />

      {chapterId && state.chapterName && (
        <ResetChapter
          track={track}
          chapterId={chapterId}
          chapterName={state.chapterName}
        />
      )}
    </div>
  );
}
