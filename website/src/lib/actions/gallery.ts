"use server";

import { gameConfig, getOrderedSteps } from "@/config";

/**
 * Returns fake IDs so quest components can mount in the gallery
 * without any database writes.
 */
export async function gallerySetup(
  chapterId: string,
  stepIndex: number,
): Promise<{
  chapterProgressId: string;
  stepProgressId: string;
}> {
  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) throw new Error(`Unknown chapter: ${chapterId}`);
  const orderedSteps = getOrderedSteps(chapter);
  const step = orderedSteps[stepIndex];
  if (!step)
    throw new Error(
      `Step index ${stepIndex} out of range for chapter ${chapterId}`,
    );

  return {
    chapterProgressId: `gallery-cp-${chapterId}`,
    stepProgressId: `gallery-sp-${chapterId}-${stepIndex}`,
  };
}

/**
 * Returns the hint text from config without writing to the DB.
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

  return { hint: hintText };
}

/**
 * No-op in gallery mode — accepts the call signature so
 * quest components work unchanged.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function galleryRecordAnswer(chapterId: string, stepIndex: number, questionIndex: number, selectedOption: string, correct: boolean): Promise<void> {}

/**
 * Validates a passphrase against the config value (case-insensitive).
 */
export async function galleryValidatePassphrase(
  passphrase: string,
  configPassphrase: string,
): Promise<{ success: boolean; error?: string }> {
  if (
    passphrase.trim().toLowerCase() === configPassphrase.trim().toLowerCase()
  ) {
    return { success: true };
  }
  return { success: false, error: "The words are not yet known to you." };
}

/**
 * No-op in gallery mode — nothing to clean up.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function galleryCleanup(stepProgressId: string): Promise<void> {}
