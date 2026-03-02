import type { Database } from "@/lib/supabase/types";

export type KeywordType = Database["public"]["Enums"]["sms_keyword_type"];

const STOP_WORDS = new Set(["stop", "unsubscribe", "cancel", "end", "quit"]);
const START_WORDS = new Set(["start", "unstop", "yes"]);

export function detectKeyword(body: string): KeywordType {
  const normalized = body.trim().toLowerCase();
  if (STOP_WORDS.has(normalized)) return "stop";
  if (START_WORDS.has(normalized)) return "start";
  if (normalized === "help") return "help";
  if (normalized === "info") return "info";
  return "none";
}

export const CONFIRMATION_SMS =
  "The Order of the Gilt Frame: You're now opted in to game updates and alerts. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help.";

export const HELP_RESPONSE =
  "Gilt Frame: A location-based puzzle game. ~1-4 msgs/mo. Reply STOP to cancel. Email bpaksi@gmail.com for help. Msg&Data rates may apply.";

export const INFO_RESPONSE =
  "Gilt Frame: An immersive puzzle experience with GPS clues. ~1-4 msgs/mo. Reply STOP to opt out, HELP for help. Msg&Data rates may apply.";

export function getKeywordResponse(keyword: KeywordType): string | null {
  if (keyword === "help") return HELP_RESPONSE;
  if (keyword === "info") return INFO_RESPONSE;
  return null;
}
