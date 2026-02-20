import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendStep } from "@/lib/messaging/send";

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized invocations
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find all scheduled steps that are due (scheduled_at <= now, not yet completed)
  const { data: due, error } = await supabase
    .from("step_progress")
    .select("id, step_id, scheduled_at, chapter_progress:chapter_progress_id(id, chapter_id, track)")
    .not("scheduled_at", "is", null)
    .is("completed_at", null)
    .lte("scheduled_at", new Date().toISOString());

  if (error) {
    console.error("[cron/send-scheduled] Query error:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const row of due) {
    const cp = row.chapter_progress as unknown as { id: string; chapter_id: string; track: string } | null;
    if (!cp) {
      errors.push(`No chapter_progress for step_progress ${row.id}`);
      continue;
    }

    const track = cp.track as "test" | "live";
    const result = await sendStep(track, cp.chapter_id, row.step_id);

    if (result.success) {
      sent++;
    } else {
      errors.push(`${row.step_id}: ${result.error}`);
    }
  }

  console.log("[cron/send-scheduled]", { sent, errors });
  return NextResponse.json({ sent, errors: errors.length > 0 ? errors : undefined });
}
