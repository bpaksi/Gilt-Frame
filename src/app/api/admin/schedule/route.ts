import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { scheduleStep } from "@/lib/messaging/send";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { track, chapterId, stepId, delayHours } = await request.json();

  if (!track || !chapterId || !stepId || typeof delayHours !== "number") {
    return NextResponse.json(
      { error: "track, chapterId, stepId, and delayHours are required." },
      { status: 400 }
    );
  }

  await scheduleStep(track, chapterId, stepId, delayHours);

  return NextResponse.json({ success: true, delayHours });
}
