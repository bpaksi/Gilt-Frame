"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MomentMetadata, QAReplay, MomentType } from "@/config";

// ─── Row Type ────────────────────────────────────────────────────────────────

export type MomentRow = {
  id: string;
  quest_id: string | null;
  chapter_id: string | null;
  narrative_text: string | null;
  moment_type: string;
  share_token: string;
  assets: unknown;
  metadata: MomentMetadata | null;
  step_id: string | null;
  created_at: string;
  track: string;
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getMoments(track: "test" | "live"): Promise<MomentRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("moments")
    .select("*")
    .eq("track", track)
    .order("created_at", { ascending: true });
  return (data as MomentRow[]) ?? [];
}

export async function getMomentById(
  id: string,
  track: "test" | "live"
): Promise<MomentRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("moments")
    .select("*")
    .eq("id", id)
    .eq("track", track)
    .single();
  return (data as MomentRow) ?? null;
}

export async function getMomentByShareToken(
  token: string
): Promise<MomentRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("moments")
    .select("*")
    .eq("share_token", token)
    .single();
  return (data as MomentRow) ?? null;
}

// ─── Moment Creation ─────────────────────────────────────────────────────────

export async function createMoment(params: {
  track: "test" | "live";
  chapterId: string;
  stepId: string | null;
  momentType: MomentType;
  narrativeText: string;
  metadata: MomentMetadata;
}): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("moments").insert({
    track: params.track,
    chapter_id: params.chapterId,
    step_id: params.stepId,
    moment_type: params.momentType,
    narrative_text: params.narrativeText,
    metadata: params.metadata as unknown as Json,
    share_token: crypto.randomUUID(),
  });
}

// ─── Metadata Gathering Helpers ──────────────────────────────────────────────
// These read back data that was already recorded by quest.ts during gameplay.

/** Gather Q&A replay data from the quest_answers table for a given step_progress. */
export async function gatherQAMetadata(
  supabase: SupabaseClient,
  stepProgressId: string,
  questions: Array<{ question: string; correct_answer: string }>
): Promise<QAReplay[]> {
  const { data: answers } = await supabase
    .from("quest_answers")
    .select("question_index, selected_option, correct")
    .eq("step_progress_id", stepProgressId)
    .order("question_index", { ascending: true });

  if (!answers || answers.length === 0) return [];

  return answers.map((a) => {
    const q = questions[a.question_index];
    return {
      question: q?.question ?? `Question ${a.question_index + 1}`,
      selected: a.selected_option,
      correct_answer: q?.correct_answer ?? "",
      correct: a.correct,
    };
  });
}

/** Compute step duration in seconds from step_progress timestamps. */
export async function gatherStepDuration(
  supabase: SupabaseClient,
  stepProgressId: string
): Promise<number> {
  const { data: sp } = await supabase
    .from("step_progress")
    .select("started_at, completed_at")
    .eq("id", stepProgressId)
    .single();

  if (!sp?.started_at || !sp?.completed_at) return 0;

  const start = new Date(sp.started_at).getTime();
  const end = new Date(sp.completed_at).getTime();
  return Math.round((end - start) / 1000);
}

/** Gather hint tier numbers that were revealed for a step. */
export async function gatherHintUsage(
  supabase: SupabaseClient,
  stepProgressId: string
): Promise<number[]> {
  const { data: hints } = await supabase
    .from("hint_views")
    .select("hint_tier")
    .eq("step_progress_id", stepProgressId)
    .order("hint_tier", { ascending: true });

  return hints?.map((h) => h.hint_tier) ?? [];
}
