# Gilt-Frame Release QA Run — 2026-10-16

- Target: https://giltframe.org (Vercel production)
- Viewport: 390x844, iPhone Safari UA (headless Playwright Chromium 1248); curl for headers/status
- Date/time: 2026-10-16, 09:01–09:10 ET
- SHA: unconfirmed (Vercel MCP list_deployments returned 403 for scope bob-paksis-projects; project id prj_Z9Ze4uMp1AkkoXuxzZkp8nCJQ5V0)
- Evidence: /workspace/gilt-frame/qa/run-2026-10-16/ (screenshots GF-*.png, pw-results.json, lh-home.json, lh-join.json)
- **STATUS: FAIL**

| ID | Result | Evidence |
|---|---|---|
| GF-01 | PASS | 200; scrollWidth 390 = viewport; body only "You are not the one."; no links (GF-01.png) |
| GF-02 | PASS | 200; form renders (email, name, SMS checkbox, tel, terms checkbox, submit; all 342px or less wide, x≥24); consent links to /terms and /privacy (GF-02.png) |
| GF-03 | BLOCKED | Empty: submit disabled + native "Please fill out this field." Bad email: native "missing an '@'", no request. Phone "12": no client-side error; form tried POST /api/join (I aborted it, so the UI said "Network error"). Server-side check not run because it could write a subscriber row |
| GF-04 | NOT RUN-BOB-ONLY, BLOCKED (10DLC) | — |
| GF-05 | PASS | 200; readable (14px, no h-scroll); has STOP, HELP, "Up to 10 messages per month", "Message and data rates may apply" |
| GF-06 | PASS | 200; covers email + phone collection; "We do not sell, share, or disclose ... to third parties for any purpose, including marketing" |
| GF-07 | PASS | 200; mailto:bpaksi@gmail.com shown; nav links /join,/terms,/privacy,/contact all 200 |
| GF-08 | PASS | 200, text/plain; charset=utf-8; body "User-agent: *\nDisallow: /" |
| GF-09 | FAIL | Status 404 with no stack trace, but the response has `location: /` and the browser ends on https://giltframe.org/ showing the home text "You are not the one." No styled 404 page stays at the URL. HTML root is `id="__next_error__"` (GF-09.png) |
| GF-10 | PASS | /journey, /pursuit, /oracle → 307 Location / → home text; no player data, no 500 |
| GF-11 | PASS | All 10 /the-order/* routes → 404, generic page |
| GF-12 | PASS | All 10 routes with admin_session=bogus → 307, raw `location: /the-order` |
| GF-13 | PASS | Browser: 307 → /the-order → 404 page ("You are not the one."), one hop, no loop (GF-13.png) |
| GF-14 | BLOCKED | GET /api/admin/state with no cookie and with bogus cookie → 401 {"error":"Unauthorized."}. POSTs to send/compose/chapter/reset/test/send-email not run because they could send or change data |
| GF-15 | FAIL | 10 quick POSTs {email:qa-fake@example.invalid, password:wrong} → 401×10 "Invalid credentials."; no 429, no Retry-After/ratelimit header; no Set-Cookie (good) |
| GF-16 | PASS | 200, friendly "This moment is not yet ready to be shared."; no stack trace or Supabase error (only a preconnect link) (GF-16.png) |
| GF-17 | PASS | 200 "This enrollment link is invalid or has already been used."; no Set-Cookie |
| GF-18 | UNCONFIRMED | 200 image/png (a generic fallback PNG): is the fallback image intended? Bob decides |
| GF-19 | FAIL | Nothing reflected unescaped and no stack traces, but results differ from GF-16–18: `%00` and `..%2F..%2Fetc` on /moment and /e → 400 text/plain "Bad request BAD_REQUEST <vercel id>" (Vercel edge); /api/og/..%2F → 200 png. 5000-char and `<script>` cases match GF-16–18 |
| GF-20 | NOT RUN-QA, TEST-ACCT | — |
| GF-30 | NOT RUN-QA, TEST-ACCT | — |
| GF-31 | NOT RUN-QA, TEST-ACCT | — |
| GF-32 | NOT RUN-QA, TEST-ACCT | — |
| GF-33 | NOT RUN-QA, TEST-ACCT | — |
| GF-34 | NOT RUN-QA, TEST-ACCT | — |
| GF-35 | NOT RUN-QA, TEST-ACCT | — |
| GF-36 | NOT RUN-QA, TEST-ACCT | — |
| GF-37 | NOT RUN-QA, TEST-ACCT | — |
| GF-38 | NOT RUN-BOB-ONLY, TEST-ACCT | — |
| GF-39 | NOT RUN-BOB-ONLY, TEST-ACCT | — |
| GF-40 | NOT RUN-QA, TEST-ACCT | — |
| GF-41 | NOT RUN-QA, BLOCKED (guard not in main) | — |
| GF-42 | NOT RUN-QA, TEST-ACCT, BLOCKED (GF-41) | — |
| GF-43 | NOT RUN-QA, BLOCKED (GF-41) | — |
| GF-44 | BLOCKED | Not run: an unsigned POST to the twilio/qstash webhooks could advance or send if verification is missing |
| GF-45 | NOT RUN-BOB-ONLY, TEST-ACCT | — |
| GF-50 | NOT RUN-BOB-ONLY, BLOCKED (10DLC) | — |
| GF-60 | PASS | nosniff; X-Frame-Options DENY; Referrer-Policy strict-origin-when-cross-origin; HSTS max-age=63072000; includeSubDomains; preload; Permissions-Policy geolocation=(self), magnetometer=(self), camera=(), microphone=() |
| GF-61 | PASS | / and /pursuit CSP: default-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; no unsafe-eval |
| GF-62 | PASS | /api/og/x and /robots.txt carry the same CSP/HSTS/XFO/nosniff/Referrer/Permissions headers |
| GF-63 | BLOCKED | The box can't reach port 80 at all (http://giltframe.org, example.com and vercel.com all time out), so the redirect can't be seen |
| GF-70 | FAIL | 0 CSP violations or page errors. But GF-09 logs console error "Failed to load resource: 404" (the 404 itself). Failed requests: /join → /privacy?_rsc ERR_ABORTED; /terms → /contact?_rsc and /terms?_rsc ERR_ABORTED. 01/05/06/07/16 clean |
| GF-71 | NOT RUN-QA, TEST-ACCT | — |
| GF-72 | FAIL | /the-order/login → HTTP 404 (also /the-order → 404); the browser lands on / "You are not the one."; console error "Failed to load resource: 404"; CSS chunk ERR_ABORTED. No login page served |
| GF-80 | BLOCKED | /join: perf 98, LCP 1.7 s, CLS 0, TBT 100 ms (meets). / : Lighthouse 12 NO_LCP, no perf score (FCP 0.8 s, CLS 0) |
| GF-81 | PASS | TTFB 0.337 / 0.143 / 0.151 s (cache-busted) |
| GF-82 | FAIL | Every /_next/static asset is `public,max-age=31536000,immutable`; no images loaded. But 241ec79714010235.js (282 bytes) is served with no content-encoding even when br/gzip is accepted; the other 9 are br |
| GF-83 | NOT RUN-QA, TEST-ACCT | — |

```yaml
status: FAIL
sha: unconfirmed
counts: {qa_items: 28, pass: 16, fail: 6, blocked: 5, unconfirmed: 1, not_run: 20}
failed_ids: [GF-09, GF-15, GF-19, GF-70, GF-72, GF-82]
blocked_ids: [GF-03, GF-14, GF-44, GF-63, GF-80]
```
