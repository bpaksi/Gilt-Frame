// ─── Shared Types ─────────────────────────────────────────────────────────────

export type CompanionMessage = {
  to: string;
  channel: "sms" | "mms";
  body: string;
} | null;

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
  | "admin_trigger";

export type ComponentName =
  | "WayfindingCompass"
  | "MarkerButton"
  | "MultipleChoice"
  | "NarrativeMoment"
  | "CompassPuzzle"
  | "PuzzleSolve"
  | "RewardReveal"
  | "WaitingState";

// ─── Component Config Types ───────────────────────────────────────────────────

export type HintItem = { tier: number; hint: string };
export type QuestionItem = { question: string; options: string[]; correct: number };

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

export type ComponentConfig =
  | WayfindingCompassConfig
  | MarkerButtonConfig
  | MultipleChoiceConfig
  | NarrativeMomentConfig
  | CompassPuzzleConfig
  | PuzzleSolveConfig
  | RewardRevealConfig
  | WaitingStateConfig;

// ─── Flow Step Types ──────────────────────────────────────────────────────────

export type LetterStep = {
  id: string;
  order: number;
  type: "letter";
  name: string;
  to: string;
  trigger: Trigger;
  trigger_note?: string;
  body: string;
  signature?: string;
  content_notes?: string;
  companion_message: CompanionMessage;
  progress_key: string;
};

export type EmailStep = {
  id: string;
  order: number;
  type: "email";
  name: string;
  to: string;
  trigger: Trigger;
  trigger_note?: string;
  subject: string;
  body: string[];
  signature?: string;
  companion_message: CompanionMessage;
  side_effect?: string;
  progress_key: string;
};

export type SmsStep = {
  id: string;
  order: number;
  type: "sms";
  name: string;
  to: string;
  trigger: Trigger;
  trigger_note?: string;
  body: string;
  companion_message: CompanionMessage;
  side_effect?: string;
  progress_key: string;
};

export type MmsStep = {
  id: string;
  order: number;
  type: "mms";
  name: string;
  to: string;
  trigger: Trigger;
  trigger_note?: string;
  body: string;
  image?: string;
  companion_message: CompanionMessage;
  side_effect?: string;
  progress_key: string;
};

export type WebsiteStep = {
  id: string;
  order: number;
  type: "website";
  name: string;
  component: ComponentName;
  advance: AdvanceCondition;
  config: ComponentConfig;
};

export type FlowStep = LetterStep | EmailStep | SmsStep | MmsStep | WebsiteStep;

// ─── Chapter and Top-Level Config ─────────────────────────────────────────────

export type Chapter = {
  name: string;
  location: string | null;
  window: string;
  companion: string | null;
  passphrase?: string;
  flow: Record<string, FlowStep>;
};

export type ChaptersConfig = {
  chapters: Record<string, Chapter>;
  contacts: {
    sparrow: { name: string; phone: string; email: string };
    companions: Record<
      string,
      { name: string; phone: string; email: string; chapters: string[] }
    >;
    order: { sms_number: string; email: string };
    test_overrides: {
      sparrow_phone: string;
      sparrow_email: string;
      companion_phone: string;
      companion_email: string;
    };
  };
  tracks: {
    values: string[];
    behavior: Record<string, unknown>;
    device_enrollment: string;
    admin_toggle: string;
  };
};

// ─── Data ─────────────────────────────────────────────────────────────────────

export const chaptersConfig: ChaptersConfig = {
  contacts: {
    sparrow: {
      name: "Christine",
      phone: "",
      email: "",
    },
    companions: {
      bob: {
        name: "Bob",
        phone: "",
        email: "bpaksi@gmail.com",
        chapters: ["prologue", "ch1"],
      },
      sister: {
        name: "",
        phone: "",
        email: "",
        chapters: ["ch2"],
      },
    },
    order: {
      sms_number: "",
      email: "theorder@giltframe.org",
    },
    test_overrides: {
      sparrow_phone: "",
      sparrow_email: "bpaksi@gmail.com",
      companion_phone: "",
      companion_email: "bpaksi@gmail.com",
    },
  },

  tracks: {
    values: ["test", "live"],
    behavior: {
      test: {
        description:
          "Bob's phone(s). Used to dry-run any chapter independently. All messages go to Bob.",
        devices: "Bob's personal devices enrolled with track='test'",
        recipient_resolution:
          "Uses contacts.test_overrides — sparrow_phone AND companion_phone both resolve to Bob's number. Both the player SMS and the companion SMS land on the same device.",
        email_resolution:
          "Uses contacts.test_overrides — sparrow_email AND companion_email both resolve to Bob's email.",
        companion_messages:
          "Still fire to Bob's phone. Both messages arrive seconds apart on the same device — verifies timing and wording.",
        reset: "Any chapter can be reset independently — wipes progress and quest state for that chapter on the test track only",
        side_effects:
          "Execute against test track game state only (separate quests, moments, player_progress rows)",
      },
      live: {
        description:
          "Christine's enrolled devices. The real game. SMS and emails go to Christine. Irreversible — no reset.",
        devices: "Christine's 3 Apple devices enrolled with track='live'",
        sms_recipient: "Christine's phone number (from contacts.sparrow.phone)",
        email_recipient: "Christine's email (from contacts.sparrow.email)",
        companion_messages:
          "Fire to actual companion (Bob or sister) per config",
        reset: "NOT allowed. Live track is append-only.",
      },
    },
    device_enrollment:
      "Each enrolled device has a track field ('test' or 'live'). The device_token cookie encodes the track, so the website serves the correct game state automatically.",
    admin_toggle:
      "The admin Current tab has a TEST | LIVE toggle at the top. Controls which track's state is displayed and which track the Send buttons target.",
  },

  chapters: {
    // ── Prologue ──────────────────────────────────────────────────────────────
    // The Prologue's website interaction (passphrase gate) is handled by the
    // landing page, not the QuestStateMachine. The flow covers only offline
    // communications. The passphrase entry is implicit between flow steps 1 and 2.
    prologue: {
      name: "The Summons",
      location: null,
      window: "Mar 1-3, 2026",
      companion: "bob",
      passphrase: "SEE TRULY",
      flow: {
        prologue_letter: {
          id: "prologue_letter",
          order: 0,
          type: "letter",
          name: "The Summons Letter",
          to: "sparrow",
          trigger: "manual",
          trigger_note:
            "Mail the letter from a non-local post office. No return address.",
          body: "Sealed letter with hidden acrostic passphrase. Includes website URL.",
          signature: "— The Registrar",
          content_notes:
            "Letter must contain the acrostic 'SEE TRULY' hidden in the first letters of key sentences. Include giltframe.org URL. Wax seal optional but encouraged.",
          companion_message: null,
          progress_key: "prologue.letter_mailed",
        },
        prologue_magic_link: {
          id: "prologue_magic_link",
          order: 1,
          type: "mms",
          name: "The Marker Arrives",
          to: "sparrow",
          trigger: "manual",
          trigger_note:
            "Send shortly after letter should arrive. Or 3-4 days after the letter if she's stuck. MMS with Marker image attached.",
          body: "The sign has arrived. giltframe.org",
          image: "assets/prologue-sms-marker.png",
          companion_message: null,
          progress_key: "prologue.magic_link_sent",
        },
        prologue_acceptance: {
          id: "prologue_acceptance",
          order: 2,
          type: "mms",
          name: "Acceptance Confirmed",
          to: "sparrow",
          trigger: "auto:passphrase_entered",
          trigger_note:
            "Auto-send day after she enters the site and completes the passphrase. MMS with Marker image.",
          body: "The Order has noted your acceptance. Prepare yourself. The first trial is near.",
          image: "assets/prologue-sms-marker.png",
          companion_message: null,
          progress_key: "prologue.acceptance_confirmed",
        },
      },
    },

    // ── Chapter 1 ─────────────────────────────────────────────────────────────
    // SMS ONLY for Chapter 1. No email. Christine gets dozens of emails daily.
    // The 255° compass bearing from this chapter points toward Chicago (Ch2).
    ch1: {
      name: "The Compass and the Sundial",
      location: "Kellogg Manor, Michigan",
      window: "Mar 3, 2026 (anniversary)",
      companion: "bob",
      flow: {
        // Coordinates are the PIN location (~125m NNE of sundial), not the sundial itself.
        // The app's wayfinding compass guides her the remaining distance.
        ch1_initiation: {
          id: "ch1_initiation",
          order: 0,
          type: "mms",
          name: "The Summons",
          to: "sparrow",
          trigger: "manual",
          trigger_note:
            "Send morning of March 3 while at/near Kellogg Manor for anniversary. Single MMS with coordinates.",
          body: "The Order has placed a Marker at 42.406256, -85.402025. Your first trial begins now. giltframe.org",
          image: "assets/prologue-sms-marker.png",
          companion_message: null,
          side_effect: "activate_quest",
          progress_key: "ch1.initiation_sent",
        },
        // GPS compass from PIN (42.406256, -85.402025) to sundial (42.405278, -85.402778). ~125m walk.
        ch1_wayfinding: {
          id: "ch1_wayfinding",
          order: 1,
          type: "website",
          name: "The Wayfinding",
          component: "WayfindingCompass",
          advance: "geofence",
          config: {
            target_lat: 42.405278,
            target_lng: -85.402778,
            geofence_radius: 30,
          },
        },
        ch1_arrival: {
          id: "ch1_arrival",
          order: 2,
          type: "website",
          name: "The Arrival",
          component: "MarkerButton",
          advance: "tap",
          config: {
            marker_text: "The timekeeper stands before me",
          },
        },
        ch1_confirmation: {
          id: "ch1_confirmation",
          order: 3,
          type: "website",
          name: "The Confirmation",
          component: "MultipleChoice",
          advance: "correct_answers",
          config: {
            questions: [
              {
                question: "Four guardians encircle the dial. What form do they take?",
                options: ["Seraphim", "Warriors", "Maidens", "Beasts"],
                correct: 2,
              },
              {
                question: "What truth does the dial keep?",
                options: [
                  "Time waits for no one",
                  "The early bird gets the worm",
                  "All things must pass",
                  "The sun also rises",
                ],
                correct: 1,
              },
            ],
          },
        },
        ch1_sparrow_moment: {
          id: "ch1_sparrow_moment",
          order: 4,
          type: "website",
          name: "The Sparrow Moment",
          component: "NarrativeMoment",
          advance: "tap",
          config: {
            lines: [
              "This bird casts its shadow over time.",
              "So will you, Sparrow, cast yours.",
            ],
            instruction: "Lay your device upon the face of the dial. Turn slowly.",
            action_label: "Begin",
          },
        },
        // compass_bearing: 255° W — confirmed from recon compass photo at sundial
        ch1_compass_puzzle: {
          id: "ch1_compass_puzzle",
          order: 5,
          type: "website",
          name: "The Compass Puzzle",
          component: "CompassPuzzle",
          advance: "compass_alignment",
          config: {
            compass_target: 255,
            compass_tolerance: 15,
            min_rotation: 90,
            hold_seconds: 1.5,
          },
        },
        ch1_seal: {
          id: "ch1_seal",
          order: 6,
          type: "website",
          name: "The Seal",
          component: "PuzzleSolve",
          advance: "animation_complete",
          config: {},
        },
        ch1_reward: {
          id: "ch1_reward",
          order: 7,
          type: "website",
          name: "The Reward",
          component: "RewardReveal",
          advance: "tap",
          config: {
            primary:
              "The needle has shown you the way. Take flight, young bird, destiny awaits.",
            secondary: "Your first fragment has been placed in the vault.",
          },
        },
        ch1_wait: {
          id: "ch1_wait",
          order: 8,
          type: "website",
          name: "The Wait",
          component: "WaitingState",
          advance: "admin_trigger",
          config: {},
        },
        ch1_post_solve: {
          id: "ch1_post_solve",
          order: 9,
          type: "mms",
          name: "Post-Solve Confirmation",
          to: "sparrow",
          trigger: "auto:quest_complete",
          trigger_note:
            "Auto-fires when player reaches the WaitingState. Or manual from admin.",
          body: "The Order sees clearly. Your first fragment has been placed in the vault.",
          image: "assets/prologue-sms-marker.png",
          companion_message: null,
          progress_key: "ch1.post_solve_sent",
        },
      },
    },

    // ── Chapter 2 ─────────────────────────────────────────────────────────────
    // The 255° bearing from Ch1 points from Kellogg Manor toward Chicago.
    // This is an intentional plot point — do NOT spell it out. Let her discover it.
    ch2: {
      name: "The Gallery of Whispers",
      location: "Art Institute of Chicago",
      window: "Mar 10-24, 2026",
      companion: "sister",
      flow: {
        // Subtly references the 255° bearing from Ch1 without naming Chicago.
        ch2_mid_gap_email: {
          id: "ch2_mid_gap_email",
          order: 0,
          type: "email",
          name: "Mid-Gap: A Bearing Worth Remembering",
          to: "sparrow",
          trigger: "manual",
          trigger_note:
            "Send ~March 10-14, roughly midway between Ch1 completion and Ch2 activation. Purpose: maintain engagement during the 3-week gap.",
          subject: "A Bearing Worth Remembering",
          body: [
            "Sparrow,",
            "",
            "The sundial at the manor held more than time. You found what it concealed, but have you considered where it pointed?",
            "",
            "A compass does not forget its bearing. Neither should you.",
            "",
            "The Order does not summon without purpose. When the next call comes, you will understand why the needle chose its direction.",
            "",
            "Until then, patience. The worthy do not rush toward what is already in motion.",
            "",
            "— The Archivist",
          ],
          signature: "— The Archivist",
          companion_message: null,
          progress_key: "ch2.mid_gap_email_sent",
        },
        ch2_pre_trip_letter: {
          id: "ch2_pre_trip_letter",
          order: 1,
          type: "letter",
          name: "The Pre-Trip Letter",
          to: "sparrow",
          trigger: "manual",
          trigger_note:
            "Mail 4-5 days before Chicago trip. Arrives 1-2 days before departure.",
          body: "Sealed letter referencing 'a patron whose vision shaped the Order in the age of the great Fair.' Hints at portrait in Chicago. Does NOT name Palmer, Zorn, or gallery number.",
          signature: "— The Registrar",
          content_notes:
            "The pre-trip letter should: (1) Reference the World's Columbian Exposition of 1893 obliquely, calling it 'the great Fair' or 'the White City.' (2) Allude to a woman of influence who 'saw what others could not' and 'shaped the Order's collection in an age of transformation.' (3) Hint that her likeness endures 'within a palace of art beside the lake.' (4) NOT name Palmer, Zorn, the Art Institute, or Gallery 273. Christine must discover those through the puzzle. (5) Tone: reverent, archival, the Registrar at their most ceremonial.",
          companion_message: null,
          progress_key: "ch2.pre_trip_letter_mailed",
        },
        ch2_tickler: {
          id: "ch2_tickler",
          order: 2,
          type: "mms",
          name: "The Summons",
          to: "sparrow",
          trigger: "scheduled",
          trigger_note: "Day before or morning of museum visit.",
          body: "The lions are waiting, Sparrow.",
          image: "assets/prologue-sms-marker.png",
          companion_message: {
            to: "sister",
            channel: "sms",
            body: "You are not the one we seek. But you walk beside her. Do not interfere.",
          },
          progress_key: "ch2.tickler_sent",
        },
        ch2_museum_proximity: {
          id: "ch2_museum_proximity",
          order: 3,
          type: "mms",
          name: "The Arrival",
          to: "sparrow",
          trigger: "manual:location",
          trigger_note:
            "Send when Find My shows her at or near the AIC. The big moment. Also triggers quest on Current tab.",
          body: "You are close. Ascend to the second floor. Gallery 273. She is waiting. giltframe.org",
          image: "assets/prologue-sms-marker.png",
          companion_message: null,
          side_effect: "activate_quest",
          progress_key: "ch2.museum_proximity_sent",
        },
        // SMS is the alert, email is the full briefing. These two fire back-to-back.
        ch2_email_briefing: {
          id: "ch2_email_briefing",
          order: 4,
          type: "email",
          name: "The Briefing",
          to: "sparrow",
          trigger: "manual",
          trigger_note:
            "Send immediately after ch2_museum_proximity. SMS is the alert, email is the full briefing. These two fire back-to-back.",
          subject: "The Gallery of Whispers — Your Second Trial",
          body: [
            "Sparrow,",
            "",
            "You have been summoned to the palace of art beside the lake. The Order placed you here for a reason, though you may not yet understand why.",
            "",
            "In 1893, the White City rose from the marshlands of this very shore. A great Fair drew the world to Chicago, and with it came a woman whose eye for beauty would reshape what this nation collected, celebrated, and preserved. She moved among artists and diplomats alike, and she understood something few of her contemporaries grasped: that art is not decoration, it is power.",
            "",
            "A painter from across the sea was commissioned to capture her likeness. He saw what the camera could not, the bearing of someone who bends the world by force of vision alone. That portrait endures within these walls.",
            "",
            "Your trial: find her.",
            "",
            "You have already been told the gallery. Enter it. Study the faces that line those walls. When you believe you have found her, the Order will test your certainty.",
            "",
            "Two questions will be asked of you. They concern what she holds and what she wears. Look closely. The answer is in the paint.",
            "",
            "Do not rush. The Order rewards patience and precision, not speed.",
            "",
            "— The Archivist",
          ],
          signature: "— The Archivist",
          companion_message: null,
          progress_key: "ch2.email_briefing_sent",
        },
        // Indoor — no GPS. Text-based wayfinding with progressive hints.
        ch2_wayfinding: {
          id: "ch2_wayfinding",
          order: 5,
          type: "website",
          name: "The Wayfinding",
          component: "WayfindingCompass",
          advance: "tap",
          config: {
            wayfinding_text: "Gallery 273. Find the patron who shaped the Order.",
            hints: [
              { tier: 1, hint: "She lived in the age of the great Fair, 1893." },
              { tier: 2, hint: "A Swedish painter captured her likeness." },
              { tier: 3, hint: "Her name shaped Chicago society. The Palmer name endures." },
              {
                tier: 4,
                hint: "Anders Zorn painted Mrs. Potter Palmer. Find her portrait.",
              },
            ],
          },
        },
        ch2_confirmation: {
          id: "ch2_confirmation",
          order: 6,
          type: "website",
          name: "The Confirmation",
          component: "MultipleChoice",
          advance: "correct_answers",
          config: {
            questions: [
              {
                question: "What does she hold?",
                options: [
                  "A folded fan",
                  "An ivory gavel",
                  "A small book",
                  "A bouquet of flowers",
                ],
                correct: 1,
              },
              {
                question: "What adorns her head?",
                options: [
                  "A wide-brimmed hat",
                  "A jeweled tiara",
                  "A silk ribbon",
                  "Nothing — her hair is unpinned",
                ],
                correct: 1,
              },
            ],
          },
        },
        ch2_seal: {
          id: "ch2_seal",
          order: 7,
          type: "website",
          name: "The Seal",
          component: "PuzzleSolve",
          advance: "animation_complete",
          config: {},
        },
        ch2_reward: {
          id: "ch2_reward",
          order: 8,
          type: "website",
          name: "The Reward",
          component: "RewardReveal",
          advance: "tap",
          config: {
            primary:
              "Mrs. Palmer did not collect alone. Her closest advisor was a fellow member of the Order, a painter whose quiet work still guards a secret.",
            secondary: "Your second fragment has been placed in the vault.",
          },
        },
        ch2_wait: {
          id: "ch2_wait",
          order: 9,
          type: "website",
          name: "The Wait",
          component: "WaitingState",
          advance: "admin_trigger",
          config: {},
        },
        ch2_post_solve: {
          id: "ch2_post_solve",
          order: 10,
          type: "mms",
          name: "Post-Solve Confirmation",
          to: "sparrow",
          trigger: "auto:quest_complete",
          trigger_note: "Auto-send when player reaches WaitingState.",
          body: "You see what others have not. Your Chronicle has been updated. The Council is watching with growing interest.",
          image: "assets/prologue-sms-marker.png",
          companion_message: {
            to: "sister",
            channel: "sms",
            body: "The Order sees those who stand watch. You have our thanks.",
          },
          progress_key: "ch2.post_solve_sent",
        },
        // Teases Cassatt/Crystal Bridges without naming them.
        ch2_debrief_email: {
          id: "ch2_debrief_email",
          order: 11,
          type: "email",
          name: "The Debrief",
          to: "sparrow",
          trigger: "scheduled",
          trigger_note:
            "1-2 days after Chicago trip. Lore + teaser for next chapter.",
          subject: "The Gallery of Whispers — The Order is Pleased",
          body: [
            "Sparrow,",
            "",
            "You found her. The Order is pleased.",
            "",
            "Mrs. Potter Palmer was no mere socialite. When the World's Columbian Exposition came to Chicago in 1893, she was appointed President of the Board of Lady Managers, the highest position a woman held at the Fair. She used that authority to champion artists the establishment had overlooked, purchasing works that would later anchor the collections of the very institution you walked through today.",
            "",
            "Among those she championed was a woman painter living abroad, one whose quiet domestic scenes concealed a radical eye. Palmer acquired her work when few collectors would. That painter's legacy now resides in a place you may one day visit, a museum built into the hills of a distant state, where art and nature converge.",
            "",
            "But that is a story for another time.",
            "",
            "Your second fragment has been placed in the vault. The Council has taken notice.",
            "",
            "— The Archivist",
          ],
          signature: "— The Archivist",
          companion_message: null,
          progress_key: "ch2.debrief_sent",
        },
        ch2_sister_release: {
          id: "ch2_sister_release",
          order: 12,
          type: "sms",
          name: "Companion Release",
          to: "sister",
          trigger: "auto:quest_complete",
          trigger_note:
            "Send after quest is fully complete. Final companion message for Ch2.",
          body: "She has proven worthy. The Order releases you from your watch — until the next summons.",
          companion_message: null,
          progress_key: "ch2.sister_release_sent",
        },
      },
    },

    // ── Future Chapters (flow TBD) ─────────────────────────────────────────────

    ch3: {
      name: "The Keeper's Archive",
      location: "Kalamazoo / KIA / Kellogg Manor",
      window: "Late Mar - Mid Apr, 2026",
      companion: null,
      flow: {},
    },

    ch4: {
      name: "The Southern Vault",
      location: "Crystal Bridges Museum, Bentonville AR",
      window: "Mid Apr - Early May, 2026",
      companion: null,
      flow: {},
    },

    ch5: {
      name: "The Windmill Key",
      location: "Kellogg Manor (windmill)",
      window: "May - Early Jun, 2026",
      companion: null,
      flow: {},
    },

    ch6: {
      name: "The Living Gallery",
      location: "Shedd Aquarium, Chicago",
      window: "Early Jun - Jun 14, 2026",
      companion: null,
      flow: {},
    },

    ch7: {
      name: "The Dunes Passage",
      location: "Sleeping Bear Dunes, MI",
      window: "Late Jun - Mid Jul, 2026",
      companion: null,
      flow: {},
    },

    ch8: {
      name: "The Final Frame",
      location: "Kellogg Manor gazebo (by boat)",
      window: "Late Jul - Aug, 2026",
      companion: null,
      flow: {},
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getOrderedFlow(chapter: Chapter): FlowStep[] {
  return Object.values(chapter.flow).sort((a, b) => a.order - b.order);
}
