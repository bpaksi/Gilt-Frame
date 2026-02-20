import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { scheduleStep } from "@/lib/messaging/send";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { track, chapterId, progressKey, delayHours } = await request.json();

  if (!track || !chapterId || !progressKey || typeof delayHours !== "number") {
    return NextResponse.json(
      { error: "track, chapterId, progressKey, and delayHours are required." },
      { status: 400 }
    );
  }

  await scheduleStep(track, chapterId, progressKey, delayHours);

  return NextResponse.json({ success: true, delayHours });
}
