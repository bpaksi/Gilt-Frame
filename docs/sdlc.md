# How Gilt Frame applies the AI-Native SDLC Playbook

Source: [The AI-Native SDLC Playbook](https://claude.com/resources/articles/the-ai-native-sdlc-playbook), via the Bloodtower loop on `bpaksi/bloodtower`. This repo (`bpaksi/Gilt-Frame`) uses that same **lean solo loop**. Bob is originator, product owner and tech lead. Wright (Bob's Grok Bot build partner) coordinates. Cursor cloud agents plan and build, one agent per step, each on its own branch and its own pull request. Bob approves every plan before code, and he signs the other named gates. Merging is not a content-review gate once CI is required. Two rules sit on top of the Bloodtower loop: tests and CI come first, and the live track reaches Christine directly.

The repo is one product. The app is `website/` (Next.js, pnpm, Supabase, Twilio, Resend, QStash, Vercel). Schema is `supabase/`. Story, design and art live under `docs/` and land through the same pull-request loop as code. Process and guardrails are shared at the root. An agent works in its own clone. Nobody copies work into Bob's local checkout.

## Tests and CI come first

This repo has no GitHub Actions workflow and no Vitest suite yet. **No auto-merge until both of these are true:**

1. `.github/workflows/check.yml` exists and defines a job named `check`.
2. Branch protection on `main` requires that `check` status, and requires the branch to be up to date.

The `check` job runs from `website/`:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` (Vitest)
- `pnpm build`

The **first build step** is adding that suite and that workflow, and making `check` a required status check. No later build step starts until that step has merged and the protection is on. Until then the coordinator does not squash-merge and does not enable auto-merge. A green local run is not a substitute. A missing workflow is not a green check.

`pnpm build` runs `website/scripts/generate-contacts.ts`. GitHub Actions sets `CI=true`, and in CI that script requires `CONTACTS_JSON` and writes `website/src/config/contacts.ts` (gitignored PII). The check job supplies a non-live fixture. It does not use Christine's phone or email, and it does not commit real contacts or API keys.

Spell the step like this in the first plan:

```markdown
### Step 1: Tests and CI
- Depends on: G-plan
- Touches: website/package.json, website/pnpm-lock.yaml, website/**/*.test.ts, website/vitest.config.ts, .github/workflows/check.yml
- Deps change: yes
- Done when: `pnpm test` runs Vitest; the workflow job is named `check` and runs lint, typecheck, Vitest and build from `website/` with a non-live `CONTACTS_JSON`; branch protection on `main` requires `check` and an up-to-date branch. Auto-merge stays off until that protection is on.
```

## The live track reaches Christine

The `live` track is Christine's real game. SMS, MMS and email on it go to her. It is irreversible: never reset, never mock, never used as a test bed. `reset_track` in `supabase/` already refuses every track except `test`. The `test` track's contacts are Bob's (`gameConfig.tracks.test`; `CLAUDE.md` calls this routing `test_overrides`).

- A merge to `main` deploys a **Vercel preview only**. It does not deploy production.
- **Production deploys only on Bob's explicit go** (gate G-prod). Promoting a preview, or starting a production deployment, is that go. No agent, workflow or merge does it.
- While a push to `main` would still deploy Vercel production, the coordinator does not merge. Wiring preview-only on `main` is part of making the rule true, alongside the first build step.
- **No pull request may send real SMS or email to a live player.** The PR's code, CI, the Vercel preview, a QStash schedule and any agent command are all inside that rule. They use the `test` track only. A diff that can deliver Twilio or Resend traffic to Christine, or enqueue a live-track QStash job, does not merge.

## The loop

```text
docs/intent/NNNN-*.md ──accept──► docs/spec.md ──approve──► docs/plans/Mx-*.md ──approve──► batches of steps
     ▲                                                                                                    │
     │                                                     one cloud agent, own branch, own PR per step
     │                                                     CI + verifier + adversaries on the PR (≤3 rounds)
     │                                                                                                    ▼
 new gap / finding ◄──── Bob gates (plan, playtest, judgement, prod, sign-off) ◄──── squash merge, one PR at a time (Wright)
```

The merge arrow stays closed until the `check` job exists and is required. A merge deploys a Vercel preview. Production waits for G-prod.

| Playbook stage | What we do here | Artifact | Gate (Bob) |
|---|---|---|---|
| 1. Plan | New ideas and changes get an intent file in Bob's words. Story, design and art ideas included. | `docs/intent/NNNN-*.md` | Accept intent |
| 2. Design | Wright drafts or updates the spec and flags conflicts with the story canon and with `CLAUDE.md`. Decisions go in the spec's decision log. A decision that changes canon updates `Foundation_Bible.md`, `Story_Spine.md` or `Chapter_Map.md` in the same PR. | `docs/spec.md` (with decision log) | Approve spec |
| 3. Build | Plan mode first. Bob approves the plan before any code. One plan per milestone; each step is one cloud agent, one branch, one PR. Steps carry `Depends on`, `Touches` and `Deps change`, and the plan groups them into batches. Deviations update the plan **in the same commit**. The first build step is tests and CI. | `docs/plans/Mx-*.md`, root `CLAUDE.md`, `.claude/` | Approve plan (gate G-plan), before code |
| 4. Test | The developer runs the checks that exist and puts the output in the PR body. Once the workflow exists, GitHub Actions runs the `check` job on the PR. The verifier runs on the PR branch and posts its result. | Vitest, `.github/workflows/check.yml` | Only at a named gate (playtest, judgement) |
| 5. Deploy → **Merge** | Every change reaches `main` through a PR on `bpaksi/Gilt-Frame`, including story, design and art. The `adversary-bugs` and `adversary-prd` agents post findings, and the developer fixes them, for up to 3 rounds, then `needs-bob`. After `check` is required, Wright squash-merges one PR at a time when CI is green and both adversaries report no blocking findings. That merge deploys a Vercel preview only. | PRs, `.claude/agents/adversary-*.md` | G-prod for production. Bob may look at any PR; that look is optional. Nobody commits to `main` directly. |
| 6. Maintain | Findings become gap entries or a new intent. Live-track incidents are recorded, not patched in place on `main`. | Gap notes in the plan's Results, or a new intent | — |

## Story, design and art

Story (`docs/Story/`), design and art (`docs/UI/`, including art direction, mocks, letters and the pendant), and the visual assets under `website/public/` use this loop. A change is a branch and a pull request. It gets the same adversary rounds, the same three-round cap, the same `needs-bob` label, and the same merge rule as code. Nobody drops a file, a patch or a folder into Bob's local checkout for him to commit.

`Story/Chapter_Map.md` stays the status table for chapter slots. `Foundation_Bible.md` and `Story_Spine.md` stay the canon. `config.ts` holds only what is built. A PR that lets those disagree without updating the winning document is blocking. `docs/UI/Tone_North_Star.md` is the tone constraint. Taste is Bob's judgement; the PRD adversary reports risks.

## Tiers

The shipping game is **Full**. Explore-phase experiments (a gallery fixture, the `dev_gps_test` chapter, a throwaway mechanic) use **Experiment** and say so in the intent file.

| | Experiment | Full |
|---|---|---|
| Use for | Throwaway prototypes, quick mechanic tests | Anything that can reach Christine, messaging, Supabase, story canon, or the shipped app |
| Intent | One short `docs/intent/0001-*.md` | Yes, one per change |
| Spec | Optional | Required, with decision log |
| Plans | Optional single `docs/plans/plan.md` | One per milestone |
| Required `check` job | Yes, once the first build step has added it. Until then, no auto-merge. | Same |
| Adversary agents | Optional (`adversary-bugs` only) | Both, every PR |
| Branch and PR per step | Yes | Yes |
| Live-player SMS or email | Forbidden | Forbidden |
| Copy into Bob's checkout | Forbidden | Forbidden |

Promoting an Experiment to Full: write the spec from what was learned, then continue with milestone plans.

## Naming

| Thing | Convention |
|---|---|
| App | `website/` |
| Schema | `supabase/` |
| Story | `docs/Story/` |
| Design and art | `docs/UI/` |
| Intent | `docs/intent/NNNN-*.md` |
| Spec | `docs/spec.md` |
| Plans | `docs/plans/Mx-*.md` |
| Branches | `<type>/<slug>` (e.g. `feat/quest-advance`, `docs/chapter-card`, `fix/track-routing`, `chore/ci`). One branch per step. |
| Commits | Conventional commits with a scope: `feat(website): …`, `docs(story): …`, `docs(ui): …`, `chore(ci): …` |
| Repo | `bpaksi/Gilt-Frame` |

## Guardrails

Bloodtower enforces many of these with Claude hooks and lefthook. Those hooks are not in this repo. Here the coordinator and the two adversaries enforce the rules, and the `check` job enforces the ones it can run once it exists and is required. Adding hooks later is a plan step. It is not a reason to merge early.

| Guardrail | Mechanism |
|---|---|
| No auto-merge before required CI | The coordinator does not squash-merge and does not enable auto-merge until `.github/workflows/check.yml` has a job named `check` (lint, typecheck, Vitest, build) and branch protection requires it. |
| Preview on `main`, production on Bob's go | A merge to `main` deploys a Vercel preview. G-prod is the production deploy. While a push to `main` would deploy production, the coordinator does not merge. |
| No real SMS or email to a live player | No PR, CI run, preview, agent command or QStash job sends Twilio or Resend traffic to Christine or any live player. Test track only. `adversary-bugs` checks the diff. |
| Live data stays | No PR resets, mocks or rewrites live-track rows. `reset_track` stays test-only. |
| No edits to `docs/intent/**` by agents (Bob's words) | Agents draft spec and plan. They do not rewrite an accepted intent. `adversary-bugs` checks the diff. |
| No direct commits on `main` | `main` changes only by a squash-merged PR. |
| An agent writes only in its own clone | One cloud agent, one branch, one PR. Nothing is copied into Bob's local checkout. |
| A PR merges only on green required CI | After `check` is required: up-to-date branch, green `check`, and both adversaries' latest reports end in `Blocking: none`. |
| Test-first bug fixes | On a `fix/*` branch the first commit is a failing Vitest. Later commits make it pass. |
| Secrets | `.env*`, `website/src/config/contacts.ts`, and the service-role, Twilio, Resend and QStash keys stay out of git and out of the client bundle. |
| Story, design and art go through PRs | Same branch, review and merge rule as code. |

## Standing success criteria

`adversary-prd` checks these on every Full-tier PR, plus the requirement ids the plan step claims. They are the product bar until `docs/spec.md` names more.

| Id | Criterion |
|---|---|
| SC-1 | **Track isolation.** The test track delivers only to Bob. The live track is Christine's game. A test-track send cannot reach a live player. |
| SC-2 | **No live send from a PR.** No pull request, CI run, Vercel preview, agent or QStash schedule sends real SMS, MMS or email to a live player, and none enqueues one on the live track. |
| SC-3 | **Live data.** Nothing resets, mocks or rewrites live-track rows. `reset_track` stays test-only. |
| SC-4 | **Secrets and PII.** The service-role key, Twilio, Resend and QStash secrets, and `contacts.ts`, never reach the browser bundle, a public page, a log line or a commit. |
| SC-5 | **Canon and tone.** Story, design and art stay consistent with `Foundation_Bible.md`, `Story_Spine.md` and `Chapter_Map.md` (the chapter map wins on slot status). Tone follows `Tone_North_Star.md`. Bob judges taste; the adversary reports risks. |

## Who runs the agents

- **Coding agents are Cursor cloud agents.** Wright launches **one per plan step**, each on its own branch and its own PR. The agent implements that step inside its `Touches`, runs the checks that exist, and opens a PR on `bpaksi/Gilt-Frame` with the plan step id and the evidence. It does not copy the result into Bob's local checkout, and it does not commit on his machine.
- **Wright is the coordinator.** He runs the adversary loop (§4), either by asking the step's cloud agent to follow `.claude/agents/adversary-bugs.md` and `.claude/agents/adversary-prd.md` or by launching separate reviewer cloud agents with those files. The two reviewers use different models on purpose. He merges only when the merge rules below allow it. After 3 rounds with blocking findings still open, he labels the PR `needs-bob`.
- **Bob approves the plan before code.** G-plan covers steps, batches, `Touches` and open questions. Story, design and art steps wait for the plan that includes them. No `website/` or `supabase/` step starts before that sign-off.
- **The verifier** runs the checks and posts the result. It reports and never fixes. Wright runs it, or launches a cloud agent to run it. Once `check` exists, the verifier's result and CI should agree.

Bloodtower's `developer.md`, `coordinator.md`, `verifier.md`, `REVIEW.md` and hook scripts are not in this repo. This document is the script for those roles until a plan step adds the files. The review passes themselves live in `.claude/agents/adversary-bugs.md`.

## Parallel work (several developer agents at once)

The loop runs plan steps in batches. Steps in a batch run at the same time, each in its own clone; merging stays serial.

### 1. Plans declare dependencies and touch-sets

Every step in `docs/plans/Mx-*.md` carries three fields:

```markdown
### Step 3: <title>
- Depends on: 1            # step ids, gate ids, or "none"
- Touches: website/src/lib/messaging/**, website/src/lib/actions/quest.ts
- Deps change: no          # yes if it edits any package.json or pnpm-lock.yaml
```

A **batch** is a set of steps whose dependencies are already merged (or signed off, for gates), whose `Touches` globs do not overlap, and where at most one has `Deps change: yes`. The plan lists its batches and merge order:

```markdown
## Batches
- B1: 1
- B2: 2, 3, 4   (merge order: 3, 2, 4)
- G1: Bob's gate step
- B3: 5         (depends on G1)
```

Approving the plan (G-plan) approves its batches. A step starts only once its batch's dependencies are met. Deviations that change `Touches` or dependencies update the plan in the same commit. The coordinator and `adversary-bugs` check that a PR changes only files inside its step's `Touches`, and that only the step marked `Deps change: yes` changes a `package.json` or `pnpm-lock.yaml`.

### 2. One clone per step

- Wright starts one cloud agent per step. The agent uses its own clone and its own branch. Cloud agents skip a shared worktree helper.
- A local agent, if Bob runs one, uses a separate git worktree or a separate clone. It does not write in Bob's main checkout.
- Nobody copies files, patches or folders into Bob's local checkout. The pull request is the only way work reaches him.
- The agent pushes its branch and opens the PR. It does not commit to `main`.

### 3. No shared runtime state

| Resource | Rule |
|---|---|
| Dev server | `pnpm dev` in `website/` uses port 3501. A second local checkout offsets the port. Cloud agents each have their own machine. |
| Supabase | Local only (`pnpm db:start` from `website/`, Docker). Never the hosted project Christine's game uses. Never `reset_track` on `live`. |
| Twilio, Resend, QStash | Test-track credentials only, delivering to Bob. No live-player send. No live-track QStash enqueue. |
| `CONTACTS_JSON` / `contacts.ts` | Local and gitignored, or a non-live CI fixture. Never committed. |
| `pnpm-lock.yaml` / any `package.json` | Only the one step per batch marked `Deps change: yes`. |
| Generated files | Stay inside the clone. Never written into Bob's checkout. |

### 4. Merging: pull requests, serial

1. The developer commits, pushes the branch and opens a PR with `gh pr create`. The body names the plan step id (`Plan step: <id>`) and carries the evidence (commands run, exit codes, test counts, what was not verified).
2. Once `.github/workflows/check.yml` exists, CI runs the `check` job on the PR. Before it exists, the PR body says so. That is not a green check.
3. The verifier runs on the PR branch and posts its result as a PR comment (it runs things; the adversaries read and attack).
4. **Adversarial loop, at most 3 rounds.** Both adversaries review the PR and post with `gh pr review --comment`, each report ending in `Blocking: none` or `Blocking: <count>`:
   - `adversary-bugs`: bugs, edge cases, races, security and privacy, live-track and messaging safety, weak tests, spec holes, plus the review passes in its agent file.
   - `adversary-prd`: the requirement ids, acceptance tests and SC-1..SC-5 the step claims, and regressions in the ones it does not.
   The developer fixes the blocking findings, pushes, and answers each finding on the PR. The next round starts. Different models on purpose, so the two do not share blind spots. Post with `--comment`, never `--approve` or `--request-changes`. The `Blocking:` lines are what the coordinator counts.
5. **Merge** only when all of these are true: the `check` job exists and is a required status check, `check` is green on an up-to-date branch, and the latest report from **both** adversaries says `Blocking: none`. Wright merges one PR at a time, in the batch's merge order: `gh pr update-branch` if `main` moved, wait for CI again, then `gh pr merge --squash --delete-branch`. A conflict or a red check after an update goes back to the developer and counts as a new round. The merge deploys a Vercel preview only.
   **Until `check` is required, Wright does not merge.** No squash-merge and no auto-merge. The same hold applies while a push to `main` would deploy Vercel production.
6. **Escalation.** If round 3 ends with blocking findings still open, Wright labels the PR `needs-bob`, disables auto-merge on it (`gh pr merge --disable-auto`, a no-op while auto-merge is unavailable), stops that step, and reports it to Bob with the open findings. Steps that depend on it wait. The rest of the batch continues. Bob decides: fix it himself, re-scope the step, override a finding, or drop it.
7. Production is not part of this sequence. G-prod is a later gate.

Branch protection on `main` requires the `check` status and an up-to-date branch, so a red or stale PR cannot merge. The adversary condition stays the coordinator's to enforce.

### 5. Evidence per batch

When a batch has merged, Wright posts one summary (as a comment on the last PR of the batch, and in his report): per PR the link, CI result, verifier result, adversary rounds used and findings fixed, any `needs-bob` escalation, and the merge order used. He also notes that each merge deployed a preview, and whether any G-prod happened. Bob may read it. Nothing waits for him unless the next step is a gate.

### 6. Coordinator

Wright:

- reads the approved plan and the next batch whose dependencies are met,
- starts one cloud agent per step, each in its own clone and on its own branch,
- runs the verifier and both adversaries on each PR for up to 3 rounds, merges PRs serially as in §4, and escalates with `needs-bob`,
- writes the batch summary,
- stops at a gate step and asks for Bob's sign-off,
- does not commit to `main`, does not edit intent, does not start a step outside the approved plan, and does not start code before G-plan,
- does not merge without a required green `check` and `Blocking: none` from both adversaries, and does not auto-merge before that check exists,
- does not deploy production, does not send live SMS or email, and does not copy work into Bob's local checkout.

Start with two or three agents per batch. Raise the cap once first-pass CI success stays high.

## Human gates (Bob)

Bob signs off at named gates. Each gate is a step in the plan, owned by Bob, and the next batch depends on it. Nothing after a gate starts until Bob records the sign-off (a line in the plan's Results with the date, or his words on the gate's PR).

| Gate | When | What Bob does |
|---|---|---|
| G-plan | Before any code, and before story, design or art steps of that plan | Approves the plan: steps, batches, `Touches`, open questions. This is the approval before code. |
| G-playtest | After the first end-to-end run is buildable | Plays on the **test** track. Messages go to Bob. Writes notes. The live track stays untouched. |
| G-judgement | Where a success criterion needs a human verdict | Records the verdict (canon, tone, puzzle fairness) in the playtest notes. SC-5 risks wait here. |
| G-prod | When a preview should become the live site | Explicit go to deploy Vercel production. The only production deploy. |
| G-signoff | End of the milestone | Final sign-off |

A plan names which of these it uses. G-plan is always one of them. Batch evidence is posted for Bob to read whenever he likes. It is not a gate and it does not block merging, once merge is allowed at all.

## Commands

Run pnpm from `website/`.

| Command | Runs |
|---|---|
| `pnpm lint` | ESLint. Exists today. Part of `check`. |
| `pnpm typecheck` | `tsc --noEmit`. Exists today. Part of `check`. |
| `pnpm test` | Vitest. Added by the first build step. Part of `check`. |
| `pnpm build` | `generate-contacts`, then `next build`. Exists today. Part of `check`. In CI, requires a non-live `CONTACTS_JSON`. |
| `pnpm check` | Added by the first build step: lint, typecheck, test and build. This is what the `check` job runs. |
| `pnpm dev` | Next.js on port 3501. |
| `pnpm db:start` / `pnpm db:stop` / `pnpm db:reset` | Local Supabase. `db:reset` is the local database only. |

## Claude config

Present:

```text
CLAUDE.md                              # repo map, commands, track rules
website/src/config/CLAUDE.md           # config layers: contacts, tracks, steps
docs/sdlc.md                           # this file
.claude/launch.json                    # local website dev server on port 3501
.claude/agents/adversary-bugs.md       # adversarial PR review: bugs, messaging safety, review passes
.claude/agents/adversary-prd.md        # adversarial PR review against the plan and SC-1..SC-5
```

## Metrics we'll actually glance at

- First-pass check success per step, once `pnpm check` exists (leading)
- Steps whose plan had to be rewritten mid-way (leading)
- Adversary blocking findings per merged PR, and rounds used (lagging). Recurring ones go into `CLAUDE.md` as known mistakes.
- PRs escalated with `needs-bob` per batch (lagging). More than one per batch means steps are too big or the plan is unclear.
- Rebase or update-branch conflicts per merged PR (leading). Recurring ones mean the `Touches` sets are too coarse.
- First-pass CI success per PR (leading). Before the `check` job exists, this stays at zero and nothing auto-merges.
- Batch wall-clock time against the same steps run serially (lagging)
- Time a PR waits between green required CI and merge (lagging). It shows whether serial merging is the bottleneck.
- Gate turnaround: time from a gate step becoming ready to Bob's sign-off (lagging)
- Live-player SMS, MMS or email sent from a PR, CI run or preview (must stay zero)
- Production deploys with no recorded G-prod (must stay zero)
