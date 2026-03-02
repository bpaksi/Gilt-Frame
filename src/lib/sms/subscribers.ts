import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/lib/supabase/types";

export type SmsSubscriber = Tables<"sms_subscribers">;

export async function findSubscriberByPhone(phone: string): Promise<SmsSubscriber | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sms_subscribers")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createSubscriber(params: {
  phone: string;
  name?: string;
  consent_ip: string;
  consent_ua: string;
}): Promise<SmsSubscriber> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("sms_subscribers")
    .insert({
      phone: params.phone,
      name: params.name ?? null,
      consent_ip: params.consent_ip,
      consent_ua: params.consent_ua,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function optOut(subscriberId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("sms_subscribers")
    .update({
      status: "opted_out",
      opted_out_at: new Date().toISOString(),
    })
    .eq("id", subscriberId);

  if (error) throw error;
}

export async function resubscribe(subscriberId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("sms_subscribers")
    .update({
      status: "active",
      resubscribed_at: new Date().toISOString(),
      opted_out_at: null,
    })
    .eq("id", subscriberId);

  if (error) throw error;
}
