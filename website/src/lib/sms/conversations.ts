import { createAdminClient } from "@/lib/supabase/admin";
import { TWILIO_FROM_NUMBER } from "@/lib/messaging/twilio";
import type { KeywordType } from "./keywords";

export async function logConversation(params: {
  phone: string;
  direction: "inbound" | "outbound";
  body: string;
  twilio_sid?: string;
  keyword_type?: KeywordType;
  subscriber_id?: string | null;
}): Promise<void> {
  const supabase = createAdminClient();

  let subscriberId = params.subscriber_id ?? null;
  if (subscriberId === null) {
    const { data: subscriber } = await supabase
      .from("sms_subscribers")
      .select("id")
      .eq("phone", params.phone)
      .maybeSingle();
    subscriberId = subscriber?.id ?? null;
  }

  const from = params.direction === "inbound" ? params.phone : TWILIO_FROM_NUMBER;
  const to = params.direction === "inbound" ? TWILIO_FROM_NUMBER : params.phone;

  const { error } = await supabase.from("sms_conversations").insert({
    subscriber_id: subscriberId,
    direction: params.direction,
    from,
    to,
    body: params.body,
    twilio_sid: params.twilio_sid ?? null,
    keyword_type: params.keyword_type ?? "none",
  });

  if (error) console.error("[sms_conversations] Failed to log:", error);
}
