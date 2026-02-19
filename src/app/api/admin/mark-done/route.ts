import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/log";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { track, chapterId, progressKey } = await request.json();

  if (!track || !chapterId || !progressKey) {
    return NextResponse.json(
      { error: "track, chapterId, and progressKey are required." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("message_progress")
    .update({
      status: "delivered",
      delivered_at: new Date().toISOString(),
    })
    .eq("track", track)
    .eq("progress_key", progressKey)
    .eq("status", "sent")
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "No sent message found to mark as delivered." },
      { status: 404 }
    );
  }

  await logAdminAction("mark_done", {
    chapter_id: chapterId,
    progress_key: progressKey,
  }, track);

  return NextResponse.json({ success: true });
}
