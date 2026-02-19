"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { resolveTrack } from "@/lib/track";

export async function createMoment(
  chapterId: string,
  narrativeText: string,
  momentType: "quest_complete" | "chapter_start" | "chapter_complete" | "summons_received"
): Promise<{ shareToken: string } | null> {
  const trackInfo = await resolveTrack();
  if (!trackInfo) return null;

  const shareToken = generateShareToken();
  const supabase = createAdminClient();

  const { error } = await supabase.from("moments").insert({
    quest_id: chapterId,
    chapter_id: chapterId,
    narrative_text: narrativeText,
    moment_type: momentType,
    share_token: shareToken,
    track: trackInfo.track,
  });

  if (error) return null;
  return { shareToken };
}

function generateShareToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const bytes = new Uint8Array(21);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 21; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
