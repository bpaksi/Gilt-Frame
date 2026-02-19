import { createAdminClient } from "@/lib/supabase/admin";

export async function logAdminAction(
  actionType: string,
  details?: Record<string, unknown>,
  track?: "test" | "live"
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("activity_log").insert({
    track: track ?? null,
    source: "admin",
    event_type: actionType,
    details: (details ?? null) as import("@/lib/supabase/types").Json,
  });
}
