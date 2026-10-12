# digital.HEROES: full project context (for interview prep)

> **Prompt for Claude:** I built the project described below and I have an interview about it today. Using this context, give me interview prep questions, from easy to hard: product/overview, architecture, Next.js, Supabase/Postgres/RLS, payments and webhooks, the draw algorithm, security, testing, scalability, and "what would you do differently". For each question, give a short model answer based on my actual implementation, and point out where an interviewer is likely to push back (the known weaknesses section).

---

## 1. Elevator pitch (60 seconds)

digital.HEROES is a **charity-first golf subscription platform** for the Indian market. Members pay a monthly or yearly subscription (INR, through Razorpay), log their **Stableford golf scores** (1–45), and are entered into a **monthly prize draw**. A member's draw "numbers" are their latest 5 scores. Each month the admin generates 5 winning numbers. Matching 5, 4 or 3 numbers wins a share of the prize pool (40% / 35% / 25%). With no 5-match winner, the jackpot rolls over to next month. **At least 10% of every subscription is pledged to a charity the member picks**, and members can also make one-off donations. Winners upload proof, and the admin approves or rejects it and marks it paid.

- **Live:** https://digital-heroes-silk.vercel.app (deployed on Vercel)
- **Built:** October 2026, about 19 commits, started from a PRD/assignment brief
- **Roles:** Visitor (no session), Subscriber (registered member), Admin

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16.4** (App Router, Server Components, Server Actions, Turbopack), **React 19.3**, TypeScript |
| Styling/UI | Tailwind CSS 4, shadcn/ui, Base UI, Radix Slot, lucide icons, sonner toasts, class-variance-authority |
| Motion | framer-motion, Lenis smooth scroll (intro curtain animation, route wipes, scroll reveals) |
| Backend | **Supabase**: Auth (email/password), Postgres, Storage, Row-Level Security |
| Payments | **Razorpay** Subscriptions API + Orders (for donations), plus a `mock` provider for demos |
| Validation | **Zod 4** (shared between server actions and client forms) |
| Testing | **Vitest**: 92 unit tests in 22 files, all passing |
| Hosting | Vercel |

`next.config.ts` turns on `cacheComponents: true` and `partialPrefetching: true`.

## 3. Architecture

```
app/
  (marketing)/   public pages: home, how-it-works, charities, charities/[slug], winners, faq, contact, privacy, terms
  (auth)/        login, signup, forgot-password, reset-password
  (app)/
    dashboard/   overview, settings, prizes, (member)/scores   <- (member) layout requires an active subscription
    subscribe/   plan checkout
    admin/       overview, users, draws, winners, charities, messages, reports
  api/payments/webhook/route.ts   the ONLY API route (Razorpay webhook)
  auth/callback/route.ts          exchanges email-confirm / password-reset codes for a session
components/      UI split by feature (admin, auth, charity, dashboard, draw, home, motion, scores, subscription, winners, ui)
lib/             domain logic split by feature (auth, scores, draw, payments, winners, charity, admin, subscription, supabase, validations)
supabase/migrations/   17 SQL migrations: schema, RLS, triggers, functions, indexes
scripts/seed.ts  seeds 6 demo accounts and a full draw lifecycle
middleware.ts    session refresh + route protection
```

**Key patterns**
- **Server Components read data. Every mutation is a Server Action** in a `"use server"` file under `lib/**/actions.ts` (15 files). The browser Supabase client is never imported.
- **Route groups** `(marketing)`, `(auth)` and `(app)` each have their own layout. The nested group `dashboard/(member)/` has a layout that calls `requireActiveSubscription()`, so score pages are gated while `/dashboard`, `/settings` and `/prizes` are not.
- **Defense in depth, 3 layers:** (1) middleware redirects (convenience), (2) `requireUser()` / `requireActiveSubscription()` / `requireAdmin()` in pages and actions, (3) Postgres RLS and triggers.
- **Payment provider abstraction:** a `PaymentProvider` interface with `razorpay-provider.ts` and `mock-provider.ts`. The DB uses provider-neutral columns (`external_subscription_id`, `external_customer_id`).
- Every route has `loading.tsx` / `error.tsx` boundaries, and there are skeleton components.

## 4. Database (Supabase Postgres)

**Tables:** `profiles` (role: subscriber | admin), `subscriptions` (plan monthly|yearly; status active|cancelled|lapsed|past_due; renewal_date; cancel_at_period_end; external ids), `charities` (slug, category, images JSON, featured), `charity_events`, `user_charity` (chosen charity + percentage ≥ 10), `donations` (amount in **paise** as integer, status, currency), `scores` (score 1–45, played_on, one per user per day), `draws` (month, status draft|simulated|published, mode random|algorithmic, winning_numbers, jackpot_carryover), `draw_entries` (score_snapshot jsonb, unique per draw+user), `winners` (tier 3/4/5, prize_amount, verification pending|approved|rejected, payment pending|paid, proof_url), `payment_webhook_events` (idempotency), `contact_messages`, `account_deletion_requests`.

**Triggers (business rules that hold no matter who the caller is):**
- `on_auth_user_created` → `handle_new_user()` creates the `profiles` and `user_charity` rows from signup metadata.
- `profiles_guard_role` blocks users from promoting themselves to admin.
- `winners_guard_member_update`: a member can only attach proof. They can't change verification, payment, amount or tier, and can't re-upload after approval.
- **Latest-5 scores:** a BEFORE INSERT/UPDATE trigger rejects a backdated score older than all 5 on file (custom SQLSTATE `DH001`, takes a per-user `pg_advisory_xact_lock`). An AFTER INSERT trigger deletes everything beyond the 5 newest by `played_on`.

**SQL functions:** `is_admin()` and `has_active_subscription(uid)` (SECURITY DEFINER helpers used in RLS), `platform_totals()` (homepage/report aggregates), `admin_list_users()` (needs SQL because emails live in `auth.users`, which PostgREST can't join; service-role only), `admin_list_winners()`.

**RLS:** enabled on every table. The pattern is "own row OR admin". Score and draw_entry writes also require `has_active_subscription(auth.uid())` in the policy itself. Draws are publicly readable only once published. Winner proofs are in a private `winner-proofs` Storage bucket with per-owner policies.

**Constraints duplicate app validation:** score `BETWEEN 1 AND 45`, unique (user, played_on), percentage ≥ 10, positive donations, enum CHECKs.

## 5. Core feature flows

### Auth
Supabase email/password, email confirmation, forgot/reset password. Sessions are cookies via `@supabase/ssr`. Middleware refreshes the session and redirects signed-out users from `/dashboard`, `/subscribe` and `/admin` to `/login?next=...`. The `next` param is sanitised by `lib/auth/safe-redirect.ts` (blocks open redirects: protocol-relative, absolute, backslash and encoded bypasses; unit tested). Admin role can only be set via SQL.

### Subscription + Razorpay
1. User picks a plan → `createSubscriptionCheckoutAction` creates a Razorpay subscription → Razorpay Checkout opens client-side → success redirects to `/dashboard?checkout=success`.
2. **Access is granted by the webhook, not the redirect.** `POST /api/payments/webhook`:
   - reads the **raw body**, verifies **HMAC-SHA256** against `x-razorpay-signature` using `timingSafeEqual` (constant time)
   - **idempotency:** inserts the event id into `payment_webhook_events` first. A unique violation (23505) means duplicate, so skip. If the handler throws, the row is deleted so Razorpay's retry gets processed.
   - maps Razorpay status → internal (`active`; `halted` → `lapsed`; `pending` → `past_due`; cancelled with future end date keeps access)
3. **Access rule** (`subscriptionGrantsAccess`): `active` grants access. `cancelled`, or `active` with `cancel_at_period_end`, grants access until `renewal_date` (+3-day grace). `past_due` / `lapsed` grant nothing. Admins bypass.
4. Cancel/resume actions call Razorpay and set `cancel_at_period_end`.
5. `PAYMENT_PROVIDER=mock` activates instantly with no gateway (for demos).

**Why Razorpay over Stripe:** India market, native INR settlement, UPI + cards + netbanking in one checkout, PCI DSS Level 1. The project started on Stripe; a migration renamed `stripe_webhook_events` → `payment_webhook_events`.

### Scores
- One score per date, any past date allowed, no future dates (Zod), range 1–45.
- Keeps the **latest 5 by date played** (not by entry time). A newer score pushes out the oldest. A score older than all 5 is rejected (DH001). The app pre-checks the same rule in `lib/scores/rolling.ts` and maps DB errors to friendly messages.
- On every save/delete, `syncUserDrawEntry()` upserts the member's `draw_entries.score_snapshot` for the current month's unpublished draw.

### Draw engine (`lib/draw/*`, the most interview-worthy part)
- **Admin-triggered, no cron:** create draft → **simulate** (generates and stores `winning_numbers`, status `simulated`, preview of winners) → **publish**.
- **Modes:**
  - *Random:* 5 independent uniform picks from 1–45, **with replacement** (duplicates possible).
  - *Algorithmic:* builds a frequency map of all active subscribers' scores and samples with P(v) = count(v) / total. Common scores come up more often, so more winners. Falls back to random if there are no scores.
- **Matching** (`countMatches`): greedy one-to-one, each winning number can be consumed once. This equals the multiset intersection, so a duplicated score only matches a duplicated winning number. 5/4/3 matches give tiers 5/4/3.
- **Prize pool:** `totalPool = activeSubscribers × DRAW_FEE_PER_SUBSCRIBER_INR (₹250 default) × DRAW_PRIZE_POOL_PERCENTAGE/100`. Tier 5 = 40% + carryover, tier 4 = 35%, tier 3 = 25%.
- **Split:** each tier pool is converted to integer **paise**, divided equally, and the leftover paise go one each to the first winners (e.g. ₹87.50 / 3 = 29.17, 29.17, 29.16).
- **Rollover:** no 5-match winner means the whole tier-5 pool goes into next month's `jackpot_carryover` (creating the next draft if needed).
- **Publish re-syncs all entries and re-matches against the STORED numbers.** It never regenerates them (unit tested), so what the admin previewed is what gets published.

### Charity
Public directory with categories and detail pages. The member picks a charity at signup with a percentage slider (min 10%, adjustable later). One-off donations go through Razorpay Orders (inserted as `pending`, completed by the webhook). The pledged percentage is recorded and shown in reports but **not deducted from the prize pool** and not actually disbursed (there is no payout ledger).

### Winners
Winners see prizes on `/dashboard/prizes` and upload proof (with size and MIME checks) to private Storage. The admin views it via a signed URL and approves, rejects (member can re-upload) or marks paid. **Lapsed members can still claim prizes:** the prizes route is outside the `(member)` gate, because the prize was earned in a paid month. The public `/winners` page shows published results.

### Admin panel
Overview stats, Users (edit role/display name, grant/edit subscription, edit scores), Draws (create/simulate/publish with pool preview), Winners queue, Charities CRUD, Contact messages, Reports. **Server-side pagination at 25 rows** for Users/Winners/Messages, with search/filter/sort/page in the **URL** (shareable, back button works), and 300 ms debounced search.

## 6. Key design decisions (with trade-offs)

1. **Draw numbers = latest 5 scores.** The PRD didn't say where numbers come from, and scores are the only per-member numeric data (Stableford range 1–45 matches). Trade-off: members with fewer than 5 scores can never hit tier 5.
2. **"Weighted by frequency" read literally:** common scores are favoured. Changing direction only touches `pickWeightedScore`.
3. **2 stored roles, 3 conceptual:** a visitor has no row. "Paid" is computed from `subscriptions`, not stored as a role, so it can't drift. Trade-off: every gate must check access, not role.
4. **Pool is a configured amount, not revenue-backed:** predictable and decoupled from payment reconciliation. Trade-off: prize + charity promises could exceed income.
5. **Admin-triggered draws:** simulate-then-publish lets the admin review first. Trade-off: no admin action means no draw.
6. **Single currency INR**, formatted with `en-IN` lakh/crore grouping in `lib/money.ts`. Trade-off: storage is split (prizes in rupees `numeric(12,2)`, donations in paise).
7. **Cancel keeps the paid period; past_due locks out immediately** (a 3-day renewal grace was added later).
8. **PRD §13/§14 pages were missing from the brief.** I flagged it and wrote my own technical and scalability decisions in `DECISIONS.md`.

## 7. Scalability work

- **Supabase silently caps responses at 1,000 rows.** With more than 1,000 members, the draw engine would only see the first 1,000 entries, so some members could never win and the pool would be undercounted. Fixed with `fetchAllRows()` (batched reads until an empty page; unit tested).
- Report and homepage sums moved into one SQL function, `platform_totals()`. Counts use PostgREST embedded counts (`draw_entries(count)`).
- Indexes: `scores(user_id, played_on DESC)`, `subscriptions(user_id, created_at DESC)` (matches the "latest subscription" lookup), `user_charity(charity_id)` (an unindexed FK), and a partial index on unresolved contact messages.
- **Known bottleneck at 100k subscribers:** entry sync makes 3 sequential DB calls per member, which takes hours and blows serverless timeouts at a few thousand members. **Plan:** a single `INSERT … SELECT … ON CONFLICT` SQL function `sync_draw_entries(draw_id)`, a `GROUP BY score` (45 rows) for the algorithmic draw, then a transactional `publish_draw()` SQL function, keeping the TypeScript as the test oracle.
- RLS perf: `is_admin()` runs per row on admin-session reads. Recommended fix: wrap it as `(select is_admin())` so Postgres evaluates it once per statement (an init-plan).
- Extensibility: plans and tiers are hard-coded unions. Adding a plan touches about 12 files. Better: one `PLANS` config record.

## 8. Testing

Vitest, 92 tests in 22 files, focused on **pure logic where bugs cost money or trust**: draw generation (seeded RNG for determinism), matching, pools/carryover/paise split, publish uses stored numbers, latest-5 rule, score validation, subscription access + grace, Razorpay status mapping, HMAC signature, webhook idempotency, open-redirect sanitising, pagination URL state, batched reads.

**Not covered:** RLS policies/triggers (no DB test harness), the webhook handler itself, server action orchestration, E2E browser flows. These were checked by hand with the 6 seeded accounts (admin, subscriber, no-sub, and 3 winner states).

## 9. Known weaknesses (expect these as tough questions)

1. **Publish isn't atomic:** winners delete → insert → status update → carryover are separate requests with no transaction and no lock against concurrent publishes. A failure partway can leave a half-published draw or lose the carryover. Fix: a single Postgres function in a transaction, with a `SELECT … FOR UPDATE` or status-guarded update.
2. **Admin actions use the service-role client, which bypasses RLS.** For those paths, `requireAdmin()` is the only guard. Remove it and nothing in the DB stops them.
3. **Some admin actions lack Zod validation** (`runSimulationAction`, `publishDrawAction`, `markContactMessageResolvedAction`). They're TypeScript-typed only, and TS types disappear at runtime.
4. **RNG is `Math.random`**, not cryptographic. For real-money draws, use `crypto.randomInt` plus an audit trail or a commit-reveal scheme.
5. **Webhook event-id fallback:** if the Razorpay payload has no top-level `id`, the fallback key could collide for repeat `subscription.charged` events, so renewals would be skipped as duplicates. Fix: use the `x-razorpay-event-id` header.
6. Webhook handler writes aren't transactional. Ignored event types are recorded as "processed".
7. **Tier pools are rounded independently**, so tier5 + tier4 + tier3 can differ from the total by ±1 paisa for non-whole-rupee pools. **Unclaimed tier 4/3 pools are not carried over.**
8. Charity % has no DB upper bound (CHECK ≥ 10 only), so a direct PostgREST update could store > 100.
9. "Browser never writes to the DB" describes how the app is built, not what's possible: the anon key and session cookie let a user call PostgREST directly. RLS limits that to their own rows.
10. No email notifications for draw results, account deletion is only a request record, no charity event admin UI, no charity payout ledger, and the prize pool isn't revenue-backed.
11. `past_due` previously locked out immediately (a grace period was added later).

## 10. Commit timeline

Initial Create Next App → frontend done → Supabase schema/RLS/auth → scores + draw engine → Stripe, then a switch to Razorpay → admin panel → pagination, indexes and scale fixes → marketing site and app shell redesign (editorial style, intro animation, route transitions) → fixes for donation completion, draw entry sync, RLS gaps, homepage stats, winner names, charity totals, lapse handling, and action error returns.

## 11. Demo accounts (seed)

`admin@digital-heroes.test`, `subscriber@…`, `nosub@…`, `winner.pending@…`, `winner.noproof@…`, `winner.rejected@…`. The seed creates last month's published draw with 4 winners (one per verification state) and this month's draft with the subscriber's entry.
