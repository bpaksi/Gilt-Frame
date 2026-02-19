import { createAdminClient } from "@/lib/supabase/admin";

export async function logAdminAction(
  actionType: string,
  details?: Record<string, unknown>
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("admin_activity_log").insert({
    action_type: actionType,
    details: (details ?? null) as import("@/lib/supabase/types").Json,
  });
}
