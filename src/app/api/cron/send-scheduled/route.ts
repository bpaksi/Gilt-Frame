import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendStep } from "@/lib/messaging/send";
import { gameConfig, getOrderedSteps } from "@/config";

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized invocations
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Find all scheduled messages that are due
  const { data: due, error } = await supabase
    .from("message_progress")
    .select("*")
    .eq("status", "scheduled")
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
    // Find the chapter that owns this progress_key
    const chapterId = findChapterByProgressKey(row.progress_key);
    if (!chapterId) {
      errors.push(`No chapter for progress_key "${row.progress_key}"`);
      continue;
    }

    const track = row.track as "test" | "live";
    const result = await sendStep(track, chapterId, row.progress_key);

    if (result.success) {
      sent++;
    } else {
      errors.push(`${row.progress_key}: ${result.error}`);
    }
  }

  console.log("[cron/send-scheduled]", { sent, errors });
  return NextResponse.json({ sent, errors: errors.length > 0 ? errors : undefined });
}

function findChapterByProgressKey(progressKey: string): string | null {
  for (const [chapterId, chapter] of Object.entries(gameConfig.chapters)) {
    const steps = getOrderedSteps(chapter);
    for (const step of steps) {
      if (step.type !== "website" && step.config.progress_key === progressKey) {
        return chapterId;
      }
    }
  }
  return null;
}
