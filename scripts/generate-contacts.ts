/**
 * Generates src/config/contacts.ts from the CONTACTS_JSON env var.
 * Used as a prebuild step on Vercel where contacts.ts is gitignored.
 *
 * Behavior:
 *   Local  — if contacts.ts exists, skip. Never overwrites local file.
 *   Vercel — requires CONTACTS_JSON env var, generates contacts.ts.
 */

import { existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "../src/config/contacts.ts");

const isCI = !!(process.env.VERCEL || process.env.CI);
const PREFIX = "[generate-contacts]";

function log(msg: string) {
  console.log(`${PREFIX} ${msg}`);
}

function error(msg: string) {
  console.error(`${PREFIX} ERROR: ${msg}`);
}

// ── Local dev: never overwrite an existing contacts.ts ──────────────
if (existsSync(outPath)) {
  log("contacts.ts already exists — skipping generation.");
  if (!isCI) log("(Local dev detected. Your contacts.ts is untouched.)");
  process.exit(0);
}

// ── File doesn't exist — must generate ─────────────────────────────
if (!isCI) {
  error("contacts.ts is missing and this is not a CI environment.");
  error("Copy contacts.example.ts → contacts.ts and fill in values.");
  process.exit(1);
}

log("CI environment detected (VERCEL/CI). Generating contacts.ts…");

// ── Require CONTACTS_JSON env var ──────────────────────────────────
const json = process.env.CONTACTS_JSON;
if (!json) {
  error("CONTACTS_JSON env var is not set.");
  error("Add CONTACTS_JSON to your Vercel project environment variables.");
  error("Run `pnpm contacts:env` locally to generate the value from contacts.ts.");
  process.exit(1);
}

// ── Parse and validate ─────────────────────────────────────────────
let contacts: Record<string, { name: string; phone: string; email: string }>;
try {
  contacts = JSON.parse(json);
} catch (e) {
  error("CONTACTS_JSON is not valid JSON.");
  error(String(e));
  process.exit(1);
}

const keys = Object.keys(contacts);
if (keys.length === 0) {
  error("CONTACTS_JSON parsed but contains no contacts.");
  process.exit(1);
}

log(`Parsed ${keys.length} contact(s): ${keys.join(", ")}`);

// ── Generate file ──────────────────────────────────────────────────
const lines = [
  `import type { Contact } from "./types";`,
  "",
];

for (const [key, value] of Object.entries(contacts)) {
  lines.push(
    `export const ${key}: Contact = ${JSON.stringify(value, null, 2)};`,
    "",
  );
}

writeFileSync(outPath, lines.join("\n"));
log(`Wrote ${outPath}`);
log("Done.");
