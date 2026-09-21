/**
 * Reads src/config/contacts.ts and outputs the CONTACTS_JSON env var value.
 * Usage: pnpm contacts:env
 */

import { christine, bob, eileen } from "../src/config/contacts";

const json = JSON.stringify({ christine, bob, eileen });
console.log(json);
