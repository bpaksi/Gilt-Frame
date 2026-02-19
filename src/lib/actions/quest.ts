"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { resolveTrack } from "@/lib/track";
import {
  gameConfig,
  getOrderedSteps,
  type ComponentName,
  type ComponentConfig,
  type AdvanceCondition,
  type HintItem,
} from "@/config";
import type { SupabaseClient } from "@supabase/supabase-js";

export type QuestState = {
  status: "waiting" | "active";
  chapterId?: string;
  chapterName?: string;
  stepIndex?: number;
  component?: ComponentName;
  advance?: AdvanceCondition;
  config?: ComponentConfig;
  track?: "test" | "live";
  revealedHintTiers?: number[];
};

export async function getCurrentStepIndex(
  supabase: SupabaseClient,
  track: string,
  chapterId: string
): Promise<number> {
  const { count } = await supabase
    .from("completed_steps")
    .select("*", { count: "exact", head: true })
    .eq("track", track)
    .eq("chapter_id", chapterId);
  return count ?? 0;
}

export async function getQuestState(): Promise<QuestState> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return { status: "waiting" };

  const supabase = createAdminClient();
  const { data: progress } = await supabase
    .from("chapter_progress")
    .select("*")
    .eq("track", trackInfo.track)
    .is("completed_at", null)
    .single();

  if (!progress) return { status: "waiting" };

  const chapter = gameConfig.chapters[progress.chapter_id];
  if (!chapter) return { status: "waiting" };

  const orderedSteps = getOrderedSteps(chapter);
  const stepIndex = await getCurrentStepIndex(
    supabase,
    trackInfo.track,
    progress.chapter_id
  );
  const currentStep = orderedSteps[stepIndex];

  if (!currentStep || currentStep.type !== "website") {
    return { status: "waiting" };
  }

  // Fetch revealed hint tiers for this step
  const { data: hintViews } = await supabase
    .from("hint_views")
    .select("hint_tier")
    .eq("track", trackInfo.track)
    .eq("chapter_id", progress.chapter_id)
    .eq("step_id", currentStep.id);

  const revealedHintTiers = (hintViews ?? []).map((h) => h.hint_tier);

  return {
    status: "active",
    chapterId: progress.chapter_id,
    chapterName: chapter.name,
    stepIndex,
    component: currentStep.component,
    advance: currentStep.advance,
    config: currentStep.config,
    track: trackInfo.track,
    revealedHintTiers,
  };
}

export async function advanceQuest(
  chapterId: string,
  stepIndex: number
): Promise<QuestState> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return { status: "waiting" };

  const supabase = createAdminClient();

  // Verify chapter is active
  const { data: progress } = await supabase
    .from("chapter_progress")
    .select("*")
    .eq("track", trackInfo.track)
    .eq("chapter_id", chapterId)
    .is("completed_at", null)
    .single();

  if (!progress) return getQuestState();

  // Verify current step matches via completed_steps count
  const currentIndex = await getCurrentStepIndex(
    supabase,
    trackInfo.track,
    chapterId
  );
  if (currentIndex !== stepIndex) {
    return getQuestState();
  }

  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return { status: "waiting" };

  const orderedSteps = getOrderedSteps(chapter);
  const nextIndex = stepIndex + 1;

  // Mark the current step as completed
  const currentStep = orderedSteps[stepIndex];
  await supabase.from("completed_steps").insert({
    track: trackInfo.track,
    chapter_id: chapterId,
    step_id: currentStep.id,
  });

  // Record event for timeline
  await supabase.from("activity_log").insert({
    track: trackInfo.track,
    source: "player",
    event_type: "quest_advanced",
    details: {
      chapter_id: chapterId,
      step_id: currentStep.id,
      step_name: currentStep?.name ?? null,
    },
  });

  return getQuestState();
}

export async function recordAnswer(
  chapterId: string,
  stepIndex: number,
  questionIndex: number,
  selectedOption: string,
  correct: boolean
): Promise<void> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return;

  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return;
  const orderedSteps = getOrderedSteps(chapter);
  const step = orderedSteps[stepIndex];
  if (!step) return;

  const supabase = createAdminClient();
  await supabase.from("quest_answers").insert({
    track: trackInfo.track,
    chapter_id: chapterId,
    step_id: step.id,
    question_index: questionIndex,
    selected_option: selectedOption,
    correct,
  });

  // Record event for timeline
  await supabase.from("activity_log").insert({
    track: trackInfo.track,
    source: "player",
    event_type: "answer_submitted",
    details: {
      chapter_id: chapterId,
      step_id: step.id,
      question_index: questionIndex,
      correct,
    },
  });
}

export async function revealHint(
  chapterId: string,
  stepIndex: number,
  hintTier: number
): Promise<{ hint: string } | null> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return null;

  // Get hint text from config
  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return null;

  const orderedSteps = getOrderedSteps(chapter);
  const step = orderedSteps[stepIndex];
  if (!step || step.type !== "website") return null;

  const config = step.config as { hints?: HintItem[] };
  const hintItem = config.hints?.find((h) => h.tier === hintTier);
  if (!hintItem) return null;

  const supabase = createAdminClient();
  await supabase.from("hint_views").insert({
    track: trackInfo.track,
    chapter_id: chapterId,
    step_id: step.id,
    hint_tier: hintTier,
  });

  // Record event for timeline
  await supabase.from("activity_log").insert({
    track: trackInfo.track,
    source: "player",
    event_type: "hint_requested",
    details: {
      chapter_id: chapterId,
      step_id: step.id,
      hint_tier: hintTier,
    },
  });

  return { hint: hintItem.hint };
}

export async function pollChapterProgress(
  chapterId: string
): Promise<{ stepIndex: number } | null> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return null;

  const supabase = createAdminClient();

  // Verify chapter is active
  const { data: progress } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", trackInfo.track)
    .eq("chapter_id", chapterId)
    .is("completed_at", null)
    .single();

  if (!progress) return null;

  const stepIndex = await getCurrentStepIndex(
    supabase,
    trackInfo.track,
    chapterId
  );
  return { stepIndex };
}
