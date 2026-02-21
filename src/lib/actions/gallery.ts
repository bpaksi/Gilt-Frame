"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  gameConfig,
  getOrderedSteps,
} from "@/config";

const GALLERY_USER_AGENT = "gallery";
const GALLERY_TRACK = "test" as const;

/**
 * Ensures a gallery device enrollment exists on the test track,
 * then creates chapter_progress and step_progress rows for the
 * given chapter/step so quest components can perform real DB operations.
 */
export async function gallerySetup(
  chapterId: string,
  stepIndex: number,
): Promise<{
  enrollmentId: string;
  chapterProgressId: string;
  stepProgressId: string;
}> {
  const supabase = createAdminClient();

  // Ensure gallery device enrollment
  const { data: existing } = await supabase
    .from("device_enrollments")
    .select("id")
    .eq("track", GALLERY_TRACK)
    .eq("user_agent", GALLERY_USER_AGENT)
    .limit(1)
    .single();

  let enrollmentId: string;
  if (existing) {
    enrollmentId = existing.id;
  } else {
    const { data: created, error: enrollError } = await supabase
      .from("device_enrollments")
      .insert({
        track: GALLERY_TRACK,
        user_agent: GALLERY_USER_AGENT,
        token: `gallery-${crypto.randomUUID()}`,
      })
      .select("id")
      .single();
    if (enrollError || !created) {
      throw new Error(`Failed to create gallery enrollment: ${enrollError?.message ?? "unknown error"}`);
    }
    enrollmentId = created.id;
  }

  // Ensure chapter_progress row (table has no enrollment_id — scoped by track + chapter_id)
  const { data: cpExisting } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", GALLERY_TRACK)
    .eq("chapter_id", chapterId)
    .limit(1)
    .single();

  let chapterProgressId: string;
  if (cpExisting) {
    chapterProgressId = cpExisting.id;
  } else {
    const { data: cpCreated, error: cpError } = await supabase
      .from("chapter_progress")
      .insert({
        track: GALLERY_TRACK,
        chapter_id: chapterId,
      })
      .select("id")
      .single();
    if (cpError || !cpCreated) {
      throw new Error(`Failed to create chapter_progress: ${cpError?.message ?? "unknown error"}`);
    }
    chapterProgressId = cpCreated.id;
  }

  // Resolve step ID from config
  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) throw new Error(`Unknown chapter: ${chapterId}`);
  const orderedSteps = getOrderedSteps(chapter);
  const step = orderedSteps[stepIndex];
  if (!step) throw new Error(`Step index ${stepIndex} out of range for chapter ${chapterId}`);

  // Ensure step_progress row
  const { data: spExisting } = await supabase
    .from("step_progress")
    .select("id")
    .eq("chapter_progress_id", chapterProgressId)
    .eq("step_id", step.id)
    .limit(1)
    .single();

  let stepProgressId: string;
  if (spExisting) {
    stepProgressId = spExisting.id;
  } else {
    const { data: spCreated, error: spError } = await supabase
      .from("step_progress")
      .insert({
        chapter_progress_id: chapterProgressId,
        step_id: step.id,
      })
      .select("id")
      .single();
    if (spError || !spCreated) {
      throw new Error(`Failed to create step_progress: ${spError?.message ?? "unknown error"}`);
    }
    stepProgressId = spCreated.id;
  }

  return { enrollmentId, chapterProgressId, stepProgressId };
}

/**
 * Reveals a hint tier by inserting a hint_views row.
 * Returns the hint text from config.
 */
export async function galleryRevealHint(
  chapterId: string,
  stepIndex: number,
  tier: number,
): Promise<{ hint: string } | null> {
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
  let hintText = config.hints?.[tier - 1];
  // Per-question hints with tier offset
  if (hintText === undefined && config.questions) {
    let tierOffset = 0;
    for (const q of config.questions) {
      if (q.hints) {
        const localIndex = tier - tierOffset - 1;
        if (localIndex >= 0 && localIndex < q.hints.length) {
          hintText = q.hints[localIndex];
          break;
        }
        tierOffset += q.hints.length;
      }
    }
  }
  if (hintText === undefined) return null;

  // Setup to get a step_progress_id
  const { stepProgressId } = await gallerySetup(chapterId, stepIndex);

  const supabase = createAdminClient();
  await supabase.from("hint_views").insert({
    step_progress_id: stepProgressId,
    hint_tier: tier,
  });

  return { hint: hintText };
}

/**
 * Records a quest answer in the DB.
 */
export async function galleryRecordAnswer(
  chapterId: string,
  stepIndex: number,
  questionIndex: number,
  selectedOption: string,
  correct: boolean,
): Promise<void> {
  const { stepProgressId } = await gallerySetup(chapterId, stepIndex);

  const supabase = createAdminClient();
  await supabase.from("quest_answers").insert({
    step_progress_id: stepProgressId,
    question_index: questionIndex,
    selected_option: selectedOption,
    correct,
  });
}

/**
 * Validates a passphrase against the config value (case-insensitive).
 */
export async function galleryValidatePassphrase(
  passphrase: string,
  configPassphrase: string,
): Promise<{ success: boolean; error?: string }> {
  if (passphrase.trim().toLowerCase() === configPassphrase.trim().toLowerCase()) {
    return { success: true };
  }
  return { success: false, error: "The words are not yet known to you." };
}

/**
 * Deletes a step_progress row (ON DELETE CASCADE clears hint_views, quest_answers).
 */
export async function galleryCleanup(
  stepProgressId: string,
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("step_progress").delete().eq("id", stepProgressId);
}
