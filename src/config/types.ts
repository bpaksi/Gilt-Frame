// ─── Contact & Track Types ──────────────────────────────────────────────────

export type Contact = { name: string; phone: string; email: string };

export type CompanionSlot = "companion1" | "companion2" | "companion3";
export type Recipient = "player" | CompanionSlot;
export type AdHocRecipient = "player" | CompanionSlot;

export type Track = {
  player: Contact;
  companion1: Contact | null;
  companion2: Contact | null;
  companion3: Contact | null;
  _description: string;
};

// ─── Triggers & Advance ─────────────────────────────────────────────────────

export type Trigger = "manual" | "auto";

export type AdvanceCondition =
  | "geofence"
  | "tap"
  | "correct_answers"
  | "compass_alignment"
  | "passphrase";

// ─── Component Config Types ─────────────────────────────────────────────────

export type StaticQuestionItem = {
  question: string;
  hints?: string[];
  options: string[];
  correct: number;
};

export type PoolQuestionItem = {
  question: string;
  hints?: string[];
  correct_answer: string;
  /** Pool of wrong-answer options. `num_distractors` are randomly drawn per attempt. */
  answer_pool: string[];
  /** Number of wrong options to show alongside the correct answer. Default 3. */
  num_distractors?: number;
};

export type QuestionItem = StaticQuestionItem | PoolQuestionItem;

export function isPoolQuestion(q: QuestionItem): q is PoolQuestionItem {
  return "answer_pool" in q;
}

/**
 * GPS outdoor compass (full mode) OR tappable marker only (lite mode).
 *
 * Full mode: target_lat + target_lng present → Phase 1: GPS compass navigates
 * to geofence → Phase 2: tappable marker advances the quest.
 *
 * Lite mode: no coordinates → Phase 1 skipped → tappable marker only
 * (narrative beat, no navigation).
 */
/** A single distance threshold for the GPS compass distance text. */
export type DistanceGate = {
  /** Show this text when distance is above this many metres. */
  above: number;
  text: string;
};

export type FindByGpsConfig = {
  // Phase 1 — GPS navigation (optional; omit for lite mode)
  target_lat?: number;
  target_lng?: number;
  /** Meters — auto-transitions to marker tap when player enters. */
  geofence_radius?: number;
  wayfinding_text?: string;
  hints?: string[];
  /**
   * Distance gates sorted descending by `above`. First gate where distance > above wins.
   * The lowest `above` value acts as the catch-all (shown when player is close).
   * Falls back to DEFAULT_DISTANCE_GATES when omitted.
   */
  distance_gates?: DistanceGate[];
  // Phase 2 — Marker tap (always present)
  title_lines?: string[];
  instruction: string;
};

/** Sequential multiple-choice questions. */
export type MultipleChoiceConfig = {
  questions: QuestionItem[];
};

/** Device orientation puzzle — point phone at target bearing and hold steady. */
export type BearingPuzzleConfig = {
  compass_target: number;
  compass_tolerance?: number;
  min_rotation?: number;
  hold_seconds?: number;
  instruction?: string;
  /** Shown above the countdown after solving. Default: "The compass yields its secret…" */
  locking_message?: string;
  /** Shown after the countdown completes. Default: "The way is found" */
  resolution_message?: string;
  /** Shown on the orientation permission screen. Default: "The compass awaits your permission." */
  permission_message?: string;
};

/** Ceremony animation + reward text with unlock/continue buttons. */
export type StoryRevealConfig = {
  primary: string;
  secondary?: string | null;
  /** Skip the gilt-frame ceremony and go straight to text. Default false. */
  skip_ceremony?: boolean;
  /** Label for the ceremony unlock button. Default "Press to Unlock". */
  unlock_text?: string;
  /** Label for the continue button on the text phase. Default "Continue". */
  continue_text?: string;
  /** Optional chapter label shown above the primary text. */
  chapter_name?: string;
};

/** Passphrase input puzzle — player enters hidden acrostic from letter. */
export type PassphraseEntryConfig = {
  placeholder?: string;
  passphrase: string;
};

/**
 * Two-phase find-and-confirm puzzle.
 *
 * Phase 1 — GUIDANCE: Displays guidance_text (the initial clue). A "?" button
 * reveals progressive hints (tiered). Player reads, looks around, then taps
 * the confirmation button to enter Phase 2.
 *
 * Phase 2 — IDENTIFICATION: Delegates to MultipleChoice with the single
 * pool question. Wrong answers re-shuffle distractors in place. Correct → advance.
 */
export type FindByTextConfig = {
  /** The initial text clue shown at the top of the guidance phase. */
  guidance_text: string;
  /** Progressive hints revealed via the "?" button in the guidance phase. */
  hints: string[];
  /** The identification question, rendered by MultipleChoice as a pool question. */
  question: PoolQuestionItem;
  /** Button label on the guidance phase marker. Default: "I think I've found it." */
  confirmation_instruction?: string;
};

// ─── Component ↔ Config Pairing ─────────────────────────────────────────────

export type ComponentConfigMap = {
  FindByGps: FindByGpsConfig;
  MultipleChoice: MultipleChoiceConfig;
  AlignBearing: BearingPuzzleConfig;
  RevealNarrative: StoryRevealConfig;
  PassphraseEntry: PassphraseEntryConfig;
  FindByText: FindByTextConfig;
};

export type ComponentName = keyof ComponentConfigMap;

/** Union of all component config types (backward compat). */
export type ComponentConfig = ComponentConfigMap[ComponentName];

/** Advance condition is intrinsic to the component — derive, don't configure. */
export const COMPONENT_ADVANCE: Record<ComponentName, AdvanceCondition> = {
  FindByGps: "tap",
  MultipleChoice: "correct_answers",
  AlignBearing: "compass_alignment",
  RevealNarrative: "tap",
  PassphraseEntry: "passphrase",
  FindByText: "correct_answers",
};

// ─── Companion Message ──────────────────────────────────────────────────────

export type CompanionMessage = {
  to: CompanionSlot;
  channel: "sms";
  body: string;
};

// ─── Messaging Step Config Types ────────────────────────────────────────────

export type LetterStepConfig = {
  to: Recipient;
  _trigger_note?: string;
  body: string;
  _signature?: string;
  _content_notes?: string;
  companion_message?: CompanionMessage;
};

export type EmailStepConfig = {
  to: Recipient;
  _trigger_note?: string;
  subject: string;
  template: string;
  companion_message?: CompanionMessage;
};

export type SmsStepConfig = {
  to: Recipient;
  _trigger_note?: string;
  body: string;
  image?: string;
  companion_message?: CompanionMessage;
};

// ─── Step Types ─────────────────────────────────────────────────────────────

export type LetterStep = {
  order: number;
  type: "letter";
  name: string;
  trigger: Trigger;
  /** Mornings to delay. 1 = next 4:30am EST, 2 = morning after, etc. Omit or 0 = send immediately. */
  delay_mornings?: number;
  config: LetterStepConfig;
};

export type EmailStep = {
  order: number;
  type: "email";
  name: string;
  trigger: Trigger;
  /** Mornings to delay. 1 = next 4:30am EST, 2 = morning after, etc. Omit or 0 = send immediately. */
  delay_mornings?: number;
  config: EmailStepConfig;
};

export type SmsStep = {
  order: number;
  type: "sms";
  name: string;
  trigger: Trigger;
  /** Mornings to delay. 1 = next 4:30am EST, 2 = morning after, etc. Omit or 0 = send immediately. */
  delay_mornings?: number;
  config: SmsStepConfig;
};

/** Type-safe pairing: each component variant only accepts its matching config. */
export type WebsiteStep = {
  [K in ComponentName]: {
    order: number;
    type: "website";
    name: string;
    component: K;
    config: ComponentConfigMap[K];
  };
}[ComponentName];

export type Step = LetterStep | EmailStep | SmsStep | WebsiteStep;

// ─── Chapter and Top-Level Config ───────────────────────────────────────────

export type Chapter = {
  name: string;
  location: string | null;
  window: string;
  steps: Record<string, Step>;
};

export type GameConfig = {
  tracks: { test: Track; live: Track };
  chapters: Record<string, Chapter>;
};
