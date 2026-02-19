import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getPlayerState } from "@/lib/admin/actions";

export async function GET(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const track = (request.nextUrl.searchParams.get("track") ?? "test") as
    | "test"
    | "live";

  const state = await getPlayerState(track);
  return NextResponse.json(state);
}
