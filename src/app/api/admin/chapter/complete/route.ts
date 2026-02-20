import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { completeChapter } from "@/lib/admin/actions";
import { logAdminAction } from "@/lib/admin/log";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { track, chapterId } = await request.json();

  if (!track || !chapterId) {
    return NextResponse.json(
      { error: "track and chapterId are required." },
      { status: 400 }
    );
  }

  const result = await completeChapter(track, chapterId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await logAdminAction("complete_chapter", { chapterId }, track);
  return NextResponse.json({ success: true });
}
