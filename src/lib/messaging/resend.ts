const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = "theorder@giltframe.org";

type ResendResult = { success: boolean; id?: string; error?: string };

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<ResendResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `The Order <${FROM_EMAIL}>`,
      to: [to],
      subject,
      text,
      ...(html && { html }),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, error: data.message ?? `Resend error ${res.status}` };
  }

  return { success: true, id: data.id };
}
