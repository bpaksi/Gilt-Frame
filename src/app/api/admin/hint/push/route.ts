import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/log";
import {
  gameConfig,
  getOrderedSteps,
  type HintItem,
} from "@/config/chapters";

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

  const config = step.config as { hints?: HintItem[] };
  const hintItem = config.hints?.find((h) => h.tier === hintTier);
  if (!hintItem && !overrideContent) {
    return NextResponse.json(
      { error: "Hint tier not found and no override provided." },
      { status: 404 }
    );
  }

  const supabase = createAdminClient();

  // Record the hint view (same as player-side revealHint)
  await supabase.from("hint_views").insert({
    track,
    chapter_id: chapterId,
    step_index: stepIndex,
    hint_tier: hintTier,
  });

  await supabase.from("player_events").insert({
    track,
    event_type: "hint_pushed",
    details: {
      chapter_id: chapterId,
      step_index: stepIndex,
      hint_tier: hintTier,
      admin_pushed: true,
    },
  });

  await logAdminAction("push_hint", {
    track,
    chapterId,
    stepIndex,
    hintTier,
  });

  return NextResponse.json({
    success: true,
    hint: overrideContent ?? hintItem?.hint,
  });
}
