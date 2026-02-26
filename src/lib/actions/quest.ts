"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { resolveTrack } from "@/lib/track";
import {
  gameConfig,
  getOrderedSteps,
  COMPONENT_ADVANCE,
  type Step,
  type ComponentName,
  type ComponentConfig,
  type AdvanceCondition,
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

/**
 * Pure config lookup: given a chapter ID and a current_step_id pointer,
 * return the index into the ordered steps array. Returns 0 if the pointer
 * is null (chapter just started) or the ID isn't found.
 */
export async function getStepIndexFromId(
  chapterId: string,
  currentStepId: string | null,
): Promise<number> {
  if (!currentStepId) return 0;
  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return 0;
  const orderedSteps = getOrderedSteps(chapter);
  const idx = orderedSteps.findIndex((s) => s.id === currentStepId);
  return idx >= 0 ? idx : 0;
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
  const stepIndex = await getStepIndexFromId(progress.chapter_id, progress.current_step_id);
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

/** Convert delay_minutes or delay_hours on a messaging step to seconds. Returns 0 for no delay. */
function getDelaySeconds(step: Step): number {
  if (step.type === "website") return 0;
  if (step.delay_minutes) return step.delay_minutes * 60;
  if (step.delay_hours) return step.delay_hours * 3600;
  return 0;
}

/**
 * Starting from fromIndex + 1, send/schedule consecutive auto-triggered messaging
 * steps and advance the current_step_id pointer. Stops at the first manual or
 * website step. Also stops when hitting a delayed step — the quest "pauses" on
 * that step until QStash fires the webhook, which resumes the chain.
 *
 * If all steps are exhausted, marks the chapter as complete
 * (sets current_step_id = NULL, completed_at = now()).
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
  let lastProcessedIndex = fromIndex;

  for (let i = fromIndex + 1; i < orderedSteps.length; i++) {
    const step = orderedSteps[i];
    if (step.type === "website") break;
    if (step.trigger !== "auto") break;

    const delaySeconds = getDelaySeconds(step);
    if (delaySeconds > 0) {
      // Schedule the delayed step and STOP — pointer stays before this step.
      // The QStash webhook will call sendStep() then resume autoAdvance.
      await scheduleStep(track, chapterId, step.id, delaySeconds);

      // Point current_step_id to the scheduled step (quest is "paused" here)
      await supabase
        .from("chapter_progress")
        .update({ current_step_id: step.id })
        .eq("track", track)
        .eq("chapter_id", chapterId)
        .is("completed_at", null);
      return;
    }

    await sendStep(track, chapterId, step.id);
    lastProcessedIndex = i;
  }

  // Advance pointer: next step after last processed, or complete the chapter
  const nextIndex = lastProcessedIndex + 1;
  if (nextIndex >= orderedSteps.length) {
    // All steps done — complete the chapter
    await supabase
      .from("chapter_progress")
      .update({
        current_step_id: null,
        completed_at: new Date().toISOString(),
      })
      .eq("track", track)
      .eq("chapter_id", chapterId)
      .is("completed_at", null);
  } else {
    // Point to the next step
    await supabase
      .from("chapter_progress")
      .update({ current_step_id: orderedSteps[nextIndex].id })
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

  // Verify current step matches via pointer
  const currentIndex = await getStepIndexFromId(chapterId, progress.current_step_id);
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

  // Passphrase step side effects: activity log + journey moment
  if (
    currentStep.type === "website" &&
    (currentStep as { component?: string }).component === "PassphraseEntry"
  ) {
    supabase
      .from("activity_log")
      .insert({
        track: trackInfo.track,
        source: "player",
        event_type: "passphrase_entered",
        details: { chapter_id: chapterId, step_name: currentStep.name ?? null },
      })
      .then(() => {});
    supabase
      .from("moments")
      .insert({
        track: trackInfo.track,
        chapter_id: chapterId,
        moment_type: "passphrase",
        narrative_text: "The acrostic revealed its truth. The Order heard.",
        share_token: crypto.randomUUID(),
      })
      .then(() => {});
  }

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
    hints?: string[];
    questions?: { hints?: string[] }[];
  };
  // Step-level hints (string[], tier is 1-based index)
  let hintText = config.hints?.[hintTier - 1];
  // Per-question hints with tier offset
  if (hintText === undefined && config.questions) {
    let tierOffset = 0;
    for (const q of config.questions) {
      if (q.hints) {
        const localIndex = hintTier - tierOffset - 1;
        if (localIndex >= 0 && localIndex < q.hints.length) {
          hintText = q.hints[localIndex];
          break;
        }
        tierOffset += q.hints.length;
      }
    }
  }
  if (hintText === undefined) return null;

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

  return { hint: hintText };
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
    .select("id, current_step_id")
    .eq("track", trackInfo.track)
    .eq("chapter_id", chapterId)
    .is("completed_at", null)
    .single();

  if (!progress) return null;

  const stepIndex = await getStepIndexFromId(chapterId, progress.current_step_id);
  return { stepIndex };
}
