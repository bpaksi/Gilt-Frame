import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/log";
import { gameConfig, getOrderedSteps, formatStepKey } from "@/config";
import { autoAdvanceMessagingSteps } from "@/lib/actions/quest";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { track, chapterId, stepId } = await request.json();

  if (!track || !chapterId || !stepId) {
    return NextResponse.json(
      { error: "track, chapterId, and stepId are required." },
      { status: 400 },
    );
  }

  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
  }

  const orderedSteps = getOrderedSteps(chapter);
  const stepIndex = orderedSteps.findIndex((s) => s.id === stepId);
  if (stepIndex === -1) {
    return NextResponse.json({ error: "Step not found." }, { status: 404 });
  }

  const supabase = createAdminClient();

  // Find or create an active chapter_progress row
  let { data: cp } = await supabase
    .from("chapter_progress")
    .select("id, current_step_id")
    .eq("track", track)
    .eq("chapter_id", chapterId)
    .is("completed_at", null)
    .single();

  if (!cp) {
    // Check if a completed row already exists (reactivate it)
    const { data: existing } = await supabase
      .from("chapter_progress")
      .select("id")
      .eq("track", track)
      .eq("chapter_id", chapterId)
      .single();

    if (existing) {
      await supabase
        .from("chapter_progress")
        .update({ completed_at: null, current_step_id: stepId })
        .eq("id", existing.id);
      cp = { id: existing.id, current_step_id: stepId };
    } else {
      const { data: created, error: insertErr } = await supabase
        .from("chapter_progress")
        .insert({ track, chapter_id: chapterId, current_step_id: stepId })
        .select("id, current_step_id")
        .single();

      if (insertErr || !created) {
        return NextResponse.json(
          { error: "Failed to activate chapter." },
          { status: 500 },
        );
      }
      cp = created;
    }
  }

  // Verify this is actually the current step via pointer
  if (cp.current_step_id !== stepId) {
    return NextResponse.json(
      { error: "Step is not the current active step." },
      { status: 400 },
    );
  }

  // Ensure step_progress row exists
  const { data: existingSp } = await supabase
    .from("step_progress")
    .select("id")
    .eq("chapter_progress_id", cp.id)
    .eq("step_id", stepId)
    .single();

  let spId: string;
  if (existingSp) {
    spId = existingSp.id;
  } else {
    const { data: created } = await supabase
      .from("step_progress")
      .insert({
        chapter_progress_id: cp.id,
        step_id: stepId,
        completed_at: null,
      })
      .select("id")
      .single();
    spId = created!.id;
  }

  // Mark as completed
  const { error: spError } = await supabase
    .from("step_progress")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", spId);

  if (spError) {
    console.error(
      "[complete-step] Failed to set step_progress.completed_at:",
      spError,
    );
    return NextResponse.json(
      { error: `Step progress update failed: ${spError.message}` },
      { status: 500 },
    );
  }

  await logAdminAction(
    "complete_step",
    {
      chapter_id: chapterId,
      step_id: stepId,
      step_name: formatStepKey(stepId),
      step_index: stepIndex,
    },
    track,
  );

  // Auto-advance any consecutive auto-triggered messaging steps + handle chapter completion
  await autoAdvanceMessagingSteps(track, chapterId, stepIndex);

  return NextResponse.json({ success: true });
}
