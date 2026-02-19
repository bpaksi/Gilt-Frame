import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { sendStep } from "@/lib/messaging/send";

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

  return NextResponse.json(result);
}
