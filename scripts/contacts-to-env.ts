/**
 * Reads src/config/contacts.ts and outputs the CONTACTS_JSON env var value.
 * Usage: pnpm contacts:env
 */

import { christine, bob, sister } from "../src/config/contacts";

const json = JSON.stringify({ christine, bob, sister });
console.log(json);
