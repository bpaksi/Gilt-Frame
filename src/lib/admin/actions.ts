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
  const stepIndex = await getCurrentStepIndex(
    supabase,
    track,
    progress.chapter_id
  );
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
  track: string;
  progress_key: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  companion_status: string;
  companion_sent_at: string | null;
  error: string | null;
  created_at: string;
};

export async function getAllMessageProgress(
  track: "test" | "live"
): Promise<MessageProgressRow[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("message_progress")
    .select("*")
    .eq("track", track)
    .order("created_at", { ascending: true });

  return (data ?? []) as MessageProgressRow[];
}

export async function getChapterMessageProgress(
  track: "test" | "live",
  chapterId: string
): Promise<MessageProgressRow[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("message_progress")
    .select("*")
    .eq("track", track)
    .like("progress_key", `${chapterId}.%`)
    .order("created_at", { ascending: true });

  return (data ?? []) as MessageProgressRow[];
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

  // Get all completed steps for this track, grouped by chapter
  const { data } = await supabase
    .from("completed_steps")
    .select("chapter_id")
    .eq("track", track);

  if (!data || data.length === 0) return [];

  // Count by chapter_id
  const counts = new Map<string, number>();
  for (const row of data) {
    counts.set(row.chapter_id, (counts.get(row.chapter_id) ?? 0) + 1);
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
  const progressKeys = orderedSteps
    .filter((s) => s.type !== "website")
    .map((s) => s.config.progress_key);

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("complete_chapter", {
    p_track: track,
    p_chapter_id: chapterId,
    p_step_ids: stepIds,
    p_progress_keys: progressKeys,
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
    // Reactivate: clear completed_at and remove completed steps
    await supabase
      .from("chapter_progress")
      .update({ completed_at: null })
      .eq("track", track)
      .eq("chapter_id", chapterId);

    await supabase
      .from("completed_steps")
      .delete()
      .eq("track", track)
      .eq("chapter_id", chapterId);
  } else {
    await supabase.from("chapter_progress").insert({
      track,
      chapter_id: chapterId,
    });
  }

  return { success: true };
}
