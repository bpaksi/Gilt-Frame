import type { GameConfig, Chapter, Step } from "./types";
import { christine, bob, eileen } from "./contacts";

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
      companion2: eileen,
      companion3: null,
      _description: "Christine's real game. Irreversible.",
    },
  },

  chapters: {
    // ── Prologue ──────────────────────────────────────────────────────────────
    // Letter → SMS → Passphrase (website) → Acceptance SMS.
    // The passphrase is a proper website step rendered by QuestRunner.
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
            image: "https://giltframe.org/marker/marker-v3-gold-512.png",
          },
        },
        prologue_passphrase: {
          order: 2,
          type: "website",
          name: "The Passphrase",
          component: "PassphraseEntry",

          config: {
            placeholder: "Speak the words.",
            passphrase: "SEE TRULY",
          },
        },
        prologue_reward: {
          order: 3,
          type: "website",
          name: "The Reward",
          component: "RevealNarrative",
          config: {
            chapter_name: "The Summons",
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
          delay_mornings: 1,
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
    // Email briefing → SMS with PIN → SMS arrival → website quest.
    // The 255° compass bearing from this chapter points toward Chicago (Ch2).
    ch1: {
      name: "The Compass and the Sundial",
      location: "Kellogg Manor, Michigan",
      window: "Mar 3, 2026 (anniversary)",
      steps: {
        // Narrative email introducing the Keeper lore and website instruments.
        // Sent ~1 day before the SMS with coordinates.
        ch1_briefing: {
          order: 0,
          type: "email",
          name: "The Keeper's Legacy",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "Send ~1 day before March 3. Sets the stage for Ch1 and introduces website instruments (Journey, Oracle). First email from the Order.",
            subject: "The Keeper\u2019s Legacy",
            template: "ch1-briefing",
          },
        },
        // Coordinates are the PIN location (~125m NNE of sundial), not the sundial itself.
        // The app's wayfinding compass guides her the remaining distance.
        ch1_initiation: {
          order: 1,
          type: "sms",
          name: "The Summons",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "Send morning of March 3 while at/near Kellogg Manor for anniversary. MMS with coordinates and Marker image.",
            body: "A Marker has been placed. 42.406256, -85.402025. Your first trial begins now. giltframe.org",
            image: "https://giltframe.org/marker/marker-v3-gold-512.png",
          },
        },
        ch1_arrived: {
          order: 2,
          type: "sms",
          name: "The Arrival",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "Admin monitors player location (Find My). Send when player arrives at Kellogg Manor parking lot.",
            body: "The timekeeper awaits, Sparrow. Begin your trial. giltframe.org",
            image: "https://giltframe.org/marker/marker-v3-gold-512.png",
          },
        },
        // GPS compass from PIN (42.406256, -85.402025) to sundial (42.405278, -85.402778). ~125m walk.
        // geofence_radius: 9m ≈ 30ft. Phase 1 auto-transitions to marker tap on geofence entry.
        //
        // DEV TESTING — simulate geofence without a phone:
        //   Chrome DevTools → ⋮ menu → More tools → Sensors → Location → "Other..."
        //   Enter target coords (42.405278, -85.402778) to trigger geofence.
        //   Change coords gradually to simulate walking. Compass heading is
        //   already mouse-simulated on desktop (move mouse around canvas).
        ch1_wayfinding: {
          order: 3,
          type: "website",
          name: "The Wayfinding",
          component: "FindByGps",
          config: {
            target_lat: 42.405278,
            target_lng: -85.402778,
            geofence_radius: 9,
            wayfinding_text: "Travel to the timekeeper, Sparrow.",
            distance_gates: [
              { above: 200, text: "The Marker is far. Keep searching." },
              { above: 100, text: "You draw closer. The Marker stirs." },
              { above: 50,  text: "The Marker grows warm. You are near." },
              { above: 0,   text: "The Marker burns bright. You have arrived." },
            ],
            instruction: "The timekeeper stands before me",
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
                  "Stand at the dial and look closely at the figures around its edge.",
                  "They are not warriors, nor angels. They are gentler than that.",
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
                  "The truth is written on the dial itself. Read what it says.",
                  "Look for the inscription. It speaks of a familiar proverb.",
                ],
              },
            ],
          },
        },
        ch1_sparrow_moment: {
          order: 5,
          type: "website",
          name: "The Sparrow Moment",
          component: "FindByGps",
          config: {
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
          component: "AlignBearing",
          config: {
            compass_target: 255,
            compass_tolerance: 8,
            min_rotation: 45,
            hold_seconds: 1.5,
            instruction: "Find the way, fledgling.",
          },
        },
        ch1_reward: {
          order: 7,
          type: "website",
          name: "The Reward",
          component: "RevealNarrative",
          config: {
            chapter_name: "The Compass and the Sundial",
            primary:
              "The needle has shown you the way. Take flight, Sparrow — destiny awaits.",
            secondary: "Your first fragment has been placed in the vault.",
          },
        },
        ch1_post_solve: {
          order: 8,
          type: "sms",
          name: "Post-Solve Confirmation",
          trigger: "auto",
          config: {
            to: "player",
            _trigger_note:
              "Auto-fires after StoryReveal completes. Or manual from admin.",
            body: "The Order sees clearly. Your first fragment has been placed in the vault.",
            image: "https://giltframe.org/marker/marker-v3-gold-512.png",
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
            image: "https://giltframe.org/marker/marker-v3-gold-512.png",
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
            image: "https://giltframe.org/marker/marker-v3-gold-512.png",
            companion_message: {
              to: "companion2",
              channel: "sms",
              body: "She is exposed now. The gallery has eyes that are not ours. Stay close. Do not leave her side.",
            },
          },
        },
        // ── PAINTING 1: Find & Identify the Zorn Portrait ─────────────────────
        // FindAndConfirm: two-phase step that LOOPS until she confirms
        // she is standing in front of the correct painting.
        //
        // Phase 1 (GUIDANCE): Shows text clue + progressive hints.
        //   "Your second trial awaits. A patron of the Order presided over
        //    the great Fair of 1893. A Swedish painter captured her likeness
        //    in this very room."
        //   She reads, looks around Gallery 273, then taps "I think I've found it."
        //
        // Phase 2 (IDENTIFICATION): Multiple choice — "What is the name of
        //   the painting you stand before?" 1 correct + 3 random from the pool
        //   of real paintings in Gallery 273.
        //   Wrong → shake, auto-reveal next hint, re-randomize distractors,
        //   loop back to Phase 1.
        //   Correct → advance to observation questions.
        //
        // Painting pool: real works confirmed on display in Gallery 273.
        ch2_find_portrait: {
          order: 4,
          type: "website",
          name: "The Portrait",
          component: "FindByText",
          config: {
            guidance_text:
              "Your second trial awaits.\nA patron of the Order presided over the great Fair of 1893.\nA Swedish painter captured her likeness in this very room.",
            hints: [
              "She held the highest authority a woman could claim at the Fair.",
              "Her name shaped Chicago society. Look for a portrait, not a scene.",
              "The Palmer name endures. She stands tall, regal, commanding.",
              "Anders Zorn painted Mrs. Potter Palmer in 1893. Find her.",
            ],
            question: {
              question: "What is the name of the painting you stand before?",
              correct_answer: "Mrs. Potter Palmer — Anders Zorn",
              answer_pool: [
                "The Child's Bath — Mary Cassatt",
                "On a Balcony — Mary Cassatt",
                "The Artist in His Studio — James McNeill Whistler",
                "Arrangement in Flesh Color and Brown — James McNeill Whistler",
                "The Valley of Arconville — Theodore Robinson",
                "In the Café — Fernand Lungren",
                "The Song of the Lark — Jules Breton",
                "Two Sisters (On the Terrace) — Pierre-Auguste Renoir",
              ],
            },
          },
        },
        // ── PAINTING 1 continued: Observation & Appreciation ─────────────────
        // Now that she's confirmed she found the Zorn portrait, test that she's
        // actually looking at it. Q1 proves observation. Q2 ties back to the
        // 255° bearing from Ch1 — she confirmed the bearing points to Chicago,
        // and now she reads "Zorn / Chicago 1893" inscribed on the canvas.
        ch2_zorn_questions: {
          order: 5,
          type: "website",
          name: "The Patron's Trial",
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
                // Palmer held the gavel she used to preside over the Board of
                // Lady Managers at the 1893 World's Columbian Exposition.
              },
              {
                question:
                  "The artist inscribed this canvas at the lower left. What city appears in the inscription?",
                options: ["Stockholm", "Paris", "Chicago", "New York"],
                correct: 2,
                // Inscription reads "Zorn / Chicago 1893". Callbacks to Ch1's
                // 255° bearing pointing from Kellogg Manor toward Chicago.
              },
            ],
          },
        },

        // ── PAINTING 2: Find & Identify the Cassatt ────────────────────────
        // Same FindAndConfirm mechanic as the Zorn step, but lighter.
        // She already knows how the loop works. The guidance text IS the
        // trail transition — "The patron's eye was guided by another."
        //
        // Painting pool is tighter: works she'd see in Gallery 273.
        // Correct answer is The Child's Bath. If it's off display, swap
        // correct_answer to "On a Balcony" and update observation Qs.
        //
        // BACKUP: If The Child's Bath is off display, swap to:
        //   correct_answer: "On a Balcony — Mary Cassatt"
        //   Q-alt1: "What is the woman reading?" → "A newspaper"
        //   Q-alt2: "What does the setting reveal?" → "A private garden"
        ch2_find_cassatt: {
          order: 6,
          type: "website",
          name: "The Advisor's Trail",
          component: "FindByText",
          config: {
            guidance_text:
              "The patron's eye was guided by another.\nHer advisor's work endures in this very room.",
            hints: [
              "The advisor was a painter — an American woman living abroad.",
              "Her work depicts quiet domestic scenes — mothers, children, daily ritual.",
              "This painting was created in the same year as the portrait you just found. 1893.",
              "Mary Cassatt painted The Child's Bath. Find it.",
            ],
            question: {
              question: "What is the name of the painting you stand before?",
              correct_answer: "The Child's Bath — Mary Cassatt",
              answer_pool: [
                "On a Balcony — Mary Cassatt",
                "Mrs. Potter Palmer — Anders Zorn",
                "The Artist in His Studio — James McNeill Whistler",
                "Arrangement in Flesh Color and Brown — James McNeill Whistler",
                "The Valley of Arconville — Theodore Robinson",
                "In the Café — Fernand Lungren",
                "The Song of the Lark — Jules Breton",
                "Two Sisters (On the Terrace) — Pierre-Auguste Renoir",
              ],
            },
          },
        },
        // ── PAINTING 2 continued: Observation & Appreciation ─────────────
        // Q3 is observational (the famous overhead perspective).
        // Q4 rewards Christine's deep Cassatt knowledge (Japanese woodblock
        // influence — she would know this from years of study).
        ch2_cassatt_questions: {
          order: 7,
          type: "website",
          name: "The Advisor's Trial",
          component: "MultipleChoice",
          config: {
            questions: [
              {
                question:
                  "From what vantage does the artist compose this scene?",
                options: [
                  "From below, looking up",
                  "At eye level, facing the figures",
                  "From above, looking down",
                  "From behind, over the woman's shoulder",
                ],
                correct: 2,
                // The overhead/bird's-eye perspective is THE defining feature
                // of The Child's Bath, inspired by Japanese ukiyo-e prints.
              },
              {
                question:
                  "What artistic tradition inspired this painting's flattened perspective and bold patterns?",
                options: [
                  "Italian Renaissance fresco",
                  "Japanese woodblock prints",
                  "Dutch Golden Age still life",
                  "Spanish Baroque portraiture",
                ],
                correct: 1,
                // Cassatt visited the 1890 ukiyo-e exhibition at the École des
                // Beaux-Arts in Paris. The Child's Bath is a direct culmination
                // of that influence. Christine would know this as a Cassatt fan.
              },
            ],
          },
        },

        // ── REWARD ───────────────────────────────────────────────────────────
        // Ties both paintings together. Names Palmer. Hints at Cassatt as "a
        // fellow member of the Order" without naming her — the debrief email
        // will reveal more. Threads to Crystal Bridges / Alice Walton / Degas.
        ch2_reward: {
          order: 8,
          type: "website",
          name: "The Reward",
          component: "RevealNarrative",
          config: {
            chapter_name: "The Gallery of Whispers",
            primary:
              "Mrs. Palmer did not collect alone. Her closest advisor was a fellow member of the Order \u2014 a painter who saw what others could not. You stood before her vision today. 1893. Two frames. One purpose.",
            secondary: "Your second fragment has been placed in the vault.",
          },
        },
        ch2_post_solve: {
          order: 9,
          type: "sms",
          name: "Post-Solve Confirmation",
          trigger: "auto",
          config: {
            to: "player",
            _trigger_note: "Auto-send after StoryReveal completes.",
            body: "You see what others have not. Your Chronicle has been updated. The Council is watching with growing interest.",
            image: "https://giltframe.org/marker/marker-v3-gold-512.png",
            companion_message: {
              to: "companion2",
              channel: "sms",
              body: "The Order sees those who stand watch. You have our thanks.",
            },
          },
        },
        // Teases Cassatt → Degas → Crystal Bridges / Alice Walton / Fred
        // Meijer Gardens. The debrief should: (1) Name Cassatt obliquely as
        // "the painter who advised Palmer." (2) Reference the blindness pattern
        // (Cassatt lost her sight like Kellogg). (3) Thread to "a sculptor who
        // invited the painter into his circle" (Degas). (4) Tease "a museum
        // built into the hills of a distant state, where art and nature
        // converge" (Crystal Bridges, Arkansas). (5) Hint at Alice Walton as
        // a modern patron who "saw what others could not."
        ch2_debrief_email: {
          order: 10,
          type: "email",
          name: "The Debrief",
          trigger: "manual",
          config: {
            to: "player",
            _trigger_note:
              "1-2 days after Chicago trip. Lore + teaser for next chapter. Must thread Crystal Bridges (AR), Alice Walton, and optionally Degas/Meijer Gardens (MI).",
            subject: "The Gallery of Whispers \u2014 The Order is Pleased",
            template: "ch2-debrief",
          },
        },
        ch2_sister_release: {
          order: 11,
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
