import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { toE164, isValidUSE164, sendSms, redactPhone } from "@/lib/messaging/twilio";
import { findSubscriberByPhone, createSubscriber, resubscribe, updateSubscriber } from "@/lib/sms/subscribers";
import { logConversation } from "@/lib/sms/conversations";
import { CONFIRMATION_SMS } from "@/lib/sms/keywords";
import { logActivity } from "@/lib/admin/log";

const limiter = createRateLimiter(5, 15 * 60 * 1000); // 5 per 15 min

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (!limiter.check(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }
  limiter.record(ip);

  let body: { email?: string; phone?: string; name?: string; consent?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, phone, name, consent } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Email address is required." },
      { status: 400 }
    );
  }

  // If user did not opt in to SMS, just acknowledge the registration
  if (!consent) {
    await logActivity("system", "join_no_sms", {
      email,
      name: name || null,
    });
    return NextResponse.json({ success: true });
  }

  // User opted in to SMS — phone is required
  if (!phone) {
    return NextResponse.json(
      { error: "Phone number is required for SMS opt-in." },
      { status: 400 }
    );
  }

  const e164 = toE164(phone);
  if (!isValidUSE164(e164)) {
    return NextResponse.json(
      { error: "Please enter a valid US phone number." },
      { status: 400 }
    );
  }

  // Create subscriber and send confirmation
  const existing = await findSubscriberByPhone(e164);

  // Already active — update name if provided and acknowledge
  if (existing?.status === "active") {
    const nameChanged = name && name !== existing.name;
    if (nameChanged) {
      await updateSubscriber(existing.id, { name });
    }
    return NextResponse.json({ updated: true });
  }

  let subscriberId: string;
  try {
    if (existing?.status === "opted_out") {
      await resubscribe(existing.id);
      if (name) await updateSubscriber(existing.id, { name });
      subscriberId = existing.id;
    } else {
      const subscriber = await createSubscriber({
        phone: e164,
        name: name || undefined,
        consent_ip: ip,
        consent_ua: request.headers.get("user-agent") ?? "",
      });
      subscriberId = subscriber.id;
    }
  } catch (err: unknown) {
    // Unique constraint race condition — treat as already subscribed
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "23505"
    ) {
      return NextResponse.json({ updated: true });
    }
    throw err;
  }

  // Send confirmation SMS
  const result = await sendSms(e164, CONFIRMATION_SMS);

  if (!result.success) {
    console.error("[Join] Failed to send confirmation SMS:", result.error);
    return NextResponse.json(
      { error: "Failed to send confirmation message. Please try again." },
      { status: 502 }
    );
  }

  // Log conversation + activity in parallel (independent writes)
  await Promise.all([
    logConversation({
      phone: e164,
      direction: "outbound",
      body: CONFIRMATION_SMS,
      twilio_sid: result.sid,
      subscriber_id: subscriberId,
    }),
    logActivity("system", "sms_join", {
      email,
      phone: redactPhone(e164),
      name: name || null,
      resubscribed: existing?.status === "opted_out",
    }),
  ]);

  return NextResponse.json({ success: true });
}
