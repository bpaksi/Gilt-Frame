/**
 * Prints the device_token for the test track.
 * Usage: node src/scripts/get-test-token.mjs
 */

import fs from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env.local");
const envRaw = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envRaw.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env.local");
  process.exit(1);
}

const res = await fetch(
  `${url}/rest/v1/device_enrollments?track=eq.test&revoked=eq.false&select=device_token,created_at&order=created_at.desc&limit=1`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } }
);

if (!res.ok) {
  console.error(`Supabase query failed: ${res.status}`);
  process.exit(1);
}

const rows = await res.json();
if (rows.length === 0) {
  console.error("No active test-track enrollments found.");
  process.exit(1);
}

console.log(rows[0].device_token);
