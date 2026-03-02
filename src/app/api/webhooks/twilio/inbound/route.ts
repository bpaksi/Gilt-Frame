import { NextResponse } from "next/server";
import { validateTwilioSignature } from "@/lib/sms/validate-twilio-signature";
import { detectKeyword, getKeywordResponse } from "@/lib/sms/keywords";
import { findSubscriberByPhone, optOut, resubscribe } from "@/lib/sms/subscribers";
import { logConversation } from "@/lib/sms/conversations";
import { sendSms, redactPhone } from "@/lib/messaging/twilio";
import { logActivity } from "@/lib/admin/log";

const EMPTY_TWIML = "<Response></Response>";

export async function POST(request: Request) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/twilio/inbound`;

  // Parse form-urlencoded body
  const text = await request.text();
  const formData = new URLSearchParams(text);
  const params: Record<string, string> = Object.fromEntries(formData.entries());

  // Validate Twilio signature
  const signature = request.headers.get("x-twilio-signature") ?? "";
  if (!validateTwilioSignature(url, params, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const from = params.From ?? "";
  const to = params.To ?? "";
  const body = params.Body ?? "";
  const messageSid = params.MessageSid ?? "";

  const keyword = detectKeyword(body);

  // Look up subscriber once, reuse for both logging and keyword handling
  const subscriber = await findSubscriberByPhone(from);

  // Log inbound conversation (passes subscriber_id to avoid redundant lookup)
  await logConversation({
    phone: from,
    direction: "inbound",
    body,
    twilio_sid: messageSid,
    keyword_type: keyword,
    subscriber_id: subscriber?.id,
  });

  // Handle keyword
  if (keyword === "stop" && subscriber) {
    await optOut(subscriber.id);
  } else if (keyword === "start" && subscriber) {
    await resubscribe(subscriber.id);
  } else if (keyword === "help" || keyword === "info") {
    const response = getKeywordResponse(keyword)!;
    const result = await sendSms(from, response);
    await logConversation({
      phone: from,
      direction: "outbound",
      body: response,
      twilio_sid: result.sid,
      keyword_type: keyword,
      subscriber_id: subscriber?.id,
    });
  }

  // Log to activity_log
  await logActivity("system", "sms_inbound", {
    from: redactPhone(from),
    to,
    keyword,
    message_sid: messageSid,
  });

  return new NextResponse(EMPTY_TWIML, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
