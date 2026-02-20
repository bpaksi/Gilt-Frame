import { createAdminClient } from "@/lib/supabase/admin";
import {
  gameConfig,
  getOrderedSteps,
  type SmsStep,
  type EmailStep,
  type LetterStep,
} from "@/config";
import type { Contact, AdHocRecipient, Track, Recipient } from "@/config";
import { sendSms } from "./twilio";
import { sendEmail } from "./resend";
import { loadEmailTemplate } from "./email-templates";

type SendResult = {
  success: boolean;
  error?: string;
  messageStatus?: string;
  companionStatus?: string;
};

function resolveRecipient(
  trackObj: Track,
  to: Recipient
): Contact | null {
  if (to === "player") return trackObj.player;
  return trackObj[to];
}

function getMediaUrl(image?: string): string | null {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${baseUrl}/${image}`;
}

export async function sendStep(
  track: "test" | "live",
  chapterId: string,
  progressKey: string
): Promise<SendResult> {
  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return { success: false, error: "Chapter not found." };

  const trackObj = gameConfig.tracks[track];
  const orderedSteps = getOrderedSteps(chapter);
  const matchedStep = orderedSteps.find(
    (s) => s.type !== "website" && s.config.progress_key === progressKey
  );
  if (!matchedStep) return { success: false, error: "Step not found." };

  const stepId = matchedStep.id;
  const step = matchedStep as SmsStep | EmailStep | LetterStep;

  const supabase = createAdminClient();
  let messageStatus = "sent";
  let companionStatus = "pending";
  let error: string | undefined;

  // Send main message
  const recipient = resolveRecipient(trackObj, step.config.to);
  if (!recipient) {
    console.error("[sendStep] Could not resolve recipient:", step.config.to);
    return { success: false, error: `Could not resolve recipient "${step.config.to}".` };
  }

  console.log("[sendStep] Sending", {
    type: step.type,
    to: recipient.phone || recipient.email,
    slot: step.config.to,
    progressKey,
  });

  if (step.type === "sms") {
    const mediaUrl = getMediaUrl(step.config.image) ?? undefined;
    const result = await sendSms(recipient.phone, step.config.body, mediaUrl);
    if (!result.success) {
      messageStatus = "failed";
      error = result.error;

      // Fallback: retry via email
      console.log("[sendStep] SMS failed, attempting email fallback", { error });
      const emailResult = await sendEmail(
        recipient.email,
        "Message from The Order",
        step.config.body
      );
      if (emailResult.success) {
        messageStatus = "sent";
        error = undefined;
        await supabase.from("activity_log").insert({
          track,
          source: "system",
          event_type: "sms_email_fallback",
          details: {
            chapter_id: chapterId,
            progress_key: progressKey,
            step_name: step.name,
            sms_error: result.error,
          },
        });
      } else {
        error = `SMS: ${result.error}; Email fallback: ${emailResult.error}`;
      }
    }
  } else if (step.type === "email") {
    const { html, text } = await loadEmailTemplate(step.config.template);
    const result = await sendEmail(recipient.email, step.config.subject, text, html);
    if (!result.success) {
      messageStatus = "failed";
      error = result.error;
    }
  } else if (step.type === "letter") {
    // Letters are physical — mark as sent (admin records mailing manually)
    messageStatus = "sent";
  }

  // Send companion message if defined
  if (step.config.companion_message) {
    const comp = step.config.companion_message;
    const compRecipient = resolveRecipient(trackObj, comp.to);

    if (compRecipient) {
      const result = await sendSms(compRecipient.phone, comp.body);
      companionStatus = result.success ? "sent" : "failed";
    } else {
      companionStatus = "failed";
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

  // Log activity
  const compRecipient = step.config.companion_message
    ? resolveRecipient(trackObj, step.config.companion_message.to)
    : null;
  await supabase.from("activity_log").insert({
    track,
    source: "admin",
    event_type: "send_step",
    details: {
      chapter_id: chapterId,
      progress_key: progressKey,
      step_name: step.name,
      step_type: step.type,
      status: messageStatus,
      to: recipient.phone ?? recipient.email,
      to_slot: step.config.to,
      ...(compRecipient && {
        companion_to: compRecipient.phone ?? compRecipient.email,
        companion_slot: step.config.companion_message!.to,
        companion_status: companionStatus,
      }),
      ...(error && { error }),
    },
  });

  // Mark this step as completed if not already
  // Ensure chapter_progress row exists
  const { data: progress } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", track)
    .eq("chapter_id", chapterId)
    .single();

  if (!progress) {
    await supabase.from("chapter_progress").insert({
      track,
      chapter_id: chapterId,
    });
  }

  // Insert completed step (ignore conflict if already completed)
  await supabase.from("completed_steps").upsert(
    {
      track,
      chapter_id: chapterId,
      step_id: stepId,
    },
    { onConflict: "track,chapter_id,step_id" }
  );

  return {
    success: messageStatus === "sent",
    error,
    messageStatus,
    companionStatus,
  };
}

export async function scheduleStep(
  track: "test" | "live",
  chapterId: string,
  progressKey: string,
  delayHours: number
): Promise<void> {
  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return;

  const orderedSteps = getOrderedSteps(chapter);
  const matchedStep = orderedSteps.find(
    (s) => s.type !== "website" && s.config.progress_key === progressKey
  );
  if (!matchedStep) return;

  const scheduledAt = new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString();
  const supabase = createAdminClient();

  console.log("[scheduleStep] Scheduling", {
    progressKey,
    delayHours,
    scheduledAt,
  });

  // Insert message_progress as scheduled — step is NOT completed until actually sent
  await supabase.from("message_progress").upsert(
    {
      track,
      progress_key: progressKey,
      status: "scheduled",
      scheduled_at: scheduledAt,
    },
    { onConflict: "track,progress_key" }
  );

  await supabase.from("activity_log").insert({
    track,
    source: "admin",
    event_type: "step_scheduled",
    details: {
      chapter_id: chapterId,
      progress_key: progressKey,
      step_name: matchedStep.name,
      step_type: matchedStep.type,
      delay_hours: delayHours,
      scheduled_at: scheduledAt,
    },
  });
}

export async function sendAdHocMessage(
  track: "test" | "live",
  channel: "sms" | "email",
  to: AdHocRecipient,
  body: string,
  subject?: string
): Promise<SendResult> {
  const trackObj = gameConfig.tracks[track];
  const contact: Contact | null =
    to === "player" ? trackObj.player : trackObj[to];

  if (!contact) {
    return { success: false, error: `No contact for "${to}" on ${track} track.` };
  }

  let success = false;
  let error: string | undefined;

  if (channel === "sms") {
    const result = await sendSms(contact.phone, body);
    success = result.success;
    error = result.error;
  } else {
    const result = await sendEmail(
      contact.email,
      subject ?? "Message from The Order",
      body
    );
    success = result.success;
    error = result.error;
  }

  const supabase = createAdminClient();
  await supabase.from("activity_log").insert({
    track,
    source: "admin",
    event_type: "send_ad_hoc",
    details: {
      ad_hoc: true,
      to,
      channel,
      body_preview: body.slice(0, 100),
      success,
    },
  });

  return { success, error, messageStatus: success ? "sent" : "failed" };
}
