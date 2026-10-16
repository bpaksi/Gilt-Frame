# Plan: security pass (send guard, admin auth, QA fixes)

Status: draft, waiting on Bob's approval (gate G-plan)
Tier: Full. The format follows PR #3's `docs/sdlc.md` (Depends on / Touches / Deps change / batches) and adds `Runs:` for each step.
Executor: Bob runs it locally in Claude Code on his Mac, after bloodtower R1 batch B4. Use one worktree or fresh clone per step and never edit `~/Development/Personal/Gilt-Frame` directly. Push one branch and open one PR per step. Do not merge until `check` is green and Bob approves.
Evidence: QA run `qa/run-2026-10-16-release.md` (2026-10-16 release run; failed GF-09, 15, 19, 70, 72, 82; blocked GF-03, 14, 44, 63, 80). This plan cites it as **[QA]**.
Base: `origin/main` @ `66f140e`. App code is under `website/`.

## Requirement review (settle with Bob at session start)

Settle these before Step 1. Record each answer in this section in the same commit as Step 1.

1. **PR #3 (`docs/sdlc`).** Should it merge first, so this plan's guard implements its "Send safety" spec? Or should Step 1 supersede it, folding the guard text into its own commit and closing #3? Default: merge #3 first and treat this plan as its first milestone plan. If you'd rather not, Step 1 also edits `docs/sdlc.md`.
2. **Arming model for live sends.** Under PR #3, production sends only when `VERCEL_ENV === 'production' && SENDS_ENABLED === 'true'`. Should the live track also need its own flag (`LIVE_TRACK_ARMED=true`), so a test-track send in production can't be confused with a live one? Default: yes, both flags, and the live track also requires production.
3. **`SEND_ALLOWLIST` contents.** Confirm it holds only your phone and email. Confirm that preview and dev never hold live Twilio, Resend or QStash keys (gate G-send-env).
4. **Supabase sign-ups.** Is "Allow new users to sign up" OFF in Supabase Auth settings (prod project)? Are any users other than you in `auth.users`? Step 2 still adds the allow-list, but open sign-ups mean anyone could have an account today.
5. **Admin allow-list.** Exact email(s) for `ADMIN_EMAILS`. Is it just `bpaksi@hotmail.com`?
6. **GF-15 rate limit store.** A limiter already exists (`createRateLimiter(5, 15min)` in `api/auth/admin/login/route.ts`). It keeps counts in an in-memory `Map`, and each Vercel function instance has its own, so attempts never add up. That is why QA saw 10×401. Options: (a) a Supabase table with an RPC that increments atomically (no new vendor; preferred), or (b) Upstash Redis via `@upstash/ratelimit` (new dependency and env vars). Default: (a). Also: should the limit key on IP only, or on IP plus email? Default: both, 5 per 15 min each.
7. **GF-19 og fallback.** For an invalid token, should `/api/og/[token]` return the default brand card (200, current behaviour for unknown tokens) or 404? Default: 404 for a malformed token, default card for a well-formed but unknown token, so link previews never break.
8. **GF-72.** `/the-order/login` returns 404 by design unless `?k=<ADMIN_KEY>` matches (`the-order/login/page.tsx` calls `notFound()`). `/the-order` itself has no `page.tsx`. Confirm both are intended (a hidden admin). Should `/the-order` with a valid session redirect to `/the-order/current`? Default: keep it hidden, close GF-72 as "by design", and leave `/the-order` unchanged.
9. **GF-09 styled 404.** `src/app/not-found.tsx` calls `redirect("/")` on purpose. Should unknown URLs show a styled in-world 404 instead? If yes, should hidden admin routes (GF-72) also show that page rather than redirect? Default: a styled 404 for everything, with status 404 and no redirect.
10. **Answer checks (item 4).** Are hint text and wrong-answer pools fine to keep in the client payload as long as `correct_answer` and `passphrase` are removed? Default: yes.
11. **Testing page.** Where should `dev_gps_test` live? Default: a separate `devFixtures` export in `website/src/config/dev-fixtures.ts`, read only by `/the-order/testing`. Is it fine to delete the `ch3` stub from `config.ts` and the `ch3` case in `SealSVG.tsx` (Chapter_Map stays the source of truth)?
12. **GF-82.** Is a 282-byte chunk served without encoding acceptable as Vercel behaviour (it skips compression on tiny files)? Default: verify, then close as won't-fix.

## Steps

### Step 1: Vitest, CI and the send guard (PR #3)
- Runs: local
- Branch: `feat/gilt-frame-send-guard`
- Depends on: Requirement review items 1–3
- Touches: website/package.json, website/pnpm-lock.yaml, website/vitest.config.ts, website/src/**/*.test.ts, .github/workflows/check.yml, website/src/lib/messaging/**, website/src/app/api/webhooks/**, website/src/app/api/join/route.ts, website/src/app/api/admin/test/send-email/route.ts, website/src/app/api/admin/send/route.ts, docs/sdlc.md (only if item 1 = supersede or item 2 = yes)
- Deps change: yes (vitest)

Problem: `sendStep(track, …)` in `src/lib/messaging/send.ts` resolves recipients from `gameConfig.tracks[track]` and calls `sendSms` / `sendEmail` with no check. Other direct callers are the inbound Twilio webhook, `api/join`, `api/admin/test/send-email`, and `enqueueDelayedStep` (QStash) in `qstash.ts`. PR #3 only describes a guard in its docs.

Build:
1. Add `website/src/lib/messaging/guard.ts`:
   - `type SendDecision = { mode: "send" } | { mode: "dry-run"; reason: string }`
   - `decideSend({ track, channel: "sms"|"email"|"qstash", to }): SendDecision`. It is pure and reads env through an injectable `env` argument (default `process.env`) so it can be tested.
   - Rules: (a) `track === "live"` sends only when `VERCEL_ENV === "production"` and `SENDS_ENABLED === "true"` and `LIVE_TRACK_ARMED === "true"` (item 2). Otherwise it **blocks**: it returns dry-run with reason `live-not-armed` and logs at `console.warn`. (b) In production, a non-live send needs `SENDS_ENABLED === "true"`. (c) Outside production, it sends only if `to` (normalised E.164 or lower-cased email) is in `SEND_ALLOWLIST`. Otherwise it dry-runs.
   - Add `guardedSendSms` / `guardedSendEmail` / `guardedPublish` wrappers that call `decideSend`. On dry-run they log `[send-guard] DRY-RUN {track, channel, to: redacted, reason}` and return `{ success: true, messageStatus: "dry-run" }` without calling Twilio, Resend or QStash.
2. Make the raw `sendSms`, `sendEmail` and `publishJSON` callers module-private, or rename the raw functions `rawSendSms` etc. and stop exporting them from `messaging/`. Every call site listed above (including the SMS→email fallback inside `send.ts`) now goes through the guarded wrapper and passes `track`.
3. The QStash delivery webhook (`api/webhooks/qstash`) calls the guard again at delivery time.
4. Record `messageStatus = "dry-run"` in the existing message log/event rows. If the column is an enum, map it to the nearest existing value and add `metadata.dry_run = true`. Do not add a migration without asking Bob.
5. Add Vitest (`pnpm test`) and `.github/workflows/check.yml`, with job `check` running lint, `pnpm typecheck`, `pnpm test` and `pnpm build` in `website/`. Give it a non-live `CONTACTS_JSON` fixture (no real PII). This follows PR #3's Step 1 wording.

Tests (`guard.test.ts`, `send.test.ts` with Twilio, Resend and QStash modules mocked):
- live + unarmed (each of the three flags missing in turn) → dry-run, and the raw sender is never called
- live + fully armed in production → send
- live outside production, even with everything set → dry-run
- test track in preview: allowlisted phone → send; non-allowlisted phone → dry-run; email is matched case-insensitively
- test track in production without `SENDS_ENABLED` → dry-run
- the SMS→email fallback goes through the guard too
- the QStash delivery path re-checks the guard; a recipient removed from the allowlist after scheduling → dry-run
- static test: no file outside `lib/messaging/` imports the raw sender (an `rg`-style assertion over `src/`)

Acceptance criteria:
- `rg -n "sendSms\(|sendEmail\(|publishJSON\(" website/src` shows only the guarded wrappers and their internals.
- With no env flags set, `pnpm dev` plus an admin "send" on the test track logs DRY-RUN and makes no Twilio, Resend or QStash network call.
- `check` is green. Bob turns on branch protection that requires `check` after this merges.

### Step 2: Admin auth (allow-list and login rate limit, GF-15)
- Runs: local
- Branch: `fix/gilt-frame-admin-auth`
- Depends on: 1, Requirement review items 4–6
- Touches: website/src/lib/admin/auth.ts, website/src/lib/rate-limit.ts, website/src/app/api/auth/admin/**, website/src/app/the-order/(protected)/layout.tsx, supabase/migrations/* (new, only if 6 = Supabase store), website/src/lib/**/*.test.ts
- Deps change: no (or yes if item 6 picks Upstash)

Build:
1. `verifyAdminSession()` in `lib/admin/auth.ts` currently returns true for any `supabase.auth.getUser()` user. It should also require `data.user.email` (lower-cased) to be in `ADMIN_EMAILS` (comma-separated env), and return false when `ADMIN_EMAILS` is unset (fail closed). Extract `isAllowedAdmin(email, env)` as a pure function.
2. In `api/auth/admin/login/route.ts`, after a successful `signInWithPassword`, sign out and return 401 with "Invalid credentials." if the email is not allow-listed. Count that as a failed attempt.
3. GF-15: replace the in-memory `Map` limiter in `lib/rate-limit.ts` with a durable one (item 6). Supabase option: migration `admin_login_attempts(key text primary key, count int, reset_at timestamptz)` plus a `security definer` RPC `hit_login_limit(key, max, window_s)` that upserts and increments atomically and returns `{allowed, retry_after}`. Call it via the service-role admin client, keyed on `ip:<ip>` and `email:<lower(email)>`. On block, return **429** with a `Retry-After` header. Check the limit *before* calling Supabase, and record failures only. Keep the `getClientIp` header order, but prefer `x-vercel-forwarded-for`, then `x-forwarded-for`.
4. Keep the existing in-memory limiter for `api/auth/passphrase` and `api/oracle` unless Bob says to move them too. Note it as a gap.

Tests:
- `isAllowedAdmin`: listed / unlisted / case / unset env → false
- limiter: the 6th failed attempt in the window → blocked; after the window → allowed; success clears nothing for other keys (unit test against an injectable store interface, with in-memory fake)
- route test: 10 bad passwords → at least one 429 with `Retry-After` (mocked Supabase)

Acceptance criteria: re-run [QA] GF-15 against the preview: 10 quick bad POSTs → a 429 by the 6th, with `Retry-After` and no Set-Cookie. A Supabase user not in `ADMIN_EMAILS` cannot open `/the-order/current` or any `/api/admin/*` (403/redirect).

### Step 3: Server-side answer checks
- Runs: local
- Branch: `fix/gilt-frame-server-answer-checks`
- Depends on: 1, item 10
- Touches: website/src/components/game/quest/**, website/src/components/game/ui/AnswerQuestion.tsx, website/src/components/page/ReplayQuestions.tsx, website/src/components/game/CLAUDE.md, website/src/config/CLAUDE.md, website/src/lib/actions/quest.ts, website/src/app/(game)/pursuit/**, website/src/config/types.ts, website/src/lib/**/*.test.ts
- Deps change: no

Problem: `PassphraseEntry.tsx:41` compares input to `config.passphrase` in the browser. `MultipleChoice.tsx` and `AnswerQuestion` receive `correct_answer`, and `recordAnswer` trusts what the client sends. The answers end up in the client bundle and the RSC payload.

Build:
1. Add server actions in `lib/actions/quest.ts`: `checkPassphrase(stepId, input)` and `checkAnswer(stepId, questionIndex, selected)`. Each loads the step from `gameConfig` on the server, compares (trimmed, case-insensitive for the passphrase), records the attempt (reusing `recordAnswer` / event insert), and returns `{ correct: boolean }`. Only advance the quest when the answer is correct.
2. Before passing step config to client components, strip `passphrase` and `correct_answer` with a `toClientStepConfig(step)` sanitizer. For multiple choice, send the shuffled options (correct one included) without marking which is correct.
3. The components call the actions and keep their current UX (shake/hint on wrong, reveal on right). The admin gallery/showcase can still pass full config.

Tests: the sanitizer removes `passphrase` and `correct_answer` from every step in `gameConfig` (iterate all chapters); `checkPassphrase` and `checkAnswer` return true/false; a wrong answer does not advance.

Acceptance criteria: on the `/pursuit` page, view-source and the RSC payload contain neither the passphrase nor any `correct_answer` (test with `curl` plus `rg`). Playtesting the test track still works end to end.

### Step 4: Testing page fixture and config cleanup (with the AIC 255° follow-up)
- Runs: local
- Branch: `chore/gilt-frame-dev-fixtures`
- Depends on: 1, item 11 (independent of 1–3, but run it after 3 because both touch config consumers)
- Touches: website/src/config/config.ts, website/src/config/dev-fixtures.ts (new), website/src/config/index.ts, website/src/app/the-order/(protected)/testing/**, website/src/components/ui/SealSVG.tsx, website/scripts/validate-config.ts
- Deps change: no

Build:
1. Move `dev_gps_test` out of `gameConfig.chapters` into `devFixtures` in `config/dev-fixtures.ts`. `/the-order/testing/page.tsx` (it uses `Object.keys(gameConfig.chapters)` today) lists `chapters` plus `devFixtures` under a "Fixtures" heading. Make sure progress, current, gallery, timeline, PlayerStateCard and ChapterEditor no longer show it.
2. Delete the `ch3` stub (`config.ts` ~L616) and the `ch3` case in `SealSVG.tsx` if nothing else needs it (`rg ch3 website/src`).
3. **AIC follow-up:** in `ch2_patrons_trial`, Q2 ("What city appears in the inscription?"), hint 2 currently reads "…and where the 255° bearing led you." Reword it so it only describes this canvas. Suggested text: "The inscription names the city where this portrait was painted." Also rewrite the comments near L111, L266, L292, L403 and L444 that say the Ch1 255° bearing "points to Chicago". Rule: a station never points to another station; pointers come from the slot at play time. Leave the bearing as a fact of the sundial station (Ch1 L222–246) with no destination named. Check with `rg -n "255" website/src/config`.
4. `validate-config.ts`: fail if any chapter key does not match `^(ch\d+|prologue|…existing ids)$`, so fixtures can't sneak back in.

Tests: `pnpm validate:config` passes. A unit test asserts `gameConfig.chapters` has no `dev_` keys. A test asserts no step text in `ch2` mentions "255".

Acceptance criteria: the testing page still runs the GPS fixture. Admin progress shows only story chapters.

### Step 5: Public-route input hardening (GF-19, GF-03)
- Runs: local
- Branch: `fix/gilt-frame-token-and-phone-validation`
- Depends on: 1 (join route touched there), item 7
- Touches: website/src/lib/validation.ts (new), website/src/app/moment/[token]/**, website/src/app/e/[token]/**, website/src/app/api/og/[token]/**, website/src/app/api/join/route.ts, website/src/app/join/_components/JoinForm.tsx, website/src/lib/messaging/twilio.ts (toE164 only), website/src/lib/**/*.test.ts
- Deps change: no

Build:
1. `isValidShareToken(t)`: share tokens are `crypto.randomUUID()` (`lib/actions/moments.ts:80`), so validate against the UUID v4 regex. Check `/e/[token]` for its own token source and match that format. Call it at the top of `/moment/[token]` (`notFound()`), `/e/[token]` (404), and `/api/og/[token]` (per item 7: 404 for malformed, default card for unknown). Do this before any Supabase query.
2. [QA] GF-19 notes that `%00` and `..%2F` on /moment and /e already get Vercel's edge 400 before the app runs. That's acceptable, so don't fight it. `/api/og/..%2F` → 200 png is the case this step fixes.
3. GF-03: `toE164("12")` returns `"+12"`, which the join route accepts. Add `parseUsPhone(input): string | null`, which accepts only 10 digits or 11 starting with 1 and rejects area/exchange codes starting with 0 or 1. Use it in `api/join/route.ts` (400 "Please enter a valid US phone number.") and in `JoinForm.tsx` for inline validation before submit. `toE164` keeps its signature for existing callers.

Tests: the token validator accepts/rejects (uuid, `..%2F`, `%00`, 5000 chars, `<script>`). `parseUsPhone` handles `12`, `555-0100`, `(269) 555-0142`, `+1 269 555 0142`, `11234567890`. Route test: bad phone → 400 and no Supabase insert (mocked).

Acceptance criteria: re-run [QA] GF-19 and GF-03 on preview. `/api/og/..%2F` returns 404 (or the default card per item 7). Phone "12" shows an inline error and never POSTs.

### Step 6: Routing and polish (GF-09, GF-72, GF-70, GF-82)
- Runs: local (low risk; could also be a cloud agent)
- Branch: `fix/gilt-frame-404-and-polish`
- Depends on: 1, items 8, 9, 12
- Touches: website/src/app/not-found.tsx, website/src/app/the-order/**/not-found.tsx (if needed), website/src/app/join/**, website/src/app/terms/**, website/src/components/page/** (Link prefetch props only), website/next.config.ts (only if GF-82 needs it)
- Deps change: no

Build:
1. GF-09: `not-found.tsx` currently logs and `redirect("/")`, which [QA] saw as a 404 with `location: /`. Replace it with a styled in-world 404 page (Tone North Star, `docs/UI/`) that returns status 404 and has no redirect. Keep the `[404]` log line.
2. GF-72: no code change if Bob confirms item 8. Mention it in the PR as "by design: ADMIN_KEY-gated". After step 1 the hidden routes show the styled 404, which is fine.
3. GF-70: the `?_rsc` ERR_ABORTED entries on /join (→/privacy) and /terms (→/contact, /terms) are prefetches cancelled by navigation and are harmless. Set `prefetch={false}` on those footer/legal `Link`s so the console stays clean. Don't do anything more.
4. GF-82: run `curl -sI -H 'Accept-Encoding: br,gzip' https://giltframe.org/_next/static/chunks/<file>`. Vercel skips compression for very small files, so if the 282-byte chunk is one of those, close it as won't-fix and note that in the PR. No code change.

Tests: a render test that `not-found` sets no redirect (or Playwright smoke if one exists). Manual: `curl -sI <preview>/does-not-exist` → 404 with no `location`.

Acceptance criteria: re-run [QA] GF-09, GF-70 and GF-72 on preview. GF-82 has a written disposition.

## Batches
- G0: Requirement review answered (Bob, at session start)
- B1: 1 (Deps change; must merge first, then turn on `check` protection)
- B2: 2, 5 (no Touches overlap; merge order 2, 5)
- B3: 3, 4 (run sequentially; merge order 3, 4)
- B4: 6

Order matches priority: send guard → admin auth/GF-15 → answer checks → testing page → GF-19/GF-03 → GF-09/72/70/82. Step 5 runs in B2 because it's small and its Touches don't overlap step 2.

## Per-step runbook (Claude Code, local)
1. `git fetch origin && git worktree add ../gf-<slug> -b <branch> origin/main` (or a fresh clone outside the main checkout).
2. `cd website && pnpm install && pnpm dev` (port 3501). Use only the test track and no live keys in `.env.local`.
3. Implement within Touches. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
4. Push, then `gh pr create --title "<Step N>: …" --body` with the step id, QA ids re-run, and evidence.
5. If anything deviates from Touches or deps, update this plan in the same PR.

## Results
(fill in per step: PR, QA re-run outcome, gaps)
