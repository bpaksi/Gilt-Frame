import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const limiter = createRateLimiter(5, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (!limiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again later." },
      { status: 429 }
    );
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user || !data.session) {
    limiter.record(ip);
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 }
    );
  }

  if (data.user.email !== process.env.ADMIN_EMAIL) {
    limiter.record(ip);
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  limiter.clear(ip);

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_session", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
