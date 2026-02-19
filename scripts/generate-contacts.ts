/**
 * Generates src/config/contacts.ts from the CONTACTS_JSON env var.
 * Used as a prebuild step on Vercel where contacts.ts is gitignored.
 * Skips if contacts.ts already exists (local dev).
 */

import { existsSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "../src/config/contacts.ts");

if (existsSync(outPath)) {
  console.log("contacts.ts already exists, skipping generation.");
  process.exit(0);
}

const json = process.env.CONTACTS_JSON;
if (!json) {
  console.error("CONTACTS_JSON env var is not set and contacts.ts does not exist.");
  process.exit(1);
}

const contacts = JSON.parse(json) as Record<string, { name: string; phone: string; email: string }>;

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
console.log("Generated contacts.ts from CONTACTS_JSON.");
