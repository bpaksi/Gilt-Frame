import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/admin/log";
import {
  chaptersConfig,
  getOrderedFlow,
  type FlowStep,
  type SmsStep,
  type MmsStep,
  type EmailStep,
  type LetterStep,
} from "@/config/chapters";
import { sendSms, sendMms } from "./twilio";
import { sendEmail } from "./resend";

type SendResult = {
  success: boolean;
  error?: string;
  messageStatus?: string;
  companionStatus?: string;
};

function resolveRecipient(
  track: "test" | "live",
  to: string
): { phone: string; email: string } {
  const contacts = chaptersConfig.contacts;

  if (track === "test") {
    if (to === "sparrow") {
      return {
        phone: contacts.test_overrides.sparrow_phone,
        email: contacts.test_overrides.sparrow_email,
      };
    }
    // Companion — all go to test override
    return {
      phone: contacts.test_overrides.companion_phone,
      email: contacts.test_overrides.companion_email,
    };
  }

  // Live track
  if (to === "sparrow") {
    return {
      phone: contacts.sparrow.phone,
      email: contacts.sparrow.email,
    };
  }

  // Resolve companion by name
  const companion = contacts.companions[to];
  if (companion) {
    return { phone: companion.phone, email: companion.email };
  }

  return { phone: "", email: "" };
}

function getMediaUrl(image?: string): string | null {
  if (!image) return null;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${baseUrl}/${image}`;
}

export async function sendFlowStep(
  track: "test" | "live",
  chapterId: string,
  progressKey: string
): Promise<SendResult> {
  const chapter = chaptersConfig.chapters[chapterId];
  if (!chapter) return { success: false, error: "Chapter not found." };

  const orderedFlow = getOrderedFlow(chapter);
  const step = orderedFlow.find(
    (s) => "progress_key" in s && s.progress_key === progressKey
  ) as (SmsStep | MmsStep | EmailStep | LetterStep) | undefined;

  if (!step) return { success: false, error: "Flow step not found." };

  const supabase = createAdminClient();
  let messageStatus = "sent";
  let companionStatus = "pending";
  let error: string | undefined;

  // Send main message
  const recipient = resolveRecipient(track, step.to);

  if (step.type === "sms") {
    const result = await sendSms(recipient.phone, step.body);
    if (!result.success) {
      messageStatus = "failed";
      error = result.error;
    }
  } else if (step.type === "mms") {
    const mediaUrl = getMediaUrl(step.image);
    if (mediaUrl) {
      const result = await sendMms(recipient.phone, step.body, mediaUrl);
      if (!result.success) {
        messageStatus = "failed";
        error = result.error;
      }
    } else {
      // Fallback to SMS if no image
      const result = await sendSms(recipient.phone, step.body);
      if (!result.success) {
        messageStatus = "failed";
        error = result.error;
      }
    }
  } else if (step.type === "email") {
    const body = step.body.join("\n");
    const result = await sendEmail(recipient.email, step.subject, body);
    if (!result.success) {
      messageStatus = "failed";
      error = result.error;
    }
  } else if (step.type === "letter") {
    // Letters are physical — mark as sent (admin records mailing manually)
    messageStatus = "sent";
  }

  // Send companion message if defined
  if (step.companion_message) {
    const comp = step.companion_message;
    const compRecipient = resolveRecipient(track, comp.to);

    if (comp.channel === "sms") {
      const result = await sendSms(compRecipient.phone, comp.body);
      companionStatus = result.success ? "sent" : "failed";
    } else if (comp.channel === "mms") {
      const result = await sendSms(compRecipient.phone, comp.body);
      companionStatus = result.success ? "sent" : "failed";
    }
  } else {
    companionStatus = "none";
  }

  // Upsert message_progress
  await supabase.from("message_progress").upsert(
    {
      track,
      progress_key: progressKey,
      status: messageStatus,
      sent_at: messageStatus === "sent" ? new Date().toISOString() : null,
      companion_status: companionStatus,
      companion_sent_at:
        companionStatus === "sent" ? new Date().toISOString() : null,
      error: error ?? null,
    },
    { onConflict: "track,progress_key" }
  );

  // Insert player event
  await supabase.from("player_events").insert({
    track,
    event_type: step.type === "email" ? "email_sent" : "sms_sent",
    details: {
      chapter_id: chapterId,
      progress_key: progressKey,
      step_name: step.name,
      step_type: step.type,
    },
  });

  // Log admin action
  await logAdminAction("send_flow_step", {
    track,
    chapter_id: chapterId,
    progress_key: progressKey,
    step_name: step.name,
    status: messageStatus,
  });

  // Advance current_flow_index if this step's order is at or past current index
  const stepIndex = orderedFlow.indexOf(step as FlowStep);
  if (stepIndex >= 0) {
    const { data: progress } = await supabase
      .from("chapter_progress")
      .select("current_flow_index")
      .eq("track", track)
      .eq("chapter_id", chapterId)
      .single();

    if (progress && stepIndex >= progress.current_flow_index) {
      await supabase
        .from("chapter_progress")
        .update({ current_flow_index: stepIndex + 1 })
        .eq("track", track)
        .eq("chapter_id", chapterId);
    }
  }

  return {
    success: messageStatus === "sent",
    error,
    messageStatus,
    companionStatus,
  };
}

export async function sendAdHocMessage(
  track: "test" | "live",
  channel: "sms" | "email",
  to: string,
  body: string,
  subject?: string
): Promise<SendResult> {
  const recipient = resolveRecipient(track, to);

  let success = false;
  let error: string | undefined;

  if (channel === "sms") {
    const result = await sendSms(recipient.phone || to, body);
    success = result.success;
    error = result.error;
  } else {
    const result = await sendEmail(
      recipient.email || to,
      subject ?? "Message from The Order",
      body
    );
    success = result.success;
    error = result.error;
  }

  const supabase = createAdminClient();
  await supabase.from("player_events").insert({
    track,
    event_type: channel === "sms" ? "sms_sent" : "email_sent",
    details: {
      ad_hoc: true,
      to,
      channel,
      body_preview: body.slice(0, 100),
    },
  });

  await logAdminAction("send_ad_hoc", { track, channel, to, success });

  return { success, error, messageStatus: success ? "sent" : "failed" };
}
