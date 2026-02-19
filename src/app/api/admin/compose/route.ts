import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { sendAdHocMessage } from "@/lib/messaging/send";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { track, channel, to, body, subject } = await request.json();

  if (!track || !channel || !to || !body) {
    return NextResponse.json(
      { error: "track, channel, to, and body are required." },
      { status: 400 }
    );
  }

  const result = await sendAdHocMessage(track, channel, to, body, subject);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result);
}
