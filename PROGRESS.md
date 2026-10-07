# Digital Heroes — PRD audit progress

**Audit date:** 2026-10-07 (read-only; no code/config/DB changes)  
**PRD source:** No standalone PRD file in repo; requirements inferred from your audit checklist and `README.md` feature map.

---

## 1. Summary

| Area | Status | % complete | Single biggest gap |
|------|--------|------------|-------------------|
| A. Subscription & payment | Partial | 78% | Subscription not enforced on every authenticated server route (only `(member)` + score actions); Stripe/portal/webhooks need live manual test |
| B. Score management | Partial | 90% | DB “latest five” trigger not covered by automated tests (Vitest covers app-side `keepLatestScores` only) |
| C. Draw system | Partial | 88% | End-to-end admin simulate → publish → rollover not verified without Supabase + service role |
| D. Prize pool | Partial | 92% | Pool fee uses env `DRAW_FEE_PER_SUBSCRIBER` (default £10), not Stripe subscription amount |
| E. Charity system | Partial | 84% | “Golf days” copy remains; charity media is URL list only (no Storage upload in admin) |
| F. Winner verification | Partial | 82% | Private bucket + RLS in migration; needs manual test on real Supabase project |
| G. User dashboard | Partial | 80% | `/dashboard` and `/dashboard/prizes` allow login without active subscription (by design for subscribe/claims) |
| H. Admin dashboard | Partial | 85% | User list, draws sync, reports require `SUPABASE_SERVICE_ROLE_KEY` |
| I. Auth & roles | Partial | 88% | No `visitor` DB role (unauthenticated only); middleware skips auth when Supabase env missing |
| J. Database | Partial | 93% | Migrations present; applying + storage bucket on a new project is manual |
| K. UI/UX | Partial | 81% | `npm run lint` fails; dev font-audit warns Geist (Next dev UI); unused `components/layout/navbar.tsx` |
| L. Error handling & edge cases | Partial | 74% | No Stripe webhook idempotency; missing Supabase env throws on `/subscribe` |
| M. Deliverables | Partial | 86% | Lint script red; no committed secrets found in tracked files |

**Overall completion (average of 13 areas):** **86%**

**Area status counts:** Done **0** · Partial **13** · Not started **0** · Broken **0** (product features) · Needs manual test **13** (all areas touching Supabase/Stripe/deploy)

---

## STEP 1 — Automated checks (this machine)

| Check | Result | Notes |
|-------|--------|--------|
| `npm run build` | **Pass** (2nd run) | First run **failed** TypeScript: `components/motion/curtain-section.tsx` — `Cannot find name 'loopId'` (lines 94–100). Second run **exit 0**, 21 routes. Warning: middleware → proxy deprecation. |
| `npx tsc --noEmit` | **Pass** | exit 0 (~66s) |
| `npm run lint` | **Fail** | **6 errors**, **10 warnings** (exit 1). Errors are `react-hooks/set-state-in-effect` in `menu-overlay.tsx`, `curtain-section.tsx`, `reveal.tsx`, `smooth-scroll-provider.tsx`, `use-count-up.ts`. |
| `npm run test` | **Pass** | **27 tests**, **8 files**, all passed |

### Test coverage map

| Covered (Vitest) | Not covered |
|------------------|-------------|
| `lib/draw/match`, `random`, `pools`, `simulate`, `sync-entry` | Stripe checkout, webhook, portal, donations |
| `lib/charity/contribution` | Auth actions, signup trigger, RLS |
| `lib/scores/rolling` | Admin actions, winner upload, storage |
| `lib/validations/score` | UI/E2E, middleware, dashboard queries |

### Next.js dev overlay / terminal (active `npm run dev`)

- **`/subscribe` without env:** server throws `Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY` (`lib/supabase/env.ts` → `app/subscribe/page.tsx`). Surfaces in browser via `app/error.tsx`.
- **Font audit (dev only):** `components/dev/font-family-audit.tsx` warns unexpected stack `Geist` (likely Next.js dev overlay), not app fonts (`app/layout.tsx` uses Inter Tight + Instrument Serif).

---

## 2. Detailed findings per area

### A. Subscription and payment

| | |
|--|--|
| **Status** | Partial — Needs manual test (Stripe + webhooks) |
| **Evidence** | Checkout: `lib/stripe/actions.ts` (`createCheckoutSessionAction`, `createBillingPortalSessionAction`). Plans: `lib/stripe/plans.ts`, env `STRIPE_PRICE_ID_MONTHLY` / `YEARLY`. Webhook route: `app/api/stripe/webhook/route.ts` → `lib/stripe/webhook.ts` handles `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted` (+ donation failures). Status mapping: `lib/stripe/sync.ts` (`mapStripeSubscriptionStatus`, `upsertSubscriptionRow`). Access: `lib/subscription/access.ts` (`subscriptionGrantsAccess`, `requireActiveSubscription`). UI: `app/subscribe/page.tsx`, `components/subscription/checkout-buttons.tsx`. |
| **Tests** | No automated tests for Stripe/webhook/sync. |
| **Gaps** | PRD “server-side subscription check on **every** authenticated request” not met: `app/dashboard/layout.tsx` only `requireUser()`; `(member)/layout.tsx` calls `requireActiveSubscription()`. `/dashboard/prizes` uses `requireUser()` only. No webhook event idempotency table. |
| **Manual** | Create products/prices, `stripe listen --forward-to localhost:3000/api/stripe/webhook`, complete monthly + yearly checkout, cancel in portal, simulate `invoice.payment_failed`, confirm `subscriptions` rows. |

### B. Score management

| | |
|--|--|
| **Status** | Partial |
| **Evidence** | Range/date: `lib/validations/score.ts`, DB `scores_score_range`, `scores_one_per_user_per_day` in `supabase/migrations/20261007120000_initial_schema.sql`. Latest five: trigger `scores_enforce_latest_five` + `lib/scores/rolling.ts`. CRUD: `lib/scores/actions.ts` (`saveScoreAction`, `deleteScoreAction`), UI `app/dashboard/(member)/scores/page.tsx`. Ordering: queries `order("played_on", { ascending: false })`. |
| **Tests** | Yes: `lib/validations/score.test.ts`, `lib/scores/rolling.test.ts`. |
| **Gaps** | Trigger behavior not asserted in CI. Admin score edit: `lib/admin/users-actions.ts`. |
| **Manual** | Insert 6 scores; confirm oldest removed. Duplicate date → UI/DB 23505 handling. |

### C. Draw system

| | |
|--|--|
| **Status** | Partial — Needs manual test |
| **Evidence** | Engine: `lib/draw/simulate.ts`, `lib/draw/random.ts`, `lib/draw/algorithmic.ts`, `lib/draw/match.ts`. Admin: `lib/draw/admin-actions.ts` (`runSimulationAction`, `publishDrawAction`, `createDraftDrawAction`). Entries: `lib/draw/sync-entry.ts`. Schema: `draws`, `draw_entries` in initial migration. Publish guard: status `simulated` only; re-check winning numbers before publish. |
| **Tests** | Yes: `lib/draw/*.test.ts` (6 files). |
| **Gaps** | Members need a **draft draw row** for current month or sync no-ops. Fewer than 5 scores: entry snapshot can be &lt; 5 (still valid). |
| **Manual** | Admin → Draws: create draft, simulate random/algorithmic, publish, verify winners + next-month `jackpot_carryover`. |

### D. Prize pool

| | |
|--|--|
| **Status** | Partial |
| **Evidence** | Split **40/35/25**: `lib/draw/constants.ts` `TIER_PERCENTAGES`. Pool math: `lib/draw/pools.ts` (`calculatePrizePools`, `splitPrizes`, tier-5 rollover). Wired in simulate/publish via `getDrawFeeConfig()` in `lib/draw/db.ts`. |
| **Tests** | Yes: `lib/draw/pools.test.ts`. |
| **Gaps** | **Fee-to-pool:** `DRAW_FEE_PER_SUBSCRIBER` (default **10**) and `DRAW_PRIZE_POOL_PERCENTAGE` (default **100**) in `.env.example` / `getDrawFeeConfig()` — **not** derived from Stripe price. Currency display mix (GBP draws vs INR marketing) per `README.md`. |
| **Manual** | Publish draw with 0 tier-5 winners; confirm carryover on next month’s draw row. |

### E. Charity system

| | |
|--|--|
| **Status** | Partial |
| **Evidence** | Signup: `lib/auth/actions.ts` + `signUpSchema` min 10%; DB `user_charity_percentage_min`; trigger `handle_new_user` in `20261007130000_signup_charity_metadata.sql` (`GREATEST(pct, 10)`). Update %: `lib/charity/actions.ts`. Contribution math: `lib/charity/contribution.ts`. Directory: `app/charities/page.tsx`, `components/charity/charities-directory.tsx` (search + featured filter). Profile: `app/charities/[slug]/page.tsx`, events via `listUpcomingCharityEvents`. Featured home: `components/home/editorial-charity-spotlight.tsx` / `getHomepageCharities`. Donations: `components/charity/donation-form.tsx`, `lib/stripe/donation-actions.ts`. Admin CRUD: `lib/admin/charities-actions.ts`, `components/admin/admin-charities-panel.tsx`. |
| **Tests** | Yes: `lib/charity/contribution.test.ts`. |
| **Gaps** | Copy: “Upcoming **golf** days” (`app/charities/[slug]/page.tsx`); migration comment mentions golf. Images: JSON URL strings only. |
| **Manual** | Signup with 10% and 25%; try 9% in UI (blocked). Donation checkout when logged in. |

### F. Winner verification

| | |
|--|--|
| **Status** | Partial — Needs manual test |
| **Evidence** | Upload: `lib/winners/actions.ts` → bucket `winner-proofs`, path `lib/winners/storage.ts`. UI: `components/winners/winner-proof-upload.tsx`, `app/dashboard/prizes/page.tsx`. Admin: `lib/winners/admin-actions.ts` (approve/reject/mark paid). DB + storage RLS: `20261007140000_winner_proof_storage.sql`, trigger `winners_guard_member_update`. |
| **Tests** | None. |
| **Gaps** | Proof upload does not require active subscription (only auth) — reasonable for lapsed winners. |
| **Manual** | Win → upload → admin preview → approve → mark paid; reject → re-upload sets `verification` back to pending (trigger). |

### G. User dashboard

| | |
|--|--|
| **Status** | Partial |
| **Evidence** | Overview: `app/dashboard/page.tsx`, `components/dashboard/dashboard-home.tsx`, queries `lib/dashboard/queries.ts`. Scores: `(member)/scores` + `requireActiveSubscription`. Charity card/slider in dashboard components. Participation/winnings queries used on home dashboard. Prizes: `app/dashboard/prizes/page.tsx`. |
| **Tests** | None for dashboard. |
| **Gaps** | Non-subscribers see dashboard shell and prizes route; scores gated under `(member)`. |
| **Manual** | Verify renewal date, plan, and empty states without subscription. |

### H. Admin dashboard

| | |
|--|--|
| **Status** | Partial — Needs manual test |
| **Evidence** | Layout: `app/admin/layout.tsx` (`requireAdmin`). Users: `app/admin/users/page.tsx`, `lib/admin/users-actions.ts`. Draws: `app/admin/draws/page.tsx`, `components/admin/admin-draws-panel.tsx`. Charities: `app/admin/charities/page.tsx`. Winners: `app/admin/winners/page.tsx`. Reports: `app/admin/reports/page.tsx`, `lib/admin/queries.ts` (`AdminReports`). |
| **Tests** | None. |
| **Gaps** | `listAdminUsers` and draw sync use `createAdminClient()` — fails without service role. |
| **Manual** | Non-admin → `/admin` redirects to `/dashboard` (`lib/supabase/middleware.ts`). |

### I. Auth and roles

| | |
|--|--|
| **Status** | Partial |
| **Evidence** | Signup/login: `app/signup`, `app/login`, `lib/auth/actions.ts`, `app/auth/callback`. Roles: `profiles.role` `subscriber` \| `admin`; `requireAdmin` in `lib/auth/session.ts`. Middleware: `middleware.ts` → `lib/supabase/middleware.ts` (protects `/dashboard`, `/admin`, `/subscribe`; admin role check). RLS on all public tables in initial migration. |
| **Tests** | None. |
| **Gaps** | `hasSupabaseEnv()` false → middleware passes through (local misconfig). “Visitor” = not logged in, not a DB role. |
| **Manual** | RLS: attempt cross-user score read via client (should fail). |

### J. Database

| | |
|--|--|
| **Status** | Partial |
| **Evidence** | `supabase/migrations/20261007120000_initial_schema.sql` (tables, indexes, RLS, triggers). `20261007130000_signup_charity_metadata.sql`. `20261007140000_winner_proof_storage.sql`. Seed: `supabase/seed.sql` prefixed **SAMPLE**. |
| **Tests** | None (SQL). |
| **Gaps** | Subscriptions writable only by admin RLS + service role (webhook uses admin client — correct). |
| **Manual** | `supabase db push` on new project; confirm `winner-proofs` bucket exists after migration. |

### K. UI/UX

| | |
|--|--|
| **Status** | Partial |
| **Evidence** | Homepage sections: `components/home/homepage-curtain.tsx` (statement, how it works, how you win, charity, pricing, CTA) + `EditorialHero`. Subscribe CTA: hero, `EditorialMobileSubscribeBar`, pricing section. Tokens: `app/globals.css`, `tailwind.config.ts` (hex only in config). Fonts: `app/layout.tsx`. Single header: `components/layout/site-header.tsx` → `SiteNavbar` + `components/layout/menu-overlay.tsx`. Motion: `components/motion/*`, `lib/motion.ts`, Lenis provider. Responsive: Tailwind breakpoints used across layout components. A11y: `globals.css` focus-visible rings; dialog close `sr-only`; reduced motion in CSS + Framer `useReducedMotion`. |
| **Tests** | None visual. |
| **Gaps** | Lint errors in motion/menu code. Dead `components/layout/navbar.tsx` unused. PRD “no golf imagery” — copy still mentions golf; palette is cream/navy/coral (no green UI found). Hardcoded hex only in `tailwind.config.ts` (acceptable token source). |
| **Manual** | Check 390 / 768 / 1440 layouts in browser. |

### L. Error handling and edge cases

| | |
|--|--|
| **Status** | Partial |
| **Evidence** | Forms: zod + `fieldErrors` in auth/scores/donations. Empty/loading: `components/dashboard/empty-state.tsx`, `loading.tsx` routes, skeletons. Payment failed: webhook `markSubscriptionLapsedByStripeId`, subscribe cancelled message. Duplicate score: 23505 in `lib/scores/actions.ts`. Publish with stale entries blocked in `publishDrawAction`. Unauthorized: middleware + `requireAdmin` + RLS. |
| **Tests** | Partial via unit tests on draw/score validation. |
| **Gaps** | Webhook retries may re-run logic (no `event.id` dedup). Zero subscribers: pools compute to 0 (no special UI). Missing env hard-crashes subscribe page instead of `ConfigMissingState`. |
| **Manual** | Stripe CLI replay same event twice; observe duplicate safety on `subscriptions` upsert. |

### M. Deliverables

| | |
|--|--|
| **Status** | Partial |
| **Evidence** | `README.md`: setup, env table, seed SQL, Stripe, tests, assumptions, deploy notes. `.env.example` matches main vars (README lists a few extra `NEXT_PUBLIC_*` with defaults in code). |
| **Tests** | N/A |
| **Gaps** | `npm run lint` fails. **TODO/FIXME:** none in `*.ts`/`*.tsx`. **console:** `app/error.tsx` (`console.error`); `app/api/stripe/webhook/route.ts` (`console.error`); `components/dev/font-family-audit.tsx` (`console.info/warn/table` in dev only). |
| **Secrets scan** | `git grep` on tracked files: no `sk_live` / long `sk_test` / JWT keys; only placeholder names in README and `.env.example`. **Git history:** not fully scanned (timeboxed); re-run `git log -p` before production if `.env` was ever committed. |

---

## 3. BUGS AND RISKS (by severity)

### Critical

1. **Production build flaked on TS error** — First `npm run build` failed on `loopId` in `curtain-section.tsx`; second run passed. **Fix:** Ensure clean build in CI; if `loopId` reappears, fix ref cleanup in that file.
2. **Webhook idempotency missing** — `lib/stripe/webhook.ts` has no `event.id` deduplication. **Fix:** Store processed event IDs in Postgres; return 200 on duplicates.
3. **Prize pool decoupled from real subscription revenue** — `getDrawFeeConfig()` uses `DRAW_FEE_PER_SUBSCRIBER` / `DRAW_PRIZE_POOL_PERCENTAGE`, not Stripe amounts. **Fix:** Document as assumption or sync fee from Stripe price metadata.

### High

4. **Subscription gate not global** — `app/dashboard/layout.tsx` does not call `requireActiveSubscription()`. **Fix:** Gate member-only features consistently or document intentional `/dashboard` preview for logged-in non-payers.
5. **Admin operations depend on service role** — `lib/supabase/admin.ts` throws without `SUPABASE_SERVICE_ROLE_KEY`. **Fix:** Document as required for production admin; show banner (already `AdminChrome` warning).
6. **`/subscribe` throws without Supabase env** — `getSupabaseEnv()` throws instead of `hasSupabaseEnv()` guard. **Fix:** Mirror `app/charities/page.tsx` `ConfigMissingState`.
7. **`npm run lint` fails (6 errors)** — CI will fail if lint is required. **Fix:** Adjust eslint config or refactor effects per `react-hooks/set-state-in-effect`.

### Medium

8. **Active subscriber counting** — Multiple `subscriptions` rows per user could exist historically; counting uses a Set but “latest” row semantics are informal. **Fix:** Unique partial index or query latest per user only.
9. **Winner proof `upsert: false`** — Re-upload after rejection may fail if path exists. **Fix:** Use upsert or delete-before-upload (partially done for old `proof_url`).
10. **Currency mismatch (GBP vs INR)** — Documented in README; easy to misconfigure Stripe. **Fix:** Align Stripe currency with display constants.
11. **“Golf” copy** — `app/charities/[slug]/page.tsx` line ~120. **Fix:** Rename to neutral “events” wording.

### Low

12. **Unused `components/layout/navbar.tsx`** — Confusing duplicate of `SiteNavbar`. **Fix:** Remove or wire up.
13. **Unused imports** — e.g. `homepage-curtain.tsx` `EditorialCharitySpotlight`. **Fix:** Clean lint warnings.
14. **Middleware deprecation** — Next 16 warns middleware → proxy. **Fix:** Run codemod when ready.
15. **`<img>` in charity/winner preview** — eslint `@next/next/no-img-element`. **Fix:** Use `next/image` where appropriate.

---

## 4. WHAT CURSOR CAN STILL DO (prioritized prompts)

1. **Webhook idempotency**  
   Add a `stripe_webhook_events` table migration and guard in `handleStripeEvent` so duplicate `event.id` returns success without double writes.  
   Update `app/api/stripe/webhook/route.ts` to use it. Add a Vitest test for the dedup helper.

2. **Subscribe page env guard**  
   In `app/subscribe/page.tsx`, if `!hasSupabaseEnv()`, render `ConfigMissingState` like charities page instead of calling `createClient()` and throwing.

3. **Fix lint errors (set-state-in-effect)**  
   Refactor `components/layout/menu-overlay.tsx`, `components/motion/reveal.tsx`, `components/motion/curtain-section.tsx`, `components/providers/smooth-scroll-provider.tsx`, and `hooks/use-count-up.ts` to satisfy `react-hooks/set-state-in-effect` without changing UX.

4. **Align subscription gating with PRD**  
   Audit all routes under `app/dashboard` and server actions; call `requireActiveSubscription()` (or shared layout) everywhere except explicit subscribe/checkout flows. Document exceptions for `/dashboard/prizes`.

5. **Tie draw pool to Stripe (optional)**  
   Read monthly/yearly price amounts from Stripe env or metadata and feed `calculatePrizePools` instead of fixed `DRAW_FEE_PER_SUBSCRIBER`.

6. **Remove golf copy**  
   Replace “Upcoming golf days” and migration comment with neutral “events” language.

7. **Integration test script**  
   Add a documented `scripts/smoke-supabase.ts` (read-only queries) for CI optional job — or expand Vitest for `subscriptionGrantsAccess` edge cases.

---

## 5. WHAT YOU MUST DO MANUALLY

- [ ] Create a **new Supabase project** (do not reuse old credentials in README placeholders).
- [ ] Link CLI / run **`supabase db push`** (or apply `supabase/migrations/*.sql` in order).
- [ ] Run **`supabase/seed.sql`** (note **SAMPLE** charities) or insert your own partners.
- [ ] Confirm Storage bucket **`winner-proofs`** exists (migration `20261007140000_winner_proof_storage.sql`).
- [ ] Stripe **test mode**: create Products + recurring Prices (**monthly** and **yearly**); set `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_PRICE_ID_YEARLY`.
- [ ] Stripe **webhook** endpoint `https://<domain>/api/stripe/webhook`; events: checkout.session.completed, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted; set `STRIPE_WEBHOOK_SECRET`.
- [ ] Local: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
- [ ] Copy **`.env.example` → `.env.local`** and fill all vars; mirror on **Vercel** (new account per your plan).
- [ ] Set **`NEXT_PUBLIC_SITE_URL`** to production URL; Supabase Auth **redirect URLs** for `/auth/callback`.
- [ ] Create user via signup; set **`profiles.role = 'admin'`** in SQL for admin UUID.
- [ ] Create **normal test subscriber** (4242 card); complete monthly and yearly checkouts separately if desired.
- [ ] Insert **draft draw** for current month (`README.md` SQL) or use Admin → Draws.
- [ ] **Deploy** to Vercel; run full manual test script below on live URL.
- [ ] Replace **`public/hero.webp`** / attribution (`lib/home/hero-image.ts`); remove unlicensed assets.
- [ ] Update **README** placeholders (live URL, no real secrets).
- [ ] Decide **yearly price** in Stripe and optional `NEXT_PUBLIC_SUBSCRIPTION_FEE_INR_YEARLY`.
- [ ] Set **`SUPABASE_SERVICE_ROLE_KEY`** in production (admin users, draws, reports).
- [ ] Configure **`DRAW_FEE_PER_SUBSCRIBER`** and **`DRAW_PRIZE_POOL_PERCENTAGE`** to match your business model (defaults: 10 and 100).

---

## 6. MANUAL TEST SCRIPT

Prerequisites: env configured, migrations applied, seed charities, Stripe webhook forwarding or production webhook, draft draw for current month.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | Open `/` logged out | Homepage loads: hero, curtain sections (how it works, how you win, charity, pricing, CTA); mobile subscribe bar visible on small viewport. |
| 2 | `/signup` — pick charity, **10%**, register | Account created; `user_charity` row with ≥10%; email confirm if enabled. |
| 3 | `/login` → `/subscribe` | Monthly + yearly checkout buttons; Stripe Checkout opens. |
| 4 | Subscribe **monthly** (4242…) | Redirect `?checkout=success`; `subscriptions.status=active`; dashboard shows active plan + renewal. |
| 5 | Customer portal | “Manage billing” opens Stripe portal; return to dashboard. |
| 6 | `/dashboard/scores` — add **6** scores on different dates | Only **5** newest remain (DB trigger). |
| 7 | Add score on **duplicate date** | Error “One score per calendar date” / 23505 handling. |
| 8 | Admin `/admin/draws` — **simulate** (random or algorithmic) | Status `simulated`; winning numbers shown; preview pools. |
| 9 | **Publish** draw | Status `published`; `winners` rows; if no 5-match winners, next month draw has increased `jackpot_carryover`. |
| 10 | Winner: `/dashboard/prizes` — upload proof | File in private bucket; admin sees pending verification. |
| 11 | Admin approve → mark **paid** | Member sees approved + paid status. |
| 12 | Log in as **non-admin** → visit `/admin` | Redirect to `/dashboard`. |
| 13 | **Yearly** plan (new or second test user) | `subscriptions.plan=yearly` after webhook. |
| 14 | `/charities` search + featured filter | List filters correctly; charity page shows events + donation form when logged in. |
| 15 | Viewport **390px / 768px / 1440px** | Single navbar, menu overlay usable; dashboard/admin nav usable. |
| 16 | Failed payment (Stripe test card for decline) or `invoice.payment_failed` | Subscription moves toward **lapsed**; scores route redirects to `/subscribe`. |

---

*End of audit.*
