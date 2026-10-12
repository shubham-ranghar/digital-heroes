# digital.HEROES — README

## What this is

A charity-first subscription platform. Members pay a monthly or yearly fee, log Stableford golf scores, and enter a monthly prize draw. At least 10% of every subscription goes to a charity the member picks.

Admins simulate and publish draws, verify winner proof, and manage charity partners.

**Live:** https://digital-heroes-silk.vercel.app

|  |  |
| --- | --- |
| Framework | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind 4 |
| Backend | Supabase — Auth, Postgres, Storage, RLS |
| Payments | Razorpay subscriptions (INR) |
| Tests | Vitest |

## Quick start

You need Node.js 20+, a Supabase project, and either a Razorpay test account or `PAYMENT_PROVIDER=mock`.

```bash
npm install --legacy-peer-deps
cp .env.example .env.local   # fill in the values below
supabase db push             # or run supabase/migrations/ in order
npm run seed                 # demo accounts + a full draw lifecycle
npm run dev                  # http://localhost:3000
```

Run tests with `npm test`.

For the fastest demo, set `PAYMENT_PROVIDER=mock` in `.env.local` — checkout activates membership immediately with no gateway involved.

Seeding needs `SUPABASE_SERVICE_ROLE_KEY`. Run `supabase/seed.sql` first for sample charities, then `npm run seed`. Re-running is safe: nothing duplicates, and demo winner states reset. If last month already holds a real draw, the script leaves it alone.

## Environment variables

**Core — always required**

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key for client + RLS |
| `NEXT_PUBLIC_SITE_URL` | App origin, e.g. `http://localhost:3000` |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypasses RLS for admin lists, draw sync, homepage stats, seeding |

**Payments**

| Variable | Purpose |
| --- | --- |
| `PAYMENT_PROVIDER` | `razorpay` or `mock` |
| `RAZORPAY_KEY_ID` | Dashboard → API keys (`rzp_test_…`) |
| `RAZORPAY_KEY_SECRET` | Paired secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signing secret |
| `RAZORPAY_PLAN_ID_MONTHLY` | Monthly subscription plan ID |
| `RAZORPAY_PLAN_ID_YEARLY` | Yearly subscription plan ID |

**Draw configuration**

| Variable | Default | Purpose |
| --- | --- | --- |
| `DRAW_FEE_PER_SUBSCRIBER_INR` | `250` | Contribution per active subscriber, whole rupees |
| `DRAW_PRIZE_POOL_PERCENTAGE` | `100` | Share of fees entering the pool |

The legacy name `DRAW_FEE_PER_SUBSCRIBER` is still read as a fallback.

**Display and footer — all optional**

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUBSCRIPTION_FEE_INR` | Monthly fee shown on the charity slider (default `499`) |
| `NEXT_PUBLIC_SUBSCRIPTION_FEE_INR_YEARLY` | Yearly display fee |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Footer + Support → Contact mailto |
| `NEXT_PUBLIC_CONTACT_ADDRESS` | Pipe-separated address lines |
| `NEXT_PUBLIC_SOCIAL_LINKEDIN_URL` | Hidden if unset |
| `NEXT_PUBLIC_SOCIAL_FACEBOOK_URL` | Hidden if unset |
| `NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL` | Hidden if unset |
| `NEXT_PUBLIC_SOCIAL_YOUTUBE_URL` | Hidden if unset |

## Payments

**Demo without Razorpay.** Set `PAYMENT_PROVIDER=mock`. Checkout writes an active membership straight to the database.

**Razorpay test mode.**

1. Create monthly and yearly **Subscription plans** in the Razorpay Dashboard.
2. Set the plan IDs, API keys, and `PAYMENT_PROVIDER=razorpay`.
3. Add a webhook pointing to `https://your-domain/api/payments/webhook` and subscribe to subscription and payment events. Locally, tunnel with ngrok.
4. Copy the signing secret into `RAZORPAY_WEBHOOK_SECRET`.

Checkout opens Razorpay Checkout client-side; success redirects to `/dashboard?checkout=success`. Webhooks update the `subscriptions` table, storing gateway IDs in `external_subscription_id` and `external_customer_id`.

Use [Razorpay test cards and UPI](https://razorpay.com/docs/payments/payments/test-card-upi-details/) in Checkout.

One migration note: `payment_webhook_events` was created as `stripe_webhook_events` in migration 4 and renamed in migration 10 after the move to Razorpay.

## Demo data and test accounts

`npm run seed` creates six accounts (all fake, `@digital-heroes.test`) plus a complete draw lifecycle, so draw and prize screens are populated on a fresh database.

| Account | Email | Password | Shows |
| --- | --- | --- | --- |
| Admin | `admin@digital-heroes.test` | `TestAdmin!digital25` | Published draw, winners queue in every state, draft ready to simulate, non-zero reports |
| Subscriber | `subscriber@digital-heroes.test` | `TestMember!digital25` | Five scores at the rolling limit, entered in this month's draft, an approved and paid jackpot win, a ₹500 donation |
| No subscription | `nosub@digital-heroes.test` | `TestNoSub!digital25` | Inactive dashboard, subscribe CTA, gated scores |
| Winner — proof to review | `winner.pending@digital-heroes.test` | `TestWinner!digital25` | Tier-4 prize, proof uploaded, pending review |
| Winner — awaiting proof | `winner.noproof@digital-heroes.test` | `TestWinner!digital25` | Tier-3 prize, the member upload flow |
| Winner — proof rejected | `winner.rejected@digital-heroes.test` | `TestWinner!digital25` | Tier-3 prize, the re-upload path |

The seed also writes **last month** as a published random-mode draw with entries and four winners (one per verification state), and **this month** as a draft already holding the subscriber's entry. Prize amounts and `jackpot_carryover` come from the real draw engine, exactly as a publish would compute them; the script prints the breakdown.

To create accounts through the app instead: sign up at `/signup` for a member. For an admin, sign up and then run `UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';` in Supabase SQL — role cannot be self-promoted.

If Supabase requires email verification, use the inbox link or disable confirmation in Auth settings for local dev. `/login` supports a `?next=/path` redirect.

## How the draw works

Prize pools are computed in code, not read from Razorpay plan amounts:

```
totalPool (₹) = activeSubscribers × DRAW_FEE_PER_SUBSCRIBER_INR × (DRAW_PRIZE_POOL_PERCENTAGE / 100)
```

See `lib/draw/db.ts` → `getDrawFeeConfig()` and `lib/draw/pools.ts`.

That total splits across three tiers, defined in `lib/draw/constants.ts`:

| Matches | Share of pool |
| --- | --- |
| 5 | 40% |
| 4 | 35% |
| 3 | 25% |

Each tier pool divides equally among its winners. With **no 5-match winners**, the whole 5-match tier rolls into `jackpot_carryover` on next month's draw (`splitPrizes()` in `lib/draw/pools.ts`).

Entries need a draft or simulated draw row for the current month. Admins create one under **Admin → Draws**; `npm run seed` creates one too. Members sync entries when they save scores, and `lib/draw/sync-entry.ts` also runs before an admin simulates or publishes.

All money is INR. Prize amounts and carryover are stored as rupees in `numeric(12,2)`; donations are stored as integer paise in `donations.amount_cents`. Display goes through `lib/money.ts` with `en-IN` grouping.

## Access control

Server-side checks use `requireActiveSubscription()` from `lib/subscription/access.ts`. Admins bypass it. Lapsed and never-subscribed members can still reach `/dashboard` and `/dashboard/settings`; they are redirected to `/subscribe` only on gated routes.

| Route or action | Login | Active subscription |
| --- | --- | --- |
| `/dashboard` overview | Yes | No — shows inactive state + CTA |
| `/dashboard/settings` | Yes | No — profile, charity %, billing |
| `/dashboard/scores` | Yes | **Yes** |
| `/dashboard/prizes` | Yes | No — winners may upload proof after lapse |
| `/subscribe`, checkout | Yes | No |
| One-off donations | Yes | No |
| Score mutations + entry sync | Yes | **Yes** |
| Charity % updates | Yes | No |
| `/admin/*` | Admin role | N/A |
| Marketing, `/charities`, login, signup | Public | N/A |

Middleware (`lib/supabase/middleware.ts`) enforces login for `/dashboard`, `/subscribe`, and `/admin`, and blocks non-admins from `/admin`. The payment webhook is excluded from session refresh.

## Where things live

```
app/                 Routes — marketing, dashboard, admin, API
components/          UI, home, dashboard, admin, charity
lib/                 Auth, scores, draw, payments, winners, admin queries
supabase/migrations/ Schema, RLS, storage policies
```

| Feature | Location |
| --- | --- |
| Sign up / login | `app/signup`, `app/login`, `lib/auth/actions.ts` |
| Subscriptions | `lib/payments/*`, webhook at `app/api/payments/webhook` |
| 5-score rolling window | DB trigger + `lib/scores/rolling.ts` |
| Draw simulate / publish | `lib/draw/*`, `lib/draw/admin-actions.ts` |
| Draw entries | `lib/draw/sync-entry.ts` |
| Charity contribution | `lib/charity/contribution.ts` |
| Winner verification and payout | `lib/winners/*`, `/dashboard/prizes`, `/admin/winners` |
| Member dashboard | `app/dashboard/*` |
| Admin panel | `app/admin/*` |

Scores are capped at one per calendar date, with the latest five kept. Charity share has a 10% minimum, set on signup and adjustable from the dashboard slider. Winner proof uploads go to a private Storage bucket; admins approve, reject, or mark paid.

## Deploying

- [ ] Set every env var on the host (Vercel or equivalent)
- [ ] Run migrations against production Supabase
- [ ] Point the Razorpay webhook at `https://your-domain/api/payments/webhook`
- [ ] Confirm the `winner-proofs` Storage bucket exists (migration `20261007140000_winner_proof_storage.sql`)
- [ ] Create a draft draw for the current month under Admin → Draws

## Known limitations

- **No automated emails.** Draw results and winner status are in-app only.
- **Homepage total raised** needs `SUPABASE_SERVICE_ROLE_KEY`. Without it the hero stat is hidden rather than estimated — no fabricated number.
- **Admin user list and reports** need the service role key. Winner verification works on admin session + RLS alone.
- **Charity images** are URL strings in `charities.images` JSON, not Storage uploads from admin.
- **Draw participation counts** stay empty until a draw row exists and members log scores.
- **Legacy Stripe-era donations** may carry `currency = 'gbp'` and are excluded from INR totals.
- **Active subscription** is resolved server-side from `subscriptions`, including cancelled-until-renewal. Webhooks (or mock checkout) must run for access to be granted.

---

Private / project-specific — see repository owner.
