"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { gameConfig, getOrderedSteps } from "@/config";
import { getCurrentStepIndex } from "@/lib/actions/quest";

export type PlayerState = {
  track: "test" | "live";
  chapterId: string | null;
  chapterName: string | null;
  location: string | null;
  stepIndex: number;
  stepName: string | null;
  status: string;
  lastActivity: string | null;
  lastActionSummary: string | null;
};

export async function getPlayerState(
  track: "test" | "live"
): Promise<PlayerState> {
  const supabase = createAdminClient();

  const { data: progress } = await supabase
    .from("chapter_progress")
    .select("*")
    .eq("track", track)
    .is("completed_at", null)
    .single();

  if (!progress) {
    return {
      track,
      chapterId: null,
      chapterName: null,
      location: null,
      stepIndex: 0,
      stepName: null,
      status: "idle",
      lastActivity: null,
      lastActionSummary: null,
    };
  }

  const chapter = gameConfig.chapters[progress.chapter_id];
  const orderedSteps = chapter ? getOrderedSteps(chapter) : [];
  const stepIndex = await getCurrentStepIndex(supabase, progress.id);
  const currentStep = orderedSteps[stepIndex];

  // Get last event for this track
  const { data: lastEvent } = await supabase
    .from("activity_log")
    .select("event_type, created_at, details")
    .eq("track", track)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return {
    track,
    chapterId: progress.chapter_id,
    chapterName: chapter?.name ?? progress.chapter_id,
    location: chapter?.location ?? null,
    stepIndex,
    stepName: currentStep?.name ?? null,
    status: "active",
    lastActivity: lastEvent?.created_at ?? progress.started_at,
    lastActionSummary: lastEvent
      ? `${lastEvent.event_type}: ${(lastEvent.details as Record<string, unknown>)?.step_name ?? ""}`
      : null,
  };
}

export type MessageProgressRow = {
  id: string;
  step_progress_id: string | null;
  to: string;
  status: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  error: string | null;
  created_at: string | null;
  step_id?: string;
};

export async function getAllMessageProgress(
  track: "test" | "live"
): Promise<MessageProgressRow[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("message_progress")
    .select("*, step_progress:step_progress_id(step_id, chapter_progress:chapter_progress_id(track))")
    .order("created_at", { ascending: true });

  if (!data) return [];

  // Filter by track via the FK join and flatten
  return data
    .filter((row) => {
      const sp = row.step_progress as unknown as { chapter_progress: { track: string } } | null;
      return sp?.chapter_progress?.track === track;
    })
    .map((row) => {
      const sp = row.step_progress as unknown as { step_id: string } | null;
      return {
        id: row.id,
        step_progress_id: row.step_progress_id,
        to: row.to,
        status: row.status,
        sent_at: row.sent_at,
        delivered_at: row.delivered_at,
        error: row.error,
        created_at: row.created_at,
        step_id: sp?.step_id,
      };
    });
}

export async function getChapterMessageProgress(
  track: "test" | "live",
  chapterId: string
): Promise<MessageProgressRow[]> {
  const supabase = createAdminClient();

  // Get chapter_progress id for this track+chapter
  const { data: cp } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", track)
    .eq("chapter_id", chapterId)
    .single();

  if (!cp) return [];

  // Get all step_progress ids for this chapter
  const { data: stepProgressRows } = await supabase
    .from("step_progress")
    .select("id, step_id")
    .eq("chapter_progress_id", cp.id);

  if (!stepProgressRows || stepProgressRows.length === 0) return [];

  const spIds = stepProgressRows.map((sp) => sp.id);
  const spIdToStepId = new Map(stepProgressRows.map((sp) => [sp.id, sp.step_id]));

  // Get message_progress for those step_progress ids
  const { data } = await supabase
    .from("message_progress")
    .select("*")
    .in("step_progress_id", spIds)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    step_progress_id: row.step_progress_id,
    to: row.to,
    status: row.status,
    sent_at: row.sent_at,
    delivered_at: row.delivered_at,
    error: row.error,
    created_at: row.created_at,
    step_id: (row.step_progress_id && spIdToStepId.get(row.step_progress_id)) ?? undefined,
  }));
}

export type PlayerEvent = {
  id: string;
  track: string;
  source: string;
  event_type: string;
  details: Record<string, unknown> | null;
  created_at: string;
};

export async function getPlayerEvents(
  track: "test" | "live",
  filters?: { chapterId?: string; eventTypes?: string[] }
): Promise<PlayerEvent[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("activity_log")
    .select("*")
    .eq("track", track)
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters?.chapterId) {
    query = query.eq("details->>chapter_id", filters.chapterId);
  }

  if (filters?.eventTypes && filters.eventTypes.length > 0) {
    query = query.in("event_type", filters.eventTypes);
  }

  const { data } = await query;
  return (data ?? []) as PlayerEvent[];
}

export type ChapterProgressRow = {
  id: string;
  track: string;
  chapter_id: string;
  started_at: string;
  completed_at: string | null;
};

export async function getAllChapterProgress(
  track: "test" | "live"
): Promise<ChapterProgressRow[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("chapter_progress")
    .select("*")
    .eq("track", track);

  return (data ?? []) as ChapterProgressRow[];
}

export type CompletedStepCount = {
  chapter_id: string;
  count: number;
};

export async function getCompletedStepCounts(
  track: "test" | "live"
): Promise<CompletedStepCount[]> {
  const supabase = createAdminClient();

  // Get chapter_progress ids for this track
  const { data: chapters } = await supabase
    .from("chapter_progress")
    .select("id, chapter_id")
    .eq("track", track);

  if (!chapters || chapters.length === 0) return [];

  const cpIds = chapters.map((cp) => cp.id);

  // Count step_progress rows per chapter_progress_id where completed_at IS NOT NULL
  const { data } = await supabase
    .from("step_progress")
    .select("chapter_progress_id")
    .in("chapter_progress_id", cpIds)
    .not("completed_at", "is", null);

  if (!data || data.length === 0) return [];

  // Map chapter_progress_id → chapter_id
  const cpIdToChapterId = new Map(chapters.map((cp) => [cp.id, cp.chapter_id]));

  // Count by chapter_id
  const counts = new Map<string, number>();
  for (const row of data) {
    const chapterId = cpIdToChapterId.get(row.chapter_progress_id);
    if (chapterId) {
      counts.set(chapterId, (counts.get(chapterId) ?? 0) + 1);
    }
  }

  return Array.from(counts, ([chapter_id, count]) => ({ chapter_id, count }));
}

export async function resetTrack(
  track: "test" | "live"
): Promise<{ success: boolean; error?: string }> {
  if (track !== "test") {
    return { success: false, error: "Reset is only allowed on the test track." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("reset_track", { p_track: track });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function completeChapter(
  track: "test" | "live",
  chapterId: string
): Promise<{ success: boolean; error?: string }> {
  if (track !== "test") {
    return { success: false, error: "Complete chapter is only allowed on the test track." };
  }

  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) {
    return { success: false, error: "Chapter not found." };
  }

  const orderedSteps = getOrderedSteps(chapter);
  const stepIds = orderedSteps.map((s) => s.id);
  // For each step, provide the recipient (messaging steps) or empty string (website steps)
  const stepRecipients = orderedSteps.map((s) =>
    s.type !== "website" ? s.config.to : ""
  );

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("complete_chapter", {
    p_track: track,
    p_chapter_id: chapterId,
    p_step_ids: stepIds,
    p_step_recipients: stepRecipients,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function activateChapter(
  track: "test" | "live",
  chapterId: string
): Promise<{ success: boolean; error?: string }> {
  if (track !== "test") {
    return { success: false, error: "Chapter activation is only allowed on the test track." };
  }

  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) {
    return { success: false, error: "Chapter not found." };
  }

  const supabase = createAdminClient();

  // Check if already active
  const { data: existing } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", track)
    .eq("chapter_id", chapterId)
    .single();

  if (existing) {
    // Reactivate: clear completed_at; cascade-delete step_progress children
    await supabase
      .from("chapter_progress")
      .update({ completed_at: null })
      .eq("track", track)
      .eq("chapter_id", chapterId);

    // Delete step_progress rows (hint_views, quest_answers, message_progress cascade)
    await supabase
      .from("step_progress")
      .delete()
      .eq("chapter_progress_id", existing.id);
  } else {
    await supabase.from("chapter_progress").insert({
      track,
      chapter_id: chapterId,
    });
  }

  return { success: true };
}
