"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { chaptersConfig, getOrderedFlow } from "@/config/chapters";

export type PlayerState = {
  track: "test" | "live";
  chapterId: string | null;
  chapterName: string | null;
  location: string | null;
  flowIndex: number;
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
    .eq("status", "active")
    .single();

  if (!progress) {
    return {
      track,
      chapterId: null,
      chapterName: null,
      location: null,
      flowIndex: 0,
      stepName: null,
      status: "idle",
      lastActivity: null,
      lastActionSummary: null,
    };
  }

  const chapter = chaptersConfig.chapters[progress.chapter_id];
  const orderedFlow = chapter ? getOrderedFlow(chapter) : [];
  const currentStep = orderedFlow[progress.current_flow_index];

  // Get last event for this track
  const { data: lastEvent } = await supabase
    .from("player_events")
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
    flowIndex: progress.current_flow_index,
    stepName: currentStep?.name ?? null,
    status: progress.status,
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
    .from("player_events")
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
  status: string;
  current_flow_index: number;
  started_at: string;
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

export async function resetChapter(
  track: "test" | "live",
  chapterId: string
): Promise<{ success: boolean; error?: string }> {
  if (track !== "test") {
    return { success: false, error: "Reset is only allowed on the test track." };
  }

  const supabase = createAdminClient();

  // Delete chapter progress
  await supabase
    .from("chapter_progress")
    .delete()
    .eq("track", "test")
    .eq("chapter_id", chapterId);

  // Delete message progress for this chapter
  await supabase
    .from("message_progress")
    .delete()
    .eq("track", "test")
    .like("progress_key", `${chapterId}.%`);

  // Delete quest answers
  await supabase
    .from("quest_answers")
    .delete()
    .eq("track", "test")
    .eq("chapter_id", chapterId);

  // Delete hint views
  await supabase
    .from("hint_views")
    .delete()
    .eq("track", "test")
    .eq("chapter_id", chapterId);

  // Delete player events for this chapter
  await supabase
    .from("player_events")
    .delete()
    .eq("track", "test")
    .filter("details->>chapter_id", "eq", chapterId);

  return { success: true };
}

export async function activateChapter(
  track: "test" | "live",
  chapterId: string
): Promise<{ success: boolean; error?: string }> {
  const chapter = chaptersConfig.chapters[chapterId];
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
    // Reactivate
    await supabase
      .from("chapter_progress")
      .update({ status: "active", current_flow_index: 0 })
      .eq("track", track)
      .eq("chapter_id", chapterId);
  } else {
    await supabase.from("chapter_progress").insert({
      track,
      chapter_id: chapterId,
      status: "active",
      current_flow_index: 0,
    });
  }

  return { success: true };
}
