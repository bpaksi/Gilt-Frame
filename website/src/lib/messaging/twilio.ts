const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID!;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;
export const TWILIO_FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER!;
const DRY_RUN = process.env.TWILIO_DRY_RUN === "true";

type TwilioResult = { success: boolean; sid?: string; error?: string };

/** Redact last 4 digits of a phone number for logging. */
export function redactPhone(phone: string): string {
  return phone.replace(/\d{4}$/, "****");
}

/** Returns true if `phone` is a valid US E.164 number (+1 followed by 10 digits). */
export function isValidUSE164(phone: string): boolean {
  return /^\+1\d{10}$/.test(phone);
}

/** Strip non-digits, ensure +1 prefix for US numbers. */
export function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}

function parseResult(res: Response, data: Record<string, unknown>): TwilioResult {
  if (!res.ok) {
    const error = (data.message as string) ?? `Twilio error ${res.status}`;
    console.error("[Twilio] HTTP error:", { status: res.status, error });
    return { success: false, error };
  }

  if (data.error_code) {
    const error = `Twilio error ${data.error_code}: ${data.error_message ?? "unknown"}`;
    console.error("[Twilio] Message error:", { sid: data.sid, status: data.status, error });
    return { success: false, sid: data.sid as string, error };
  }

  const redactedTo = typeof data.to === "string" ? redactPhone(data.to) : "unknown";
  console.log("[Twilio] Sent:", { sid: data.sid, status: data.status, to: redactedTo });
  return { success: true, sid: data.sid as string };
}

export async function sendSms(to: string, body: string, mediaUrl?: string): Promise<TwilioResult> {
  const e164To = toE164(to);
  if (DRY_RUN) {
    console.log(
      `\n📱 [DRY RUN] SMS → ${e164To}\n` +
      `   From: ${TWILIO_FROM_NUMBER}\n` +
      `   Body: ${body}` +
      (mediaUrl ? `\n   Media: ${mediaUrl}` : "") +
      "\n",
    );
    return { success: true, sid: "dry-run" };
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  const params = new URLSearchParams({
    To: e164To,
    From: TWILIO_FROM_NUMBER,
    Body: body,
  });
  if (mediaUrl) params.set("MediaUrl", mediaUrl);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await res.json();
  return parseResult(res, data);
}
