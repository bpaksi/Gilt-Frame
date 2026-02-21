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

export type QuestionItem = {
  question: string;
  options: string[];
  correct: number;
  hints?: string[];
};

/**
 * GPS outdoor compass (full mode) OR tappable marker only (lite mode).
 *
 * Full mode: target_lat + target_lng present → Phase 1: GPS compass navigates
 * to geofence → Phase 2: tappable marker advances the quest.
 *
 * Lite mode: no coordinates → Phase 1 skipped → tappable marker only
 * (narrative beat, no navigation).
 */
export type FindByGpsConfig = {
  // Phase 1 — GPS navigation (optional; omit for lite mode)
  target_lat?: number;
  target_lng?: number;
  /** Meters — auto-transitions to marker tap when player enters. */
  geofence_radius?: number;
  wayfinding_text?: string;
  hints?: string[];
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
};

/** Passphrase input puzzle — player enters hidden acrostic from letter. */
export type PassphraseEntryConfig = {
  placeholder?: string;
  passphrase: string;
};

/**
 * Two-phase find-and-confirm puzzle that loops until correct.
 *
 * Phase 1 — GUIDANCE: Displays guidance_text (the initial clue). A "?" button
 * reveals progressive hints (tiered). Player reads, looks around, then taps
 * "I think I've found it" to enter Phase 2.
 *
 * Phase 2 — IDENTIFICATION: Shows `question` with `num_distractors` randomly
 * selected wrong answers from `painting_pool` plus the `correct_answer`,
 * shuffled. If wrong → shake animation, auto-reveal next hint tier, return to
 * Phase 1. If correct → advance.
 *
 * The 3 distractors are re-randomized on each wrong attempt so the player
 * can't brute-force by elimination.
 */
export type FindByTextConfig = {
  /** The initial text clue shown at the top of the guidance phase. */
  guidance_text: string;
  /** Progressive hints revealed on wrong attempts (and via "?" button). */
  hints: string[];
  /** The identification question, e.g. "What is the name of the painting you stand before?" */
  question: string;
  /** The correct painting name exactly as it should appear in the option. */
  correct_answer: string;
  /** Pool of wrong-answer painting names. 3 are randomly drawn per attempt. */
  painting_pool: string[];
  /** Number of wrong options to show alongside the correct answer. Default 3. */
  num_distractors?: number;
  /** Button label on the guidance phase marker. Default: "I think I've found it." */
  confirmation_instruction?: string;
};

// ─── Component ↔ Config Pairing ─────────────────────────────────────────────

export type ComponentConfigMap = {
  FindByGps: FindByGpsConfig;
  MultipleChoice: MultipleChoiceConfig;
  BearingPuzzle: BearingPuzzleConfig;
  StoryReveal: StoryRevealConfig;
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
  BearingPuzzle: "compass_alignment",
  StoryReveal: "tap",
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
