import { NextRequest, NextResponse } from "next/server";
import { createAdminAuthClient } from "@/lib/supabase/server-auth";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/the-order/login", origin));
  }

  const response = NextResponse.redirect(
    new URL("/the-order/update-password", origin)
  );
  const supabase = await createAdminAuthClient(response.cookies);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/the-order/login", origin));
  }

  response.cookies.set("admin_session", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
