import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  gameConfig,
  getOrderedSteps,
} from "@/config";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { track, chapterId, stepIndex, hintTier, overrideContent } =
    await request.json();

  if (!track || !chapterId || stepIndex === undefined || !hintTier) {
    return NextResponse.json(
      { error: "track, chapterId, stepIndex, and hintTier are required." },
      { status: 400 }
    );
  }

  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found." }, { status: 404 });
  }

  const orderedSteps = getOrderedSteps(chapter);
  const step = orderedSteps[stepIndex];
  if (!step || step.type !== "website") {
    return NextResponse.json(
      { error: "Invalid step index or not a website step." },
      { status: 400 }
    );
  }

  const config = step.config as { hints?: string[] };
  const hintText = config.hints?.[hintTier - 1];
  if (hintText === undefined && !overrideContent) {
    return NextResponse.json(
      { error: "Hint tier not found and no override provided." },
      { status: 404 }
    );
  }

  const supabase = createAdminClient();

  // Get chapter_progress id
  const { data: cp } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", track)
    .eq("chapter_id", chapterId)
    .single();

  if (!cp) {
    return NextResponse.json(
      { error: "Chapter not active." },
      { status: 404 }
    );
  }

  // Get or create step_progress
  let { data: sp } = await supabase
    .from("step_progress")
    .select("id")
    .eq("chapter_progress_id", cp.id)
    .eq("step_id", step.id)
    .single();

  if (!sp) {
    const { data: created } = await supabase
      .from("step_progress")
      .insert({ chapter_progress_id: cp.id, step_id: step.id })
      .select("id")
      .single();
    sp = created;
  }

  if (!sp) {
    return NextResponse.json(
      { error: "Could not create step progress." },
      { status: 500 }
    );
  }

  // Record the hint view via step_progress FK
  await supabase.from("hint_views").insert({
    step_progress_id: sp.id,
    hint_tier: hintTier,
  });

  await supabase.from("activity_log").insert({
    track,
    source: "admin",
    event_type: "hint_pushed",
    details: {
      chapter_id: chapterId,
      step_id: step.id,
      hint_tier: hintTier,
      admin_pushed: true,
    },
  });

  return NextResponse.json({
    success: true,
    hint: overrideContent ?? hintText,
  });
}
