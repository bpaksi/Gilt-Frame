/**
 * Validates the game config for cross-reference integrity.
 *
 * Checks:
 * 1. Every messaging step's `to` recipient resolves to a non-null Contact in both tracks
 * 2. Companion messages specify a slot that resolves in both tracks
 *
 * Run: pnpm validate:config
 */

import { gameConfig, getOrderedSteps } from "../src/config";

let errors = 0;

for (const [chapterId, chapter] of Object.entries(gameConfig.chapters)) {
  const steps = getOrderedSteps(chapter);

  for (const step of steps) {
    if (step.type === "website") continue;

    // Check step.config.to resolves in both tracks
    for (const trackName of ["test", "live"] as const) {
      const track = gameConfig.tracks[trackName];
      const to = step.config.to;
      const contact = to === "player" ? track.player : track[to];
      if (!contact) {
        console.error(
          `[ERROR] ${chapterId}.${step.id}: to "${to}" is null on ${trackName} track`
        );
        errors++;
      }
    }

    // Check companion_message.to resolves in both tracks
    if (step.config.companion_message) {
      const compTo = step.config.companion_message.to;
      for (const trackName of ["test", "live"] as const) {
        const track = gameConfig.tracks[trackName];
        const contact = track[compTo];
        if (!contact) {
          console.error(
            `[ERROR] ${chapterId}.${step.id}: companion_message.to "${compTo}" is null on ${trackName} track`
          );
          errors++;
        }
      }
    }
  }
}

if (errors > 0) {
  console.error(`\nValidation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log("Config validation passed.");
}
