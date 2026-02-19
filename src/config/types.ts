// ─── Contact & Track Types ──────────────────────────────────────────────────

export type Contact = { name: string; phone: string; email: string };
export type OrderContact = { sms_number: string; email: string };

export type CompanionSlot = "companion1" | "companion2" | "companion3";
export type Recipient = "player" | "companion";
export type AdHocRecipient = "player" | CompanionSlot;

export type SideEffect = "activate_quest";

export type Track = {
  player: Contact;
  companion1: Contact | null;
  companion2: Contact | null;
  companion3: Contact | null;
  description: string;
};

// ─── Triggers & Advance ─────────────────────────────────────────────────────

export type Trigger =
  | "manual"
  | "manual:location"
  | "scheduled"
  | "auto:quest_complete"
  | "auto:passphrase_entered";

export type AdvanceCondition =
  | "geofence"
  | "tap"
  | "correct_answers"
  | "compass_alignment"
  | "animation_complete"
  | "admin_trigger"
  | "passphrase";

// ─── Component Config Types ─────────────────────────────────────────────────

export type HintItem = { tier: number; hint: string };
export type QuestionItem = {
  question: string;
  options: string[];
  correct: number;
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

/** Tappable Marker SVG with pulsing text below. */
export type MarkerButtonConfig = {
  marker_text: string;
};

/** Sequential multiple-choice questions. */
export type MultipleChoiceConfig = {
  questions: QuestionItem[];
  hints?: HintItem[];
};

/** Fade-in story text with optional instruction and action button. */
export type NarrativeMomentConfig = {
  lines: string[];
  instruction?: string | null;
  action_label?: string | null;
};

/** Device orientation puzzle — point phone at target bearing and hold steady. */
export type CompassPuzzleConfig = {
  compass_target: number;
  compass_tolerance?: number;
  min_rotation?: number;
  hold_seconds?: number;
};

/** Celebration animation. No per-chapter config needed. */
export type PuzzleSolveConfig = Record<string, never>;

/** Completion text with Continue button. */
export type RewardRevealConfig = {
  primary: string;
  secondary?: string | null;
};

/** Pulsing Marker with atmospheric text. Shown between chapters. */
export type WaitingStateConfig = {
  message?: string | null;
  show_vault_teaser?: boolean;
};

/** Passphrase input puzzle — player enters hidden acrostic from letter. */
export type PassphrasePuzzleConfig = {
  placeholder?: string;
};

// ─── Component ↔ Config Pairing ─────────────────────────────────────────────

export type ComponentConfigMap = {
  WayfindingCompass: WayfindingCompassConfig;
  MarkerButton: MarkerButtonConfig;
  MultipleChoice: MultipleChoiceConfig;
  NarrativeMoment: NarrativeMomentConfig;
  CompassPuzzle: CompassPuzzleConfig;
  PuzzleSolve: PuzzleSolveConfig;
  RewardReveal: RewardRevealConfig;
  WaitingState: WaitingStateConfig;
  PassphrasePuzzle: PassphrasePuzzleConfig;
};

export type ComponentName = keyof ComponentConfigMap;

/** Union of all component config types (backward compat). */
export type ComponentConfig = ComponentConfigMap[ComponentName];

// ─── Companion Message ──────────────────────────────────────────────────────

export type CompanionMessage = {
  channel: "sms" | "mms";
  body: string;
};

// ─── Step Types ─────────────────────────────────────────────────────────────

export type LetterStep = {
  order: number;
  type: "letter";
  name: string;
  to: Recipient;
  trigger: Trigger;
  trigger_note?: string;
  body: string;
  signature?: string;
  content_notes?: string;
  companion_message?: CompanionMessage;
  progress_key: string;
};

export type EmailStep = {
  order: number;
  type: "email";
  name: string;
  to: Recipient;
  trigger: Trigger;
  trigger_note?: string;
  subject: string;
  body: string[];
  signature?: string;
  companion_message?: CompanionMessage;
  side_effect?: SideEffect;
  progress_key: string;
};

export type SmsStep = {
  order: number;
  type: "sms";
  name: string;
  to: Recipient;
  trigger: Trigger;
  trigger_note?: string;
  body: string;
  companion_message?: CompanionMessage;
  side_effect?: SideEffect;
  progress_key: string;
};

export type MmsStep = {
  order: number;
  type: "mms";
  name: string;
  to: Recipient;
  trigger: Trigger;
  trigger_note?: string;
  body: string;
  image?: string;
  companion_message?: CompanionMessage;
  side_effect?: SideEffect;
  progress_key: string;
};

/** Type-safe pairing: each component variant only accepts its matching config. */
export type WebsiteStep = {
  [K in ComponentName]: {
    order: number;
    type: "website";
    name: string;
    component: K;
    advance: AdvanceCondition;
    config: ComponentConfigMap[K];
  };
}[ComponentName];

export type Step = LetterStep | EmailStep | SmsStep | MmsStep | WebsiteStep;

// ─── Chapter and Top-Level Config ───────────────────────────────────────────

export type Chapter = {
  name: string;
  location: string | null;
  window: string;
  companion: CompanionSlot | null;
  passphrase?: string;
  steps: Record<string, Step>;
};

export type GameConfig = {
  order: OrderContact;
  tracks: { test: Track; live: Track };
  chapters: Record<string, Chapter>;
};
