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
  messageId?: string;
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
  stepId: string
): Promise<SendResult> {
  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return { success: false, error: "Chapter not found." };

  const trackObj = gameConfig.tracks[track];
  const orderedSteps = getOrderedSteps(chapter);
  const matchedStep = orderedSteps.find((s) => s.id === stepId);
  if (!matchedStep || matchedStep.type === "website") {
    return { success: false, error: "Step not found." };
  }

  const step = matchedStep as SmsStep | EmailStep | LetterStep;

  const supabase = createAdminClient();
  let messageStatus = "sent";
  let error: string | undefined;

  // Ensure chapter_progress row exists
  let { data: cp } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", track)
    .eq("chapter_id", chapterId)
    .single();

  if (!cp) {
    const { data: created } = await supabase
      .from("chapter_progress")
      .insert({ track, chapter_id: chapterId })
      .select("id")
      .single();
    cp = created;
  }

  if (!cp) return { success: false, error: "Could not create chapter progress." };

  // Ensure step_progress row exists
  let { data: sp } = await supabase
    .from("step_progress")
    .select("id")
    .eq("chapter_progress_id", cp.id)
    .eq("step_id", stepId)
    .single();

  if (!sp) {
    const { data: created } = await supabase
      .from("step_progress")
      .insert({ chapter_progress_id: cp.id, step_id: stepId, completed_at: null })
      .select("id")
      .single();
    sp = created;
  }

  if (!sp) return { success: false, error: "Could not create step progress." };

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
    stepId,
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
            step_id: stepId,
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

  // Insert message_progress row for main recipient
  const { data: mpRow } = await supabase.from("message_progress").insert({
    step_progress_id: sp.id,
    to: step.config.to,
    status: messageStatus,
    sent_at: messageStatus === "sent" ? new Date().toISOString() : null,
    error: error ?? null,
  }).select("id").single();

  // Send companion message if defined — insert as separate message_progress row
  if (step.config.companion_message) {
    const comp = step.config.companion_message;
    const compRecipient = resolveRecipient(trackObj, comp.to);
    let companionStatus = "pending";

    if (compRecipient) {
      const result = await sendSms(compRecipient.phone, comp.body);
      companionStatus = result.success ? "sent" : "failed";
    } else {
      companionStatus = "failed";
    }

    await supabase.from("message_progress").insert({
      step_progress_id: sp.id,
      to: comp.to,
      status: companionStatus,
      sent_at: companionStatus === "sent" ? new Date().toISOString() : null,
    });
  }

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
      step_id: stepId,
      step_name: step.name,
      step_type: step.type,
      status: messageStatus,
      to: recipient.phone ?? recipient.email,
      to_slot: step.config.to,
      ...(compRecipient && {
        companion_to: compRecipient.phone ?? compRecipient.email,
        companion_slot: step.config.companion_message!.to,
      }),
      ...(error && { error }),
    },
  });

  // Mark step_progress as completed
  await supabase
    .from("step_progress")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sp.id);

  return {
    success: messageStatus === "sent",
    error,
    messageStatus,
    messageId: mpRow?.id,
  };
}

export async function scheduleStep(
  track: "test" | "live",
  chapterId: string,
  stepId: string,
  delayHours: number
): Promise<void> {
  const chapter = gameConfig.chapters[chapterId];
  if (!chapter) return;

  const orderedSteps = getOrderedSteps(chapter);
  const matchedStep = orderedSteps.find((s) => s.id === stepId);
  if (!matchedStep || matchedStep.type === "website") return;

  const scheduledAt = new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString();
  const supabase = createAdminClient();

  console.log("[scheduleStep] Scheduling", {
    stepId,
    delayHours,
    scheduledAt,
  });

  // Ensure chapter_progress row exists
  let { data: cp } = await supabase
    .from("chapter_progress")
    .select("id")
    .eq("track", track)
    .eq("chapter_id", chapterId)
    .single();

  if (!cp) {
    const { data: created } = await supabase
      .from("chapter_progress")
      .insert({ track, chapter_id: chapterId })
      .select("id")
      .single();
    cp = created;
  }

  if (!cp) return;

  // Create step_progress row with scheduled_at (not completed yet)
  await supabase
    .from("step_progress")
    .upsert(
      {
        chapter_progress_id: cp.id,
        step_id: stepId,
        scheduled_at: scheduledAt,
        completed_at: null,
      },
      { onConflict: "chapter_progress_id,step_id" }
    );

  await supabase.from("activity_log").insert({
    track,
    source: "admin",
    event_type: "step_scheduled",
    details: {
      chapter_id: chapterId,
      step_id: stepId,
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
