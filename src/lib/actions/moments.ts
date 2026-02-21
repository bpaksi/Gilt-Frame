"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type MomentRow = {
  id: string;
  quest_id: string | null;
  chapter_id: string | null;
  narrative_text: string | null;
  moment_type: string;
  share_token: string;
  assets: unknown;
  created_at: string;
  track: string;
};

export async function getMoments(track: "test" | "live"): Promise<MomentRow[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("moments")
    .select("*")
    .eq("track", track)
    .order("created_at", { ascending: false });
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
