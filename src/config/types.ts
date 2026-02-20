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

export type HintItem = { tier: number; hint: string };
export type QuestionItem = {
  question: string;
  options: string[];
  correct: number;
  hints?: string[];
};

/** GPS outdoor compass OR text-based indoor directions. */
export type WayfindingCompassConfig = {
  target_lat?: number;
  target_lng?: number;
  /** Meters — auto-advance when player enters. Null = show 'I have arrived' button. */
  geofence_radius?: number;
  wayfinding_text?: string;
  hints?: HintItem[];
};

/** Tappable Marker SVG with pulsing text below. Optional title lines above. */
export type MarkerButtonConfig = {
  title_lines?: string[];
  instruction: string;
};

/** Sequential multiple-choice questions. */
export type MultipleChoiceConfig = {
  questions: QuestionItem[];
  hints?: HintItem[];
};

/** Device orientation puzzle — point phone at target bearing and hold steady. */
export type CompassPuzzleConfig = {
  compass_target: number;
  compass_tolerance?: number;
  min_rotation?: number;
  hold_seconds?: number;
  instruction?: string;
};

/** Ceremony animation + reward text with unlock/continue buttons. */
export type RewardRevealConfig = {
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
export type PassphrasePuzzleConfig = {
  placeholder?: string;
  passphrase: string;
};

// ─── Component ↔ Config Pairing ─────────────────────────────────────────────

export type ComponentConfigMap = {
  WayfindingCompass: WayfindingCompassConfig;
  MarkerButton: MarkerButtonConfig;
  MultipleChoice: MultipleChoiceConfig;
  CompassPuzzle: CompassPuzzleConfig;
  RewardReveal: RewardRevealConfig;
  PassphrasePuzzle: PassphrasePuzzleConfig;
};

export type ComponentName = keyof ComponentConfigMap;

/** Union of all component config types (backward compat). */
export type ComponentConfig = ComponentConfigMap[ComponentName];

/** Advance condition is intrinsic to the component — derive, don't configure. */
export const COMPONENT_ADVANCE: Record<ComponentName, AdvanceCondition> = {
  WayfindingCompass: "geofence",
  MarkerButton: "tap",
  MultipleChoice: "correct_answers",
  CompassPuzzle: "compass_alignment",
  RewardReveal: "tap",
  PassphrasePuzzle: "passphrase",
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
  /** Hours to delay sending after trigger. Omit or 0 = send immediately. */
  delay_hours?: number;
  config: LetterStepConfig;
};

export type EmailStep = {
  order: number;
  type: "email";
  name: string;
  trigger: Trigger;
  /** Hours to delay sending after trigger. Omit or 0 = send immediately. */
  delay_hours?: number;
  config: EmailStepConfig;
};

export type SmsStep = {
  order: number;
  type: "sms";
  name: string;
  trigger: Trigger;
  /** Hours to delay sending after trigger. Omit or 0 = send immediately. */
  delay_hours?: number;
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
