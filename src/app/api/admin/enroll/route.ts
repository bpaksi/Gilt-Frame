import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";

async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (!adminSession?.value) return false;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase.auth.getUser(adminSession.value);
  return !error && !!data.user;
}

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("device_enrollments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ enrollments: data });
}

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

  const supabase = createAdminClient();

  // Count active (non-revoked) enrollments for this track
  const { count, error: countError } = await supabase
    .from("device_enrollments")
    .select("*", { count: "exact", head: true })
    .eq("track", track)
    .eq("revoked", false);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((count ?? 0) >= 5) {
    return NextResponse.json(
      { error: `Maximum 5 active enrollments allowed for track '${track}'.` },
      { status: 409 }
    );
  }

  const token = crypto.randomUUID();
  const { data, error } = await supabase
    .from("device_enrollments")
    .insert({ token, track })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const enrollmentUrl = `${baseUrl}/e/${token}`;

  return NextResponse.json({ enrollment: data, url: enrollmentUrl });
}
