/**
 * One-time backfill: set current_step_id on any active (non-completed)
 * chapter_progress rows by counting completed step_progress rows and
 * mapping to the config's ordered steps.
 *
 * Safe to run multiple times — skips rows that already have a value.
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 *
 * Run: npx tsx scripts/backfill-current-step-id.ts
 */

import { createClient } from "@supabase/supabase-js";
import { gameConfig, getOrderedSteps } from "../src/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function backfill() {
  // Find active chapter_progress rows without a current_step_id
  const { data: rows, error } = await supabase
    .from("chapter_progress")
    .select("id, chapter_id, track")
    .is("completed_at", null)
    .is("current_step_id", null);

  if (error) {
    console.error("Query error:", error.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log("No active chapter_progress rows need backfilling.");
    return;
  }

  console.log(`Found ${rows.length} row(s) to backfill.`);

  for (const row of rows) {
    const chapter = gameConfig.chapters[row.chapter_id];
    if (!chapter) {
      console.warn(`  [${row.id}] Chapter "${row.chapter_id}" not in config — skipping.`);
      continue;
    }

    const orderedSteps = getOrderedSteps(chapter);

    // Count completed steps to derive current index
    const { count } = await supabase
      .from("step_progress")
      .select("*", { count: "exact", head: true })
      .eq("chapter_progress_id", row.id)
      .not("completed_at", "is", null);

    const stepIndex = count ?? 0;
    const currentStep = orderedSteps[stepIndex];

    if (!currentStep) {
      console.warn(
        `  [${row.id}] ${row.track}/${row.chapter_id}: index ${stepIndex} is past end (${orderedSteps.length} steps) — skipping.`
      );
      continue;
    }

    const { error: updateError } = await supabase
      .from("chapter_progress")
      .update({ current_step_id: currentStep.id })
      .eq("id", row.id);

    if (updateError) {
      console.error(`  [${row.id}] Update failed:`, updateError.message);
    } else {
      console.log(
        `  [${row.id}] ${row.track}/${row.chapter_id}: set current_step_id = "${currentStep.id}" (index ${stepIndex})`
      );
    }
  }

  console.log("Backfill complete.");
}

backfill();
