# digital.HEROES

**Live:** https://digital-heroes-silk.vercel.app

Charity-first subscription platform: members log Stableford scores (latest five kept), enter monthly prize draws, and direct at least 10% of subscription fees to a chosen charity. Admins simulate and publish draws, verify winner proof, and manage partners.

**Stack:** Next.js 16 (App Router), TypeScript, Tailwind 4, Supabase (Auth, Postgres, Storage, RLS), Razorpay (subscriptions), Vitest.

---

## Prerequisites

- Node.js 20+
- [Supabase](https://supabase.com) project
- [Razorpay](https://razorpay.com) test account (or use `PAYMENT_PROVIDER=mock` for demos)

---

## Setup

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Environment variables

Copy the example file and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key (client + RLS) |
| `NEXT_PUBLIC_SITE_URL` | Yes | App origin, e.g. `http://localhost:3000` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin/reports | Bypasses RLS for admin lists, draw sync, homepage stats |
| `PAYMENT_PROVIDER` | Subscribe | `razorpay` (live test mode) or `mock` (instant activation, no gateway) |
| `RAZORPAY_KEY_ID` | Razorpay | Dashboard → API keys (`rzp_test_…`) |
| `RAZORPAY_KEY_SECRET` | Razorpay | Secret key paired with `RAZORPAY_KEY_ID` |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay | Webhook signing secret from Dashboard |
| `RAZORPAY_PLAN_ID_MONTHLY` | Razorpay | Subscription plan ID for monthly billing |
| `RAZORPAY_PLAN_ID_YEARLY` | Razorpay | Subscription plan ID for yearly billing |
| `DRAW_FEE_PER_SUBSCRIBER_INR` | Draws | Draw fund contribution per active subscriber, in whole rupees (default `250`). Legacy name `DRAW_FEE_PER_SUBSCRIBER` is still read as a fallback. |
| `DRAW_PRIZE_POOL_PERCENTAGE` | Draws | % of fees into pool (default `100`) |
| `NEXT_PUBLIC_SUBSCRIPTION_FEE_INR` | UI | Display-only monthly fee for charity ₹ slider (default `499`) |
| `NEXT_PUBLIC_SUBSCRIPTION_FEE_INR_YEARLY` | UI | Optional yearly display fee |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Footer | Public contact email (optional; also used for Support → Contact mailto) |
| `NEXT_PUBLIC_CONTACT_ADDRESS` | Footer | Pipe-separated address lines for stepped footer block (optional) |
| `NEXT_PUBLIC_SOCIAL_LINKEDIN_URL` | Footer | LinkedIn profile URL (optional; hidden if unset) |
| `NEXT_PUBLIC_SOCIAL_FACEBOOK_URL` | Footer | Facebook page URL (optional) |
| `NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL` | Footer | Instagram profile URL (optional) |
| `NEXT_PUBLIC_SOCIAL_YOUTUBE_URL` | Footer | YouTube channel URL (optional) |

### 3. Database

Apply migrations (Supabase CLI linked to your project):

```bash
supabase db push
```

Or run SQL from `supabase/migrations/` in order in the Supabase SQL editor.

**Note:** The `payment_webhook_events` table was originally created as `stripe_webhook_events` in migration 4, renamed to `payment_webhook_events` in migration 10 after switching to Razorpay.

**Sample charities** (optional, local/demo):

```bash
# Supabase SQL editor, or after linking: supabase db execute -f supabase/seed.sql
```

**Demo data** (local / demo only — requires `SUPABASE_SERVICE_ROLE_KEY`). Run `supabase/seed.sql` first (sample charities), then:

```bash
npm run seed   # npx tsx scripts/seed.ts
```

This creates the test accounts below plus a full draw lifecycle, so draw and prize screens are populated on a fresh database:

- **Last month:** a published draw (random mode) with entries and four winners — one per verification state.
- **This month:** a draft draw, already holding the subscriber's entry, so members can sync scores straight away.
- **Subscriber extras:** active monthly subscription, charity choice, five recent scores (rolling-5 at its limit), and one succeeded ₹500 donation.

Prize amounts and the draft's `jackpot_carryover` are computed by the draw engine (`lib/draw/pools.ts`) from `DRAW_FEE_PER_SUBSCRIBER_INR` and the active-subscriber count, exactly as a real publish would; the script prints the breakdown. Last month has a tier-5 winner, so carryover is ₹0. Re-running is safe: nothing is duplicated, and the demo winners' states reset to the values below. If last month already has a real draw, the script leaves it (and the current draft's carryover) alone; it never rolls a simulated or published current-month draw back to draft.

**Seed charities (example):**

```sql
INSERT INTO public.charities (name, slug, description, is_featured, images)
VALUES
  ('Community Futures', 'community-futures', 'Youth programmes and food security.', true, '[]'::jsonb),
  ('Green Hearth', 'green-hearth', 'Shelter and rehousing support.', false, '[]'::jsonb);
```

**Create a draft draw for the current month** manually (the seed and the admin UI both do this for you):

```sql
INSERT INTO public.draws (month, status, mode)
VALUES (date_trunc('month', CURRENT_DATE)::date, 'draft', 'random')
ON CONFLICT (month) DO NOTHING;
```

### 4. Payments (Razorpay)

**Demo without Razorpay:** set `PAYMENT_PROVIDER=mock` in `.env.local`. Checkout activates membership in the database immediately.

**Razorpay test mode:**

1. Create **Subscription plans** for monthly and yearly billing in the Razorpay Dashboard.
2. Set `RAZORPAY_PLAN_ID_MONTHLY`, `RAZORPAY_PLAN_ID_YEARLY`, API keys, and `PAYMENT_PROVIDER=razorpay`.
3. Add a webhook endpoint pointing to `https://your-domain/api/payments/webhook` (local: use a tunnel such as ngrok). Subscribe to subscription and payment events.
4. Copy the webhook signing secret into `RAZORPAY_WEBHOOK_SECRET`.

Checkout opens Razorpay Checkout on the client; success redirects to `/dashboard?checkout=success`. Webhooks update `subscriptions` (same table/columns as before; external IDs stored in `external_subscription_id` / `external_customer_id`).

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Tests

```bash
npm test
```

---

## Test credentials & roles

`npm run seed` creates these accounts (all fake, `@digital-heroes.test`):

| Account | Email | Password | Demonstrates |
|---------|-------|----------|--------------|
| Admin | `admin@digital-heroes.test` | `TestAdmin!digital25` | Admin panel: last month's published draw, a winners queue in every state (approve/reject/mark paid), this month's draft ready to simulate, non-zero reports |
| Subscriber | `subscriber@digital-heroes.test` | `TestMember!digital25` | Member dashboard: five scores at the rolling limit, entered in this month's draft, an approved + paid jackpot win, a ₹500 donation |
| No subscription | `nosub@digital-heroes.test` | `TestNoSub!digital25` | Logged-in member without a subscription: inactive dashboard, subscribe CTA, gated scores |
| Demo winner — proof to review | `winner.pending@digital-heroes.test` | `TestWinner!digital25` | Tier-4 prize, proof uploaded, pending admin review |
| Demo winner — awaiting proof | `winner.noproof@digital-heroes.test` | `TestWinner!digital25` | Tier-3 prize with no proof yet: the member upload flow |
| Demo winner — proof rejected | `winner.rejected@digital-heroes.test` | `TestWinner!digital25` | Tier-3 prize whose proof was rejected: the re-upload path |

To create real accounts through the app instead:

| Role | How to create |
|------|----------------|
| **Member** | [Sign up](/signup) — pick charity + ≥10% share, confirm email if enabled |
| **Admin** | Sign up, then in Supabase SQL: `UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';` |

**Razorpay test mode:** use [Razorpay test cards and UPI](https://razorpay.com/docs/payments/payments/test-card-upi-details/) in Checkout.

**Login:** `/login` — supports `?next=/path` redirect after sign-in.

**Email confirmation:** If Supabase requires email verification, use the link in the inbox or disable confirmation in Supabase Auth settings for local dev.

---

## Feature checklist (implementation map)

| Area | Location | Notes |
|------|----------|--------|
| Sign up / login | `app/signup`, `app/login`, `lib/auth/actions.ts` | Charity + % on signup; auth callback route |
| Monthly / yearly subscription | `lib/payments/*`, webhook `app/api/payments/webhook` | Razorpay Checkout + mock provider; `subscriptions` table |
| 5-score rolling | DB trigger + `lib/scores/rolling.ts` | One score per calendar date; latest five kept |
| Draw simulation / publish | `lib/draw/*`, `lib/draw/admin-actions.ts` | Random or algorithmic; publish after `simulated` |
| Draw entries | `lib/draw/sync-entry.ts` | Synced on score save + before admin simulate/publish |
| Charity contribution | `lib/charity/contribution.ts` | Min 10%; dashboard slider + signup |
| Winner verification / payout | `lib/winners/*`, `/dashboard/prizes`, `/admin/winners` | Private storage bucket; approve/reject/paid |
| Member dashboard | `app/dashboard/*` | Overview (login-only), settings, scores (sub-gated), prizes |
| Admin panel | `app/admin/*` | Users, draws, charities, winners, reports |
| Responsive UI | Tailwind breakpoints, mobile subscribe bar | Dashboard bottom nav; admin horizontal tabs |

---

## Access control

Server-side subscription checks use `requireActiveSubscription()` from `lib/subscription/access.ts` (admins bypass). Lapsed or never-subscribed members can still open `/dashboard` and `/dashboard/settings`; they are redirected to `/subscribe` only when hitting subscription-gated routes.

| Route / action | Auth | Active subscription |
|----------------|------|---------------------|
| `/dashboard` (overview) | Required | **Not** required — shows inactive state + subscribe CTA |
| `/dashboard/settings` | Required | **Not** required — profile, charity %, billing portal |
| `/dashboard/scores` | Required | Required (`app/dashboard/(member)/layout.tsx`) |
| `/dashboard/prizes` | Required | **Not** required — winners may upload proof after lapse |
| `/subscribe`, Razorpay checkout (`lib/payments/actions.ts`) | Required | Not required (subscribe flow) |
| One-off donations (`lib/payments/donation-actions.ts`) | Required | Not required |
| Score mutations + draw entry sync (`lib/scores/actions.ts`) | Required | Required |
| Charity % updates (`lib/charity/actions.ts`, `lib/profile/actions.ts`) | Required | **Not** required (settings / overview display) |
| `/admin/*` | Admin role | N/A (admins bypass subscription) |
| Marketing, `/charities`, login, signup | Public / auth as listed | N/A |

Middleware (`lib/supabase/middleware.ts`) enforces login for `/dashboard`, `/subscribe`, and `/admin`, and blocks non-admins from `/admin`.

---

## Prize pool calculation

Monthly draw prize pools are **not** read from Razorpay plan amounts in code. They are computed as:

`totalPool (₹) = activeSubscribers × DRAW_FEE_PER_SUBSCRIBER_INR × (DRAW_PRIZE_POOL_PERCENTAGE / 100)`

Defaults in `.env.example`: **`DRAW_FEE_PER_SUBSCRIBER_INR=250`**, **`DRAW_PRIZE_POOL_PERCENTAGE=100`** (see `lib/draw/db.ts` → `getDrawFeeConfig()` and `lib/draw/pools.ts`).

That total is split across tiers **40% / 35% / 25%** for 5-, 4-, and 3-match winners (`lib/draw/constants.ts`). Each tier pool is divided equally among winners in that tier. If there are **no 5-match winners**, the entire 5-match tier pool rolls into **`jackpot_carryover`** on the next month’s draw (`splitPrizes()` in `lib/draw/pools.ts`).

All money is **INR (₹)**, matching Razorpay. Display goes through `lib/money.ts` (`en-IN` grouping).

---

## Assumptions & limitations

1. **Currency:** The whole app uses **INR (₹)**. Prize amounts (`winners.prize_amount`, `draws.jackpot_carryover`) are stored as rupees in `numeric(12,2)`, while donations (`donations.amount_cents`) are stored as integer paise. Legacy Stripe-era donation rows may carry `currency = 'gbp'` and are excluded from INR totals.
2. **Draw entries** require a **draft/simulated draw row** for the current month; admins create it under **Admin → Draws** (`npm run seed` creates one). Members sync entries when they save scores (if a draw exists).
3. **Active subscription** is determined server-side from `subscriptions` (+ cancelled-until-renewal-date). Razorpay webhooks (or `mock` checkout) must run for checkout to grant access.
4. **Admin user list / reports** need `SUPABASE_SERVICE_ROLE_KEY`. Winner verification works with admin session + RLS alone.
5. **Homepage “total raised”** uses donations + estimated subscription commitments when `SUPABASE_SERVICE_ROLE_KEY` is set; otherwise the hero stat is hidden (no fabricated number).
6. **No automated emails** for draw results or winner status (in-app only).
7. **Charity images** are URL strings in JSON (`charities.images`), not Supabase Storage uploads in admin.
8. **Draw participation counts** depend on `draw_entries` rows; empty until members log scores and a draw exists.
9. **Profile role** cannot be self-promoted to admin (DB trigger + RLS); only SQL or existing admin can set `role = 'admin'`.
10. **Middleware** protects `/dashboard`, `/admin`, `/subscribe`; payment webhook is excluded from session refresh.

---

## Project structure (high level)

```
app/                 Routes (marketing, dashboard, admin, API)
components/          UI, home, dashboard, admin, charity
lib/                 Auth, scores, draw, payments, winners, admin queries
supabase/migrations/ Schema, RLS, storage policies
```

---

## Production deploy

- Set all env vars on the host (e.g. Vercel).
- Point Razorpay webhook to `https://your-domain/api/payments/webhook`.
- Run migrations on production Supabase.
- Ensure Storage bucket `winner-proofs` exists (migration `20261007140000_winner_proof_storage.sql`).

---

## License

Private / project-specific — see repository owner.
