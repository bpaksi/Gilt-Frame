import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendStep } from "@/lib/messaging/send";
import { gameConfig, getOrderedSteps } from "@/config";
import { autoAdvanceMessagingSteps } from "@/lib/actions/quest";

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(request: Request) {
  // Verify QStash signature
  const body = await request.text();
  const signature = request.headers.get("upstash-signature") ?? "";

  const isValid = await receiver.verify({
    body,
    signature,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/qstash`,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { track, chapterId, stepId } = JSON.parse(body) as {
    track: "test" | "live";
    chapterId: string;
    stepId: string;
  };

  // Idempotency: if already completed, no-op
  const supabase = createAdminClient();
  const { data: cp } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", track)
    .eq("chapter_id", chapterId)
    .single();

  if (cp) {
    const { data: sp } = await supabase
      .from("step_progress")
      .select("completed_at")
      .eq("chapter_progress_id", cp.id)
      .eq("step_id", stepId)
      .single();

    if (sp?.completed_at) {
      console.log("[qstash webhook] Step already completed, skipping:", { track, chapterId, stepId });
      return NextResponse.json({ ok: true, skipped: true });
    }
  }

  // Send the step
  const result = await sendStep(track, chapterId, stepId);
  if (!result.success) {
    console.error("[qstash webhook] sendStep failed:", { track, chapterId, stepId, error: result.error });
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Resume auto-advancement from this step
  const chapter = gameConfig.chapters[chapterId];
  if (chapter) {
    const orderedSteps = getOrderedSteps(chapter);
    const stepIndex = orderedSteps.findIndex((s) => s.id === stepId);
    if (stepIndex >= 0) {
      await autoAdvanceMessagingSteps(track, chapterId, stepIndex);
    }
  }

  return NextResponse.json({ ok: true });
}
