import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { activateChapter } from "@/lib/admin/actions";
import { logAdminAction } from "@/lib/admin/log";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { track?: unknown; chapterId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { track, chapterId } = body;

  if (!track || !chapterId || (track !== "test" && track !== "live")) {
    return NextResponse.json(
      { error: "track and chapterId are required." },
      { status: 400 }
    );
  }

  const validTrack = track as "test" | "live";
  const result = await activateChapter(validTrack, chapterId as string);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await logAdminAction("activate_chapter", { chapterId }, validTrack);
  return NextResponse.json({ success: true });
}
