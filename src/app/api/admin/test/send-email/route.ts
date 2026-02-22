import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { sendEmail } from "@/lib/messaging/resend";
import { loadEmailTemplate } from "@/lib/messaging/email-templates";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { template, to, subject } = await request.json();

  if (!template || !to || !subject) {
    return NextResponse.json(
      { error: "template, to, and subject are required." },
      { status: 400 }
    );
  }

  let html: string;
  let text: string;
  try {
    ({ html, text } = await loadEmailTemplate(template));
  } catch {
    return NextResponse.json(
      { error: `Template "${template}" not found.` },
      { status: 404 }
    );
  }

  const result = await sendEmail(to, subject, text, html);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: result.id });
}
