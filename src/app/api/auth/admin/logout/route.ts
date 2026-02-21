import { NextResponse } from "next/server";
import { createAdminAuthClient } from "@/lib/supabase/server-auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Sign out via @supabase/ssr so all session cookies are cleared
  const supabase = await createAdminAuthClient(response.cookies);
  await supabase.auth.signOut();

  return response;
}
