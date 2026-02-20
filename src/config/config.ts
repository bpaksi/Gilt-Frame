import type { GameConfig, Chapter, Step } from "./types";
import { christine, bob, sister } from "./contacts";

// ─── Data ─────────────────────────────────────────────────────────────────────

export const gameConfig: GameConfig = {
  tracks: {
    test: {
      player: bob,
      companion1: bob,
      companion2: bob,
      companion3: bob,
      _description: "Dev dry-run. All messages go to Bob.",
    },
    live: {
      player: christine,
      companion1: bob,
      companion2: sister,
      companion3: null,
      _description: "Christine's real game. Irreversible.",
    },
  },

  chapters: {
    // ── Prologue ──────────────────────────────────────────────────────────────
    // Letter → SMS → Passphrase (website) → Acceptance SMS.
    // The passphrase is a proper website step rendered by QuestStateMachine.
    prologue: {
      name: "The Summons",
      location: null,
      window: "Mar 1-3, 2026",
      steps: {
        prologue_letter: {
          order: 0,
          type: "letter",
          name: "The Summons Letter",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "Mail the letter from a non-local post office. No return address.",
            body: "Sealed letter with hidden acrostic passphrase. Includes website URL.",
            _signature: "— The Registrar",
            _content_notes:
              "Letter must contain the acrostic 'SEE TRULY' hidden in the first letters of key sentences. Include giltframe.org URL. Wax seal optional but encouraged.",
          },
        },
        prologue_magic_link: {
          order: 1,
          type: "sms",
          name: "The Marker Arrives",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "Send shortly after letter should arrive. Or 3-4 days after the letter if she's stuck. SMS with Marker image attached.",
            body: "The sign has arrived. giltframe.org",
            image:
              "https://raw.githubusercontent.com/bpaksi/Gilt-Frame/main/public/marker/marker-v3-gold-512.png",
          },
        },
        prologue_passphrase: {
          order: 2,
          type: "website",
          name: "The Passphrase",
          component: "PassphrasePuzzle",

          config: {
            placeholder: "Speak the words.",
            passphrase: "SEE TRULY",
          },
        },
        prologue_reward: {
          order: 3,
          type: "website",
          name: "The Reward",
          component: "RewardReveal",
          config: {
            primary:
              "You have spoken the words. The Sight stirs within you, Sparrow. What was lost is now reborn.",
            secondary: "The Order has heard you.",
          },
        },
        prologue_acceptance: {
          order: 4,
          type: "sms",
          name: "Acceptance Confirmed",
          trigger: "auto",
          delay_hours: 3,
          config: {
            to: "player",
            _trigger_note:
              "Auto-send 3 hours after she enters the site and completes the passphrase. SMS with Marker image.",
            body: "The Order has noted your acceptance. Prepare yourself. The first trial is near.",
            image: "assets/prologue-sms-marker.png",
          },
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
      steps: {
        // Coordinates are the PIN location (~125m NNE of sundial), not the sundial itself.
        // The app's wayfinding compass guides her the remaining distance.
        ch1_initiation: {
          order: 0,
          type: "sms",
          name: "The Summons",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "Send morning of March 3 while at/near Kellogg Manor for anniversary. SMS with coordinates and Marker image.",
            body: "The Order has placed a Marker at 42.406256, -85.402025. Your first trial begins now. giltframe.org",
            image:
              "https://raw.githubusercontent.com/bpaksi/Gilt-Frame/main/public/marker/marker-v3-gold-512.png",
          },
        },
        ch1_arrived: {
          order: 1,
          type: "sms",
          name: "The Arrival",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "Admin monitors player location (Find My). Send when player arrives at Kellogg Manor parking lot.",
            body: "The timekeeper awaits, Sparrow. Begin your trial. giltframe.org",
            image:
              "https://raw.githubusercontent.com/bpaksi/Gilt-Frame/main/public/marker/marker-v3-gold-512.png",
          },
        },
        // GPS compass from PIN (42.406256, -85.402025) to sundial (42.405278, -85.402778). ~125m walk.
        // geofence_radius: 9m ≈ 30ft. Auto-advances when player enters.
        //
        // DEV TESTING — simulate geofence without a phone:
        //   Chrome DevTools → ⋮ menu → More tools → Sensors → Location → "Other..."
        //   Enter target coords (42.405278, -85.402778) to trigger geofence.
        //   Change coords gradually to simulate walking. Compass heading is
        //   already mouse-simulated on desktop (move mouse around canvas).
        ch1_wayfinding: {
          order: 2,
          type: "website",
          name: "The Wayfinding",
          component: "WayfindingCompass",
          config: {
            target_lat: 42.405278,
            target_lng: -85.402778,
            geofence_radius: 9,
            wayfinding_text: "Travel to the timekeeper, Sparrow.",
          },
        },
        ch1_arrival: {
          order: 3,
          type: "website",
          name: "The Arrival",
          component: "MarkerButton",
          config: {
            marker_text: "The timekeeper stands before me",
          },
        },
        ch1_confirmation: {
          order: 4,
          type: "website",
          name: "The Confirmation",
          component: "MultipleChoice",
          config: {
            questions: [
              {
                question:
                  "Four guardians encircle the dial. What form do they take?",
                options: ["Seraphim", "Warriors", "Maidens", "Beasts"],
                correct: 2,
                hints: [
                  {
                    tier: 1,
                    hint: "Stand at the dial and look closely at the figures around its edge.",
                  },
                  {
                    tier: 2,
                    hint: "They are not warriors, nor angels. They are gentler than that.",
                  },
                ],
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
                hints: [
                  {
                    tier: 3,
                    hint: "The truth is written on the dial itself. Read what it says.",
                  },
                  {
                    tier: 4,
                    hint: "Look for the inscription. It speaks of a familiar proverb.",
                  },
                ],
              },
            ],
          },
        },
        ch1_sparrow_moment: {
          order: 5,
          type: "website",
          name: "The Sparrow Moment",
          component: "MarkerButton",
          config: {
            marker_text: "Begin",
            title_lines: [
              "This bird casts its shadow over time.",
              "So will you, Sparrow, cast yours.",
            ],
            instruction:
              "Lay your device upon the face of the dial. Turn slowly.",
          },
        },
        // compass_bearing: 255° W — confirmed from recon compass photo at sundial
        ch1_compass_puzzle: {
          order: 6,
          type: "website",
          name: "The Compass Puzzle",
          component: "CompassPuzzle",
          config: {
            compass_target: 255,
            compass_tolerance: 15,
            min_rotation: 90,
            hold_seconds: 1.5,
          },
        },
        ch1_seal: {
          order: 7,
          type: "website",
          name: "The Seal",
          component: "PuzzleSolve",
          config: {},
        },
        ch1_reward: {
          order: 8,
          type: "website",
          name: "The Reward",
          component: "RewardReveal",
          config: {
            primary:
              "The needle has shown you the way. Take flight, young bird, destiny awaits.",
            secondary: "Your first fragment has been placed in the vault.",
          },
        },
        ch1_wait: {
          order: 9,
          type: "website",
          name: "The Wait",
          component: "WaitingState",
          config: {},
        },
        ch1_post_solve: {
          order: 10,
          type: "sms",
          name: "Post-Solve Confirmation",
          trigger: "auto",
          config: {
            to: "player",
            _trigger_note:
              "Auto-fires when player reaches the WaitingState. Or manual from admin.",
            body: "The Order sees clearly. Your first fragment has been placed in the vault.",
            image:
              "https://raw.githubusercontent.com/bpaksi/Gilt-Frame/main/public/marker/marker-v3-gold-512.png",
          },
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
      steps: {
        // Subtly references the 255° bearing from Ch1 without naming Chicago.
        ch2_mid_gap_email: {
          order: 0,
          type: "email",
          name: "Mid-Gap: A Bearing Worth Remembering",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "Send ~March 10-14, roughly midway between Ch1 completion and Ch2 activation. Purpose: maintain engagement during the 3-week gap.",
            subject: "A Bearing Worth Remembering",
            template: "ch2-mid-gap",
          },
        },
        ch2_pre_trip_letter: {
          order: 1,
          type: "letter",
          name: "The Pre-Trip Letter",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "Mail 4-5 days before Chicago trip. Arrives 1-2 days before departure.",
            body: "Sealed letter referencing 'a patron whose vision shaped the Order in the age of the great Fair.' Hints at portrait in Chicago. Does NOT name Palmer, Zorn, or gallery number.",
            _signature: "\u2014 The Registrar",
            _content_notes:
              "The pre-trip letter should: (1) Reference the World's Columbian Exposition of 1893 obliquely, calling it 'the great Fair' or 'the White City.' (2) Allude to a woman of influence who 'saw what others could not' and 'shaped the Order's collection in an age of transformation.' (3) Hint that her likeness endures 'within a palace of art beside the lake.' (4) NOT name Palmer, Zorn, the Art Institute, or Gallery 273. Christine must discover those through the puzzle. (5) Tone: reverent, archival, the Registrar at their most ceremonial.",
          },
        },
        ch2_tickler: {
          order: 2,
          type: "sms",
          name: "The Summons",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note: "Day before or morning of museum visit.",
            body: "The lions are waiting, Sparrow.",
            image:
              "https://raw.githubusercontent.com/bpaksi/Gilt-Frame/main/public/marker/marker-v3-gold-512.png",
            companion_message: {
              to: "companion2",
              channel: "sms",
              body: "You are not the one we seek. But you walk beside her. Do not interfere.",
            },
          },
        },
        ch2_museum_proximity: {
          order: 3,
          type: "sms",
          name: "The Arrival",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "Send when Find My shows her at or near the AIC. The big moment. Also triggers quest on Current tab.",
            body: "You are close. Ascend to the second floor. Gallery 273. She is waiting. giltframe.org",
            image:
              "https://raw.githubusercontent.com/bpaksi/Gilt-Frame/main/public/marker/marker-v3-gold-512.png",
          },
        },
        // SMS is the alert, email is the full briefing. These two fire back-to-back.
        ch2_email_briefing: {
          order: 4,
          type: "email",
          name: "The Briefing",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "Send immediately after ch2_museum_proximity. SMS is the alert, email is the full briefing. These two fire back-to-back.",
            subject: "The Gallery of Whispers \u2014 Your Second Trial",
            template: "ch2-briefing",
          },
        },
        // Indoor — no GPS. Text-based wayfinding with progressive hints.
        ch2_wayfinding: {
          order: 5,
          type: "website",
          name: "The Wayfinding",
          component: "WayfindingCompass",
          config: {
            wayfinding_text:
              "Gallery 273. Find the patron who shaped the Order.",
            hints: [
              {
                tier: 1,
                hint: "She lived in the age of the great Fair, 1893.",
              },
              { tier: 2, hint: "A Swedish painter captured her likeness." },
              {
                tier: 3,
                hint: "Her name shaped Chicago society. The Palmer name endures.",
              },
              {
                tier: 4,
                hint: "Anders Zorn painted Mrs. Potter Palmer. Find her portrait.",
              },
            ],
          },
        },
        ch2_confirmation: {
          order: 6,
          type: "website",
          name: "The Confirmation",
          component: "MultipleChoice",
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
                  "Nothing \u2014 her hair is unpinned",
                ],
                correct: 1,
              },
            ],
          },
        },
        ch2_seal: {
          order: 7,
          type: "website",
          name: "The Seal",
          component: "PuzzleSolve",
          config: {},
        },
        ch2_reward: {
          order: 8,
          type: "website",
          name: "The Reward",
          component: "RewardReveal",
          config: {
            primary:
              "Mrs. Palmer did not collect alone. Her closest advisor was a fellow member of the Order, a painter whose quiet work still guards a secret.",
            secondary: "Your second fragment has been placed in the vault.",
          },
        },
        ch2_wait: {
          order: 9,
          type: "website",
          name: "The Wait",
          component: "WaitingState",
          config: {},
        },
        ch2_post_solve: {
          order: 10,
          type: "sms",
          name: "Post-Solve Confirmation",
          trigger: "auto",
          config: {
            to: "player",
            _trigger_note: "Auto-send when player reaches WaitingState.",
            body: "You see what others have not. Your Chronicle has been updated. The Council is watching with growing interest.",
            image:
              "https://raw.githubusercontent.com/bpaksi/Gilt-Frame/main/public/marker/marker-v3-gold-512.png",
            companion_message: {
              to: "companion2",
              channel: "sms",
              body: "The Order sees those who stand watch. You have our thanks.",
            },
          },
        },
        // Teases Cassatt/Crystal Bridges without naming them.
        ch2_debrief_email: {
          order: 11,
          type: "email",
          name: "The Debrief",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "1-2 days after Chicago trip. Lore + teaser for next chapter.",
            subject: "The Gallery of Whispers \u2014 The Order is Pleased",
            template: "ch2-debrief",
          },
        },
        ch2_sister_release: {
          order: 12,
          type: "sms",
          name: "Companion Release",
          trigger: "auto",
          config: {
            to: "companion2",
            _trigger_note:
              "Send after quest is fully complete. Final companion message for Ch2.",
            body: "She has proven worthy. The Order releases you from your watch \u2014 until the next summons.",
          },
        },
      },
    },

    // ── Future Chapters (steps TBD) ─────────────────────────────────────────

    ch3: {
      name: "The Keeper's Archive",
      location: "Kalamazoo / KIA / Kellogg Manor",
      window: "Late Mar - Mid Apr, 2026",
      steps: {},
    },

    ch4: {
      name: "The Southern Vault",
      location: "Crystal Bridges Museum, Bentonville AR",
      window: "Mid Apr - Early May, 2026",
      steps: {},
    },

    ch5: {
      name: "The Windmill Key",
      location: "Kellogg Manor (windmill)",
      window: "May - Early Jun, 2026",
      steps: {},
    },

    ch6: {
      name: "The Living Gallery",
      location: "Shedd Aquarium, Chicago",
      window: "Early Jun - Jun 14, 2026",
      steps: {},
    },

    ch7: {
      name: "The Dunes Passage",
      location: "Sleeping Bear Dunes, MI",
      window: "Late Jun - Mid Jul, 2026",
      steps: {},
    },

    ch8: {
      name: "The Final Frame",
      location: "Kellogg Manor gazebo (by boat)",
      window: "Late Jul - Aug, 2026",
      steps: {},
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export type StepWithId = Step & { id: string };

export function getOrderedSteps(chapter: Chapter): StepWithId[] {
  return Object.entries(chapter.steps)
    .map(([id, step]) => ({ ...step, id }))
    .sort((a, b) => a.order - b.order);
}
