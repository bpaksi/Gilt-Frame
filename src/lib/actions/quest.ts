"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { resolveTrack } from "@/lib/track";
import {
  chaptersConfig,
  getOrderedFlow,
  type ComponentName,
  type ComponentConfig,
  type AdvanceCondition,
  type HintItem,
} from "@/config/chapters";

export type QuestState = {
  status: "waiting" | "active";
  chapterId?: string;
  chapterName?: string;
  flowIndex?: number;
  component?: ComponentName;
  advance?: AdvanceCondition;
  config?: ComponentConfig;
  track?: "test" | "live";
  revealedHintTiers?: number[];
};

export async function getQuestState(): Promise<QuestState> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return { status: "waiting" };

  const supabase = createAdminClient();
  const { data: progress } = await supabase
    .from("chapter_progress")
    .select("*")
    .eq("track", trackInfo.track)
    .eq("status", "active")
    .single();

  if (!progress) return { status: "waiting" };

  const chapter = chaptersConfig.chapters[progress.chapter_id];
  if (!chapter) return { status: "waiting" };

  const orderedFlow = getOrderedFlow(chapter);
  const currentStep = orderedFlow[progress.current_flow_index];

  if (!currentStep || currentStep.type !== "website") {
    return { status: "waiting" };
  }

  // Fetch revealed hint tiers for this step
  const { data: hintViews } = await supabase
    .from("hint_views")
    .select("hint_tier")
    .eq("track", trackInfo.track)
    .eq("chapter_id", progress.chapter_id)
    .eq("flow_index", progress.current_flow_index);

  const revealedHintTiers = (hintViews ?? []).map((h) => h.hint_tier);

  return {
    status: "active",
    chapterId: progress.chapter_id,
    chapterName: chapter.name,
    flowIndex: progress.current_flow_index,
    component: currentStep.component,
    advance: currentStep.advance,
    config: currentStep.config,
    track: trackInfo.track,
    revealedHintTiers,
  };
}

export async function advanceQuest(
  chapterId: string,
  currentFlowIndex: number
): Promise<QuestState> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return { status: "waiting" };

  const supabase = createAdminClient();

  // Verify current state matches
  const { data: progress } = await supabase
    .from("chapter_progress")
    .select("*")
    .eq("track", trackInfo.track)
    .eq("chapter_id", chapterId)
    .eq("status", "active")
    .single();

  if (!progress || progress.current_flow_index !== currentFlowIndex) {
    return getQuestState();
  }

  const chapter = chaptersConfig.chapters[chapterId];
  if (!chapter) return { status: "waiting" };

  const orderedFlow = getOrderedFlow(chapter);
  const nextIndex = currentFlowIndex + 1;

  // Find the next website step (skip offline steps)
  let websiteIndex = nextIndex;
  while (websiteIndex < orderedFlow.length) {
    if (orderedFlow[websiteIndex].type === "website") break;
    websiteIndex++;
  }

  // Update flow index to the next step (even offline — admin needs to see real position)
  await supabase
    .from("chapter_progress")
    .update({ current_flow_index: nextIndex })
    .eq("track", trackInfo.track)
    .eq("chapter_id", chapterId);

  // Record event for timeline
  const currentStep = orderedFlow[currentFlowIndex];
  await supabase.from("player_events").insert({
    track: trackInfo.track,
    event_type: "quest_advanced",
    details: {
      chapter_id: chapterId,
      from_index: currentFlowIndex,
      to_index: nextIndex,
      step_name: currentStep?.name ?? null,
    },
  });

  return getQuestState();
}

export async function recordAnswer(
  chapterId: string,
  flowIndex: number,
  questionIndex: number,
  selectedOption: string,
  correct: boolean
): Promise<void> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return;

  const supabase = createAdminClient();
  await supabase.from("quest_answers").insert({
    track: trackInfo.track,
    chapter_id: chapterId,
    flow_index: flowIndex,
    question_index: questionIndex,
    selected_option: selectedOption,
    correct,
  });

  // Record event for timeline
  await supabase.from("player_events").insert({
    track: trackInfo.track,
    event_type: "answer_submitted",
    details: {
      chapter_id: chapterId,
      flow_index: flowIndex,
      question_index: questionIndex,
      correct,
    },
  });
}

export async function revealHint(
  chapterId: string,
  flowIndex: number,
  hintTier: number
): Promise<{ hint: string } | null> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return null;

  // Get hint text from config
  const chapter = chaptersConfig.chapters[chapterId];
  if (!chapter) return null;

  const orderedFlow = getOrderedFlow(chapter);
  const step = orderedFlow[flowIndex];
  if (!step || step.type !== "website") return null;

  const config = step.config as { hints?: HintItem[] };
  const hintItem = config.hints?.find((h) => h.tier === hintTier);
  if (!hintItem) return null;

  const supabase = createAdminClient();
  await supabase.from("hint_views").insert({
    track: trackInfo.track,
    chapter_id: chapterId,
    flow_index: flowIndex,
    hint_tier: hintTier,
  });

  // Record event for timeline
  await supabase.from("player_events").insert({
    track: trackInfo.track,
    event_type: "hint_requested",
    details: {
      chapter_id: chapterId,
      flow_index: flowIndex,
      hint_tier: hintTier,
    },
  });

  return { hint: hintItem.hint };
}

export async function pollChapterProgress(
  chapterId: string
): Promise<{ flowIndex: number } | null> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return null;

  const supabase = createAdminClient();
  const { data: progress } = await supabase
    .from("chapter_progress")
    .select("current_flow_index")
    .eq("track", trackInfo.track)
    .eq("chapter_id", chapterId)
    .eq("status", "active")
    .single();

  if (!progress) return null;
  return { flowIndex: progress.current_flow_index };
}
