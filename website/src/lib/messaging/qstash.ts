import { Client } from "@upstash/qstash";

let _client: Client | null = null;

function getClient(): Client {
  if (!_client) {
    _client = new Client({ token: process.env.QSTASH_TOKEN! });
  }
  return _client;
}

/**
 * Enqueue a delayed step delivery via QStash.
 * Returns the QStash message ID for logging.
 */
export async function enqueueDelayedStep(
  track: "test" | "live",
  chapterId: string,
  stepId: string,
  delaySeconds: number,
): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const client = getClient();

  const res = await client.publishJSON({
    url: `${baseUrl}/api/webhooks/qstash`,
    body: { track, chapterId, stepId },
    delay: delaySeconds,
  });

  return res.messageId;
}
