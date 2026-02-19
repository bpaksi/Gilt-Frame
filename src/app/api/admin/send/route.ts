import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { sendStep } from "@/lib/messaging/send";
import { gameConfig, getOrderedSteps } from "@/config";
import { autoAdvanceMessagingSteps } from "@/lib/actions/quest";

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

  const result = await sendStep(track, chapterId, progressKey);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Auto-advance any consecutive auto-triggered steps after this one
  const chapter = gameConfig.chapters[chapterId];
  if (chapter) {
    const orderedSteps = getOrderedSteps(chapter);
    const stepIndex = orderedSteps.findIndex(
      (s) => s.type !== "website" && s.config.progress_key === progressKey
    );
    if (stepIndex >= 0) {
      await autoAdvanceMessagingSteps(track, chapterId, stepIndex);
    }
  }

  return NextResponse.json(result);
}
