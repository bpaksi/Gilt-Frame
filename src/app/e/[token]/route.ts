import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const invalidHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>The Order of the Gilt Frame</title>
  <style>
    body {
      margin: 0;
      min-height: 100dvh;
      background: #0a0a0f;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      box-sizing: border-box;
    }
    p {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 16px;
      color: #8b7355;
      letter-spacing: 1px;
      line-height: 1.7;
      text-align: center;
      max-width: 400px;
      margin: 0;
    }
  </style>
</head>
<body>
  <p>This enrollment link is invalid or has already been used.</p>
</body>
</html>`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: enrollment } = await supabase
    .from("device_enrollments")
    .select("*")
    .eq("token", token)
    .eq("revoked", false)
    .is("device_token", null)
    .single();

  if (!enrollment) {
    return new NextResponse(invalidHtml, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }

  const deviceToken = crypto.randomUUID();
  const userAgent = request.headers.get("user-agent") ?? "";

  await supabase
    .from("device_enrollments")
    .update({
      device_token: deviceToken,
      enrolled_at: new Date().toISOString(),
      user_agent: userAgent,
    })
    .eq("id", enrollment.id);

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("device_token", deviceToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90, // 90 days
    path: "/",
  });

  return response;
}
