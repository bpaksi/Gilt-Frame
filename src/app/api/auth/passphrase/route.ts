import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { gameConfig, getOrderedSteps, type PassphrasePuzzleConfig } from "@/config";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const prologue = gameConfig.chapters["prologue"];
const passphraseStep = prologue
  ? getOrderedSteps(prologue).find(
      (s) => s.type === "website" && s.component === "PassphrasePuzzle"
    )
  : null;
const PASSPHRASE = passphraseStep
  ? (passphraseStep.config as PassphrasePuzzleConfig).passphrase
  : undefined;

const limiter = createRateLimiter(10, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (!limiter.check(ip)) {
    return NextResponse.json(
      { error: "The wards are sealed. Return later." },
      { status: 429 }
    );
  }

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
    .select("id, track")
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
    limiter.record(ip);
    return NextResponse.json(
      { error: "You have not been summoned." },
      { status: 401 }
    );
  }

  const track = enrollment.track as "test" | "live";

  // Update last_seen
  supabase
    .from("device_enrollments")
    .update({ last_seen: new Date().toISOString() })
    .eq("device_token", deviceTokenCookie.value)
    .then(() => {});

  // Record passphrase_entered event
  supabase
    .from("activity_log")
    .insert({
      track,
      source: "player",
      event_type: "passphrase_entered",
      details: { chapter_id: "prologue", step_name: "The Passphrase" },
    })
    .then(() => {});

  // Record moment for journey page
  supabase
    .from("moments")
    .insert({
      track,
      chapter_id: "prologue",
      moment_type: "passphrase",
      narrative_text: "The acrostic revealed its truth. The Order heard.",
      share_token: crypto.randomUUID(),
    })
    .then(() => {});

  return NextResponse.json({ success: true });
}
