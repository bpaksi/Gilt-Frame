import { createHmac, timingSafeEqual } from "crypto";

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN!;

/**
 * Validate Twilio webhook request signature (HMAC-SHA1).
 * https://www.twilio.com/docs/usage/security#validating-requests
 */
export function validateTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string
): boolean {
  // Sort param keys alphabetically and append key+value to URL
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  const expected = createHmac("sha1", TWILIO_AUTH_TOKEN)
    .update(data, "utf-8")
    .digest("base64");

  // Timing-safe comparison
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);

  if (sigBuf.length !== expBuf.length) return false;
  return timingSafeEqual(sigBuf, expBuf);
}
