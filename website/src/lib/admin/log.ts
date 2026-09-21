import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

export async function logAdminAction(
  actionType: string,
  details?: Record<string, unknown>,
  track?: "test" | "live"
): Promise<void> {
  return logActivity("admin", actionType, details, track);
}

export async function logActivity(
  source: "player" | "admin" | "system",
  eventType: string,
  details?: Record<string, unknown>,
  track?: "test" | "live" | null
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("activity_log").insert({
    track: track ?? null,
    source,
    event_type: eventType,
    details: (details ?? null) as Json,
  });
}
