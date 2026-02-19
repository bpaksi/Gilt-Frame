import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { chaptersConfig } from "@/lib/chapters";

const prologue = chaptersConfig.chapters["prologue"];
const PASSPHRASE = prologue?.passphrase;

export async function POST(request: NextRequest) {
  // Verify device_token cookie is enrolled and not revoked
  const cookieStore = await cookies();
  const deviceTokenCookie = cookieStore.get("device_token");

  if (!deviceTokenCookie?.value) {
    return NextResponse.json(
      { error: "You are not the one." },
      { status: 401 }
    );
  }

  const supabase = createAdminClient();
  const { data: enrollment } = await supabase
    .from("device_enrollments")
    .select("id")
    .eq("device_token", deviceTokenCookie.value)
    .eq("revoked", false)
    .single();

  if (!enrollment) {
    return NextResponse.json(
      { error: "You are not the one." },
      { status: 401 }
    );
  }

  if (!PASSPHRASE) {
    return NextResponse.json(
      { error: "The Order is not yet ready." },
      { status: 503 }
    );
  }

  const { passphrase } = await request.json();

  if (!passphrase || typeof passphrase !== "string") {
    return NextResponse.json(
      { error: "You have not been summoned." },
      { status: 400 }
    );
  }

  if (passphrase.trim().toUpperCase() !== PASSPHRASE.toUpperCase()) {
    return NextResponse.json(
      { error: "You have not been summoned." },
      { status: 401 }
    );
  }

  // Update last_seen
  supabase
    .from("device_enrollments")
    .update({ last_seen: new Date().toISOString() })
    .eq("device_token", deviceTokenCookie.value)
    .then(() => {});

  const response = NextResponse.json({ success: true });
  response.cookies.set("session", crypto.randomUUID(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}
