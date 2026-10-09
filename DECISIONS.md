# Decisions

Interpretation calls made where the requirements were silent or ambiguous. Each entry names the code that implements it.

### Draw numbers come from the member's latest five scores
**Ambiguity:** 5/4/3-number matching is specified, but not where a member's "numbers" come from.
**Decision:** A member's numbers are their latest five Stableford scores (1–45). `syncUserDrawEntry()` (`lib/draw/sync-entry.ts`) upserts `draw_entries.score_snapshot` (newest `played_on` first, via `keepLatestScores`) on every score save/delete while the month's draw is unpublished. Publish re-syncs all entries (`syncAllDrawEntriesForDraw`) and then matches. `countMatches()` (`lib/draw/match.ts`) is greedy one-to-one: each winning number can be consumed once, so a duplicated score only matches a duplicated winning number. 5/4/3 matches map to tiers 5/4/3; fewer is no prize.
**Reasoning:** Scores are the only per-member numeric data in the PRD, and Stableford's 1–45 range matches the draw range (`STABLEFORD_MIN/MAX`).
**Trade-off:** A member with fewer than five scores still enters with a shorter snapshot (empty snapshots are skipped), so with 3–4 scores they can win tier 3/4 but never tier 5. Eligibility is decided at publish time, not when the scores were entered.

### Algorithmic draw = sampling proportional to raw score frequency
**Ambiguity:** "Weighted by score frequency" doesn't say which direction (favour common or rare scores) or how weights are computed.
**Decision:** `generateAlgorithmicDraw()` (`lib/draw/algorithmic.ts`) counts every stored score of every active subscriber into a 1–45 frequency map. It then draws five values independently with P(v) = count(v) / Σcount, with replacement. With no scores it falls back to `generateRandomDraw()` (uniform 1–45, also with replacement).
**Reasoning:** This is the most literal reading. Common scores come up more often, so draws produce winners more often than uniform random.
**Trade-off:** Winning numbers can repeat. Tables keyed by draw number must not assume five distinct values. If "weighted" was meant inversely (rare scores favoured), only `pickWeightedScore` changes.

### Razorpay instead of Stripe
**Ambiguity:** "Stripe or equivalent PCI-compliant provider."
**Decision:** Razorpay (PCI DSS Level 1) for subscriptions (`RAZORPAY_PLAN_ID_MONTHLY/YEARLY`) and one-off donation orders (`lib/payments/donation-actions.ts`), with `PAYMENT_PROVIDER=mock` for local runs. The project started on Stripe; `20261008140000_rename_stripe_webhook_events.sql` generalises the schema.
**Reasoning:** The target market is India. Razorpay settles in INR natively and offers UPI, cards and netbanking in one checkout, and its recurring Subscriptions API covers monthly and yearly plans.
**Trade-off:** Not portable to non-INR markets without a second provider. Legacy Stripe-era donation rows may still have `currency = 'gbp'`.

### Three user roles, two stored role values
**Ambiguity:** The PRD lists visitor, subscriber and admin.
**Decision:** `profiles.role` is `CHECK (role IN ('subscriber','admin'))`. A visitor is the absence of a session, so there's no row to hold a role. "Subscriber" means *registered member*. Paid access is computed separately from the latest `subscriptions` row (`subscriptionGrantsAccess`, mirrored by the `has_active_subscription()` RLS helper). Role self-escalation is blocked by the `profiles_guard_role` trigger.
**Reasoning:** Storing a role for unauthenticated users is impossible, and storing "paid" as a role would duplicate subscription state and drift from it.
**Trade-off:** A `subscriber` row does not imply payment. Every gate must check access, not role.

### Lapsed members keep access to prize claims
**Ambiguity:** The PRD gates the dashboard behind a subscription but doesn't say what happens to a winner whose subscription ends before they claim.
**Decision:** Score entry lives under `app/(app)/dashboard/(member)/`, whose layout calls `requireActiveSubscription()`. `/dashboard/prizes` sits outside that group and only calls `requireUser()`, as does `lib/winners/actions.ts`. Winner RLS checks `user_id = auth.uid()` with no subscription condition.
**Reasoning:** A prize is earned in a month the member paid for, so letting the subscription lapse shouldn't cost them that prize. The alternative strands winners who can't upload proof and leaves admins with unclaimable `pending` rows.
**Trade-off:** A lapsed account can still reach one dashboard route. That route can only read the member's own winner rows and upload proof (the `winners_guard_member_update` trigger blocks changes to verification, payment, amount or tier, and blocks re-upload after approval).

### Backdated scores
**Ambiguity:** "Retain the latest five scores" doesn't define what happens when a backdated round is entered.
**Decision:** Any past date is accepted, and future dates are rejected (`scoreFormSchema`). There is one score per date (`scores_one_per_user_per_day`, SQLSTATE 23505). Order is by `played_on`, not entry time. The AFTER INSERT trigger keeps the five newest dates, so a newer or mid-window score pushes out the oldest. A score older than all five on file is **rejected** with SQLSTATE `DH001` by a BEFORE INSERT/UPDATE trigger (`20261008160000_scores_reject_outside_latest_five.sql`) rather than being inserted and immediately deleted. Edits never count against themselves.
**Reasoning:** "Latest" in golf handicapping means most recent rounds played, not most recently typed. Rejecting beats silently discarding the row.
**Trade-off:** Pushing out the oldest score is still silent when a newer score is added. The member sees five chips but isn't told which one dropped.

### Draws are admin-triggered by design
**Ambiguity:** "Monthly draw" could mean an automatic cron job.
**Decision:** There is no scheduler. The admin creates a draft (`createDraftDrawAction`), runs the simulation (stores `winning_numbers`, `status = 'simulated'`), then publishes (`publishDrawAction`). Publish re-matches against the **stored** numbers (`computePublishDrawOutcome`), replaces `winners` rows, and moves an unclaimed tier-5 pool into next month's draft `jackpot_carryover`, creating that draft if needed.
**Reasoning:** The PRD gives admins control of publishing. Simulate-then-publish lets an admin review the outcome before it becomes public.
**Trade-off:** If no admin acts, no draw happens. Unpublished months are not caught up automatically.

### Single currency: INR
**Ambiguity:** The draw engine originally displayed £ while Razorpay charges ₹.
**Decision:** All display goes through `lib/money.ts` (`en-IN`, ₹, lakh/crore grouping). The draw fee is `DRAW_FEE_PER_SUBSCRIBER_INR` in whole rupees, and new donations default to `'inr'`.
**Reasoning:** The payment provider's settlement currency is the only one that's true.
**Trade-off:** Storage is still split: `winners.prize_amount` and `draws.jackpot_carryover` are rupees in `numeric(12,2)`, while `donations.amount_cents` is integer paise. Unifying on paise is recommended but not yet done.

### Prize pool is a configured amount, not derived from revenue
**Ambiguity:** The PRD gives the 40/35/25 tier split but not what the pool is a percentage of.
**Decision:** `totalPool = activeSubscribers × DRAW_FEE_PER_SUBSCRIBER_INR × DRAW_PRIZE_POOL_PERCENTAGE/100` (`calculatePrizePools`). Active subscribers are counted at simulate and publish time. Each member's charity percentage (`user_charity.percentage`, minimum 10%) is a recorded commitment that is shown in reports but **not** deducted from the pool.
**Reasoning:** This decouples draws from payment reconciliation and keeps the pool predictable for admins.
**Trade-off:** The pool isn't backed by collected revenue. With 100% pool and a fee close to the subscription price, the prize and charity promises could exceed income.

### Subscription states and access
**Ambiguity:** The PRD names active and lapsed only.
**Decision:** The schema has `active | cancelled | lapsed | past_due`. `active` grants access. `cancelled`, or `active` with `cancel_at_period_end`, grants access until `renewal_date`. `past_due` and `lapsed` grant none.
**Reasoning:** Cancelling shouldn't take away a period that's already paid for. A failed payment shouldn't keep access open indefinitely.
**Trade-off:** `past_due` locks a member out immediately, with no grace period while Razorpay retries the payment.

## Missing PRD sections

§13 (Technical requirements) and §14 (Scalability considerations) are listed in the contents at page 11, but the page is absent from the issued PDF — §12 is followed directly by §15.

We flagged this rather than assume it was unimportant, and made our own calls for both areas. Those decisions are documented below so they can be checked against the intended spec.

### Technical choices (our §13)

**Stack.** Next.js 16 (App Router) with React 19 and TypeScript, Tailwind 4, Supabase (Auth, Postgres, Storage), Razorpay (see *Razorpay instead of Stripe*), Vitest. Server Components read data. Every mutation is a Server Action in a `lib/**/actions.ts` file, so no browser code writes to the database directly. The only API route is the Razorpay webhook (`app/api/payments/webhook`).

**Authentication.** Supabase Auth with email and password, plus email confirmation and password reset. Sessions are cookies managed by `@supabase/ssr`. `middleware.ts` refreshes the session on each request, sends signed-out visitors from `/dashboard`, `/subscribe` and `/admin` to `/login?next=…` (sanitised by `lib/auth/safe-redirect.ts` to block open redirects), and turns non-admins away from `/admin`. Middleware is a convenience, not the security boundary: pages and actions re-check with `requireUser()`, `requireActiveSubscription()` and `requireAdmin()`, and the database enforces RLS regardless.

**Authorisation (RLS).** Row-level security is enabled on every `public` table. Policies follow "own row, or admin" through two `SECURITY DEFINER` helpers, `is_admin()` and `has_active_subscription(uid)`. Score and draw-entry writes also require an active subscription in the policy itself, so the subscription gate holds even if the UI is bypassed. Draws are publicly readable only once published. Rules that must hold whoever the caller is are triggers: `profiles_guard_role` (no self-promotion to admin), `winners_guard_member_update` (members can attach proof but can't touch verification, payment, amount or tier) and the latest-five score triggers. Winner proofs sit in a private `winner-proofs` bucket with per-owner storage policies. The service-role key is used only on the server (`lib/supabase/admin.ts`), for admin lists and reports, draw sync and webhooks.

**Validation.** Zod 4 schemas in `lib/validations/` validate every Server Action input on the server. The score and donation forms reuse the same schemas in the browser for inline errors. The database repeats the rules that matter most as constraints: score `BETWEEN 1 AND 45`, one score per member per day, charity percentage `>= 10`, positive donation amounts, and enumerated role, status, mode and tier values. Bad data is rejected even if application code is skipped.

**Payments.** Webhooks are HMAC-verified (`verifyRazorpaySignature`) and processed idempotently: the event id is inserted into `payment_webhook_events` first, duplicates are skipped, and a handler failure releases the row so Razorpay's retry is processed (`lib/payments/webhook-idempotency.ts`). `PAYMENT_PROVIDER=mock` swaps in a provider with the same interface for demos.

**Testing.** Vitest unit tests cover the pure logic where a mistake costs money or trust: draw generation, matching, prize pools and carryover, publish outcome, the latest-five rule, score validation, subscription access, Razorpay status mapping and signatures, webhook idempotency and redirect sanitising. 73 tests in 20 files, all passing as of 9 October 2026. Not covered by automated tests: RLS policies and triggers (there's no database test harness) and end-to-end browser flows. These were checked by hand against the seeded accounts in the README.

### Scalability (our §14)

The PRD gives no target load. We designed for a single-country launch, in the low thousands of members with one draw a month, and recorded below where the current code stops scaling and what the fix is.

**Indexing.** Every foreign key used for lookups is indexed (`subscriptions`, `donations`, `draw_entries`, `winners`, `charity_events` on their `user_id` / `charity_id` / `draw_id`). The hottest path, a member's scores, uses a composite `scores (user_id, played_on DESC)` index that serves both the dashboard and the latest-five triggers. Unique constraints double as indexes where we look things up: `draws (month)`, `draw_entries (draw_id, user_id)` (the entry upsert target), `winners (draw_id, user_id, tier)` and `subscriptions (external_subscription_id)` (webhook lookups). Featured charities have a partial index, and charity category has its own index.

**Bounded growth.** The latest-five rule caps `scores` at five rows per member, and there is one `draw_entries` row per member per draw. The large tables grow with members × months, not with how often people use the app.

**Pagination — not yet implemented.** Admin lists (users, draws, charities, winners), admin reports and the public winners page fetch whole tables and aggregate in Node. That's fine at demo scale, but it has two hard limits that break correctness before they hurt speed:
- Supabase's API returns at most 1,000 rows per request by default (the project's "Max rows" setting). Past that, counts and totals in reports would be silently wrong rather than just slow.
- `listAdminUsers` (`lib/admin/queries.ts`) reads at most 2,000 auth emails (10 pages of 200).

*Fix:* range pagination (`.range()` with `count: "exact"`) on the admin tables, and report aggregates moved into SQL views or RPCs so the database returns one summed row instead of every row.

**Draw publish.** Two parts of simulate/publish grow linearly with members and run inside a single Server Action:
- `syncAllDrawEntriesForDraw` re-syncs entries one member at a time: three sequential round trips per active subscriber. With several thousand members this risks hitting the host's function timeout.
- `loadActiveSubscriberScores` passes every active member id in one `.in()` filter, which goes into the request URL and will fail once the list outgrows the gateway's URL length limit.

Publish is also a series of separate writes (delete winners, insert winners, mark published, roll carryover into next month's draft), so a failure partway through can leave a half-published draw. *Fix:* one Postgres function per step. For example, `publish_draw(draw_id)` would snapshot entries with a single `INSERT … SELECT … ON CONFLICT`, write winners and update both draws in one transaction, and keep the matching and prize logic in its current tested TypeScript or port it alongside.

**RLS performance.** Policies call `auth.uid()` and `is_admin()` directly. Both are `STABLE`, but Postgres can still evaluate them once per row. Supabase recommends wrapping them as `(select auth.uid())` and `(select public.is_admin())` so each runs once per query. Member queries filter by `user_id` on an index, so this doesn't matter at current volumes. It's a single migration worth doing before admin queries scan large tables. `has_active_subscription()` finds a member's rows by `user_id` and then sorts them by `created_at`. A `(user_id, created_at DESC)` index would make that a single index lookup.

**Extensibility.**
- *Payments:* `PaymentProvider` (`lib/payments/types.ts`) has Razorpay and mock implementations, and the schema uses provider-neutral `external_*` columns. A second gateway is a new implementation plus an env value.
- *Draw modes:* random and algorithmic are pure functions in `lib/draw/`. A new mode is a new generator plus a value in `draws_mode_check`.
- *Prize rules:* tier splits are in `lib/draw/constants.ts`, and the fee and pool percentage are environment variables.
- *Display:* charity categories are in `lib/charity/categories.ts`, and all money formatting goes through `lib/money.ts`.
- *Roles:* adding a role (for example a charity-partner login) is a `profiles_role_check` migration plus policy updates. There's no role table to extend.

**Out of scope by design:** multiple currencies, multiple regions, scheduled draws (see *Draws are admin-triggered by design*) and email notifications (see below).

## Known limitations (scoped out)

- **Email notifications.** Only Supabase Auth emails (confirmation, password reset) are sent. Draw results and winner status are in-app only. *Would need:* a provider such as Resend, plus triggers on publish and on `winners` status changes.
- **Account deletion execution.** `account_deletion_requests` records `pending | reviewed | cancelled`. Nothing deletes the account. *Would need:* an admin action that calls the service-role `auth.admin.deleteUser` after resolving unpaid `winners` rows.
- **Charity events admin.** `charity_events` is read on public charity pages (`lib/charity/queries.ts`) but has no admin create/edit UI. *Would need:* CRUD in `admin-charities-panel` and admin RLS write policies.
- **Charity payout ledger.** Contributions are calculated and displayed but never disbursed or reconciled. *Would need:* a ledger table populated from Razorpay webhooks.
- **Revenue-backed prize pool.** See above. *Would need:* summing captured Razorpay payments for the month, minus charity commitments.
