import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { scheduleStep } from "@/lib/messaging/send";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { track, chapterId, stepId, delayMornings } = await request.json();

  if (!track || !chapterId || !stepId || typeof delayMornings !== "number") {
    return NextResponse.json(
      { error: "track, chapterId, stepId, and delayMornings are required." },
      { status: 400 }
    );
  }

  await scheduleStep(track, chapterId, stepId, delayMornings);

  return NextResponse.json({ success: true, delayMornings });
}
