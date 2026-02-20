"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { resolveTrack } from "@/lib/track";
import {
  gameConfig,
  getOrderedSteps,
  COMPONENT_ADVANCE,
  type ComponentName,
  type ComponentConfig,
  type AdvanceCondition,
  type HintItem,
} from "@/config";
import { sendStep, scheduleStep } from "@/lib/messaging/send";
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
  chapterProgressId: string,
): Promise<number> {
  const { count } = await supabase
    .from("step_progress")
    .select("*", { count: "exact", head: true })
    .eq("chapter_progress_id", chapterProgressId)
    .not("completed_at", "is", null);
  return count ?? 0;
}

/**
 * Get or create a step_progress row for the given step.
 * Returns the step_progress id.
 */
async function ensureStepProgress(
  supabase: SupabaseClient,
  chapterProgressId: string,
  stepId: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("step_progress")
    .select("id")
    .eq("chapter_progress_id", chapterProgressId)
    .eq("step_id", stepId)
    .single();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("step_progress")
    .insert({
      chapter_progress_id: chapterProgressId,
      step_id: stepId,
      completed_at: null,
    })
    .select("id")
    .single();

  return created!.id;
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
  const stepIndex = await getCurrentStepIndex(supabase, progress.id);
  const currentStep = orderedSteps[stepIndex];

  if (!currentStep || currentStep.type !== "website") {
    return { status: "waiting" };
  }

  // Fetch revealed hint tiers for this step via step_progress FK
  const { data: stepProgress } = await supabase
    .from("step_progress")
    .select("id")
    .eq("chapter_progress_id", progress.id)
    .eq("step_id", currentStep.id)
    .single();

  let revealedHintTiers: number[] = [];
  if (stepProgress) {
    const { data: hintViews } = await supabase
      .from("hint_views")
      .select("hint_tier")
      .eq("step_progress_id", stepProgress.id);
    revealedHintTiers = (hintViews ?? []).map((h) => h.hint_tier);
  }

  return {
    status: "active",
    chapterId: progress.chapter_id,
    chapterName: chapter.name,
    stepIndex,
    component: currentStep.component,
    advance: COMPONENT_ADVANCE[currentStep.component],
    config: currentStep.config,
    track: trackInfo.track,
    revealedHintTiers,
  };
}

/**
 * Starting from fromIndex + 1, send consecutive auto-triggered messaging steps.
 * Stops at the first manual step or website step. If all chapter steps are
 * completed after the loop, marks the chapter as complete.
 */
export async function autoAdvanceMessagingSteps(
  track: "test" | "live",
  chapterId: string,
  fromIndex: number,
): Promise<void> {
  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return;

  const orderedSteps = getOrderedSteps(chapter);
  const supabase = createAdminClient();

  for (let i = fromIndex + 1; i < orderedSteps.length; i++) {
    const step = orderedSteps[i];
    if (step.type === "website") break;
    if (step.trigger !== "auto") break;

    const delayMornings = step.delay_mornings;
    if (delayMornings && delayMornings > 0) {
      await scheduleStep(track, chapterId, step.id, delayMornings);
    } else {
      await sendStep(track, chapterId, step.id);
    }
  }

  // Check if all steps are now completed — if so, complete the chapter
  const { data: cp } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", track)
    .eq("chapter_id", chapterId)
    .single();

  if (!cp) return;

  const { count } = await supabase
    .from("step_progress")
    .select("*", { count: "exact", head: true })
    .eq("chapter_progress_id", cp.id)
    .not("completed_at", "is", null);

  if ((count ?? 0) >= orderedSteps.length) {
    await supabase
      .from("chapter_progress")
      .update({ completed_at: new Date().toISOString() })
      .eq("track", track)
      .eq("chapter_id", chapterId)
      .is("completed_at", null);
  }
}

export async function advanceQuest(
  chapterId: string,
  stepIndex: number,
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

  // Verify current step matches via step_progress count
  const currentIndex = await getCurrentStepIndex(supabase, progress.id);
  if (currentIndex !== stepIndex) {
    return getQuestState();
  }

  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return { status: "waiting" };

  const orderedSteps = getOrderedSteps(chapter);
  const currentStep = orderedSteps[stepIndex];

  // Mark the current step as completed (upsert: set completed_at on existing row)
  const spId = await ensureStepProgress(supabase, progress.id, currentStep.id);
  await supabase
    .from("step_progress")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", spId);

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

  // Auto-advance any consecutive auto-triggered messaging steps
  await autoAdvanceMessagingSteps(trackInfo.track, chapterId, stepIndex);

  return getQuestState();
}

export async function recordAnswer(
  chapterId: string,
  stepIndex: number,
  questionIndex: number,
  selectedOption: string,
  correct: boolean,
): Promise<void> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return;

  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return;
  const orderedSteps = getOrderedSteps(chapter);
  const step = orderedSteps[stepIndex];
  if (!step) return;

  const supabase = createAdminClient();

  // Get chapter_progress id
  const { data: cp } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", trackInfo.track)
    .eq("chapter_id", chapterId)
    .single();

  if (!cp) return;

  const spId = await ensureStepProgress(supabase, cp.id, step.id);

  await supabase.from("quest_answers").insert({
    step_progress_id: spId,
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
  hintTier: number,
): Promise<{ hint: string } | null> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return null;

  // Get hint text from config
  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return null;

  const orderedSteps = getOrderedSteps(chapter);
  const step = orderedSteps[stepIndex];
  if (!step || step.type !== "website") return null;

  const config = step.config as {
    hints?: HintItem[];
    questions?: { hints?: string[] }[];
  };
  // Check step-level hints first (HintItem[])
  let hintItem = config.hints?.find((h) => h.tier === hintTier);
  // Then check per-question hints (string[] with derived tiers)
  if (!hintItem && config.questions) {
    let tierOffset = 0;
    for (const q of config.questions) {
      if (q.hints) {
        const localIndex = hintTier - tierOffset - 1;
        if (localIndex >= 0 && localIndex < q.hints.length) {
          hintItem = { tier: hintTier, hint: q.hints[localIndex] };
          break;
        }
        tierOffset += q.hints.length;
      }
    }
  }
  if (!hintItem) return null;

  const supabase = createAdminClient();

  // Get chapter_progress id
  const { data: cp } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", trackInfo.track)
    .eq("chapter_id", chapterId)
    .single();

  if (!cp) return null;

  const spId = await ensureStepProgress(supabase, cp.id, step.id);

  await supabase.from("hint_views").insert({
    step_progress_id: spId,
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
  chapterId: string,
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

  const stepIndex = await getCurrentStepIndex(supabase, progress.id);
  return { stepIndex };
}
