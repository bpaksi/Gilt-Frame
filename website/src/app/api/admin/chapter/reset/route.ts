import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { resetTrack } from "@/lib/admin/actions";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { track } = await request.json();

  if (!track) {
    return NextResponse.json(
      { error: "track is required." },
      { status: 400 }
    );
  }

  const result = await resetTrack(track);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
