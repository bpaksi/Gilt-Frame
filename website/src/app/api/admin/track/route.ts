import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { setAdminTrack } from "@/lib/admin/track";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { track } = await request.json();

  if (track !== "test" && track !== "live") {
    return NextResponse.json(
      { error: "Track must be 'test' or 'live'." },
      { status: 400 }
    );
  }

  await setAdminTrack(track);
  return NextResponse.json({ success: true, track });
}
