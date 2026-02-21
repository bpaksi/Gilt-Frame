import { NextRequest, NextResponse } from "next/server";
import { createAdminAuthClient } from "@/lib/supabase/server-auth";
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

  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true });

  // Pass response cookies so the SSR client can write session cookies on sign-in
  const supabase = await createAdminAuthClient(response.cookies);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email as string,
    password: password as string,
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

  // Session cookies (access + refresh token) are set automatically by the
  // @supabase/ssr client via the setAll cookie handler above.
  return response;
}
