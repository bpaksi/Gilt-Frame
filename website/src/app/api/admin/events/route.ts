import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { getPlayerEvents } from "@/lib/admin/actions";

export async function GET(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const track = (request.nextUrl.searchParams.get("track") ?? "test") as
    | "test"
    | "live";
  const chapterId = request.nextUrl.searchParams.get("chapterId") ?? undefined;
  const typesParam = request.nextUrl.searchParams.get("types");
  const eventTypes = typesParam ? typesParam.split(",") : undefined;

  const events = await getPlayerEvents(track, { chapterId, eventTypes });
  return NextResponse.json({ events });
}
