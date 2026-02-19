import { createAdminClient } from "@/lib/supabase/admin";
import {
  gameConfig,
  getOrderedSteps,
  type SmsStep,
  type MmsStep,
  type EmailStep,
  type LetterStep,
} from "@/config/chapters";
import type { Contact, AdHocRecipient, Chapter, Track } from "@/config/types";
import { sendSms, sendMms } from "./twilio";
import { sendEmail } from "./resend";

type SendResult = {
  success: boolean;
  error?: string;
  messageStatus?: string;
  companionStatus?: string;
};

function resolveRecipient(
  trackObj: Track,
  to: string,
  chapter?: Chapter
): Contact | null {
  if (to === "player") return trackObj.player;
  if (to === "companion" && chapter?.companion) {
    return trackObj[chapter.companion];
  }
  return null;
}

function getMediaUrl(image?: string): string | null {
  if (!image) return null;
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
  const stepIdx = orderedSteps.findIndex(
    (s) => "progress_key" in s && s.progress_key === progressKey
  );
  if (stepIdx < 0) return { success: false, error: "Step not found." };

  const step = orderedSteps[stepIdx] as SmsStep | MmsStep | EmailStep | LetterStep;

  const supabase = createAdminClient();
  let messageStatus = "sent";
  let companionStatus = "pending";
  let error: string | undefined;

  // Send main message
  const recipient = resolveRecipient(trackObj, step.to, chapter);
  if (!recipient) {
    return { success: false, error: `Could not resolve recipient "${step.to}".` };
  }

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
    const compRecipient = resolveRecipient(trackObj, "companion", chapter);

    if (compRecipient) {
      if (comp.channel === "sms") {
        const result = await sendSms(compRecipient.phone, comp.body);
        companionStatus = result.success ? "sent" : "failed";
      } else if (comp.channel === "mms") {
        const result = await sendSms(compRecipient.phone, comp.body);
        companionStatus = result.success ? "sent" : "failed";
      }
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
      step_index: stepIdx,
    },
    { onConflict: "track,chapter_id,step_index" }
  );

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
