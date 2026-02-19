/**
 * Validates the game config for cross-reference integrity.
 *
 * Checks:
 * 1. Every chapter's companion slot resolves to a non-null Contact in both tracks
 * 2. Steps with to:"companion" have a non-null chapter companion
 * 3. Companion messages exist only in chapters with a companion
 *
 * Run: pnpm validate:config
 */

import { gameConfig, getOrderedSteps } from "../src/config/chapters";

let errors = 0;

for (const [chapterId, chapter] of Object.entries(gameConfig.chapters)) {
  // Check companion slot resolves in both tracks
  if (chapter.companion) {
    for (const trackName of ["test", "live"] as const) {
      const track = gameConfig.tracks[trackName];
      const contact = track[chapter.companion];
      if (!contact) {
        console.error(
          `[ERROR] ${chapterId}: companion "${chapter.companion}" is null on ${trackName} track`
        );
        errors++;
      }
    }
  }

  const steps = getOrderedSteps(chapter);

  for (const step of steps) {
    if (step.type === "website") continue;

    // Check to:"companion" has a chapter companion
    if (step.to === "companion" && !chapter.companion) {
      console.error(
        `[ERROR] ${chapterId}.${step.id}: step.to is "companion" but chapter has no companion`
      );
      errors++;
    }

    // Check companion_message exists only when chapter has a companion
    if (step.companion_message && !chapter.companion) {
      console.error(
        `[ERROR] ${chapterId}.${step.id}: has companion_message but chapter has no companion`
      );
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\nValidation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log("Config validation passed.");
}
