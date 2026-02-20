import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/log";
import { gameConfig, getOrderedSteps } from "@/config";
import { getCurrentStepIndex } from "@/lib/actions/quest";
import { autoAdvanceMessagingSteps } from "@/lib/actions/quest";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { track, chapterId, stepId } = await request.json();

  if (!track || !chapterId || !stepId) {
    return NextResponse.json(
      { error: "track, chapterId, and stepId are required." },
      { status: 400 }
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

  // Verify chapter is active
  const { data: cp } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", track)
    .eq("chapter_id", chapterId)
    .is("completed_at", null)
    .single();

  if (!cp) {
    return NextResponse.json(
      { error: "Chapter is not active." },
      { status: 400 }
    );
  }

  // Verify this is actually the current step
  const currentIndex = await getCurrentStepIndex(supabase, cp.id);
  if (currentIndex !== stepIndex) {
    return NextResponse.json(
      { error: "Step is not the current active step." },
      { status: 400 }
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
  await supabase
    .from("step_progress")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", spId);

  const currentStep = orderedSteps[stepIndex];

  await logAdminAction("complete_step", {
    chapter_id: chapterId,
    step_id: stepId,
    step_name: currentStep.name,
    step_index: stepIndex,
  }, track);

  // Auto-advance any consecutive auto-triggered messaging steps
  await autoAdvanceMessagingSteps(track, chapterId, stepIndex);

  // Check if all steps are now completed — if so, complete the chapter
  const { count } = await supabase
    .from("step_progress")
    .select("*", { count: "exact", head: true })
    .eq("chapter_progress_id", cp.id)
    .not("completed_at", "is", null);

  if ((count ?? 0) >= orderedSteps.length) {
    await supabase
      .from("chapter_progress")
      .update({ completed_at: new Date().toISOString() })
      .eq("track", track)
      .eq("chapter_id", chapterId)
      .is("completed_at", null);
  }

  return NextResponse.json({ success: true });
}
