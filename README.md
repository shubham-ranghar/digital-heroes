# digital.HEROES

Charity-first subscription platform: members log Stableford scores (latest five kept), enter monthly prize draws, and direct at least 10% of subscription fees to a chosen charity. Admins simulate and publish draws, verify winner proof, and manage partners.

**Stack:** Next.js 16 (App Router), TypeScript, Tailwind 4, Supabase (Auth, Postgres, Storage, RLS), Stripe, Vitest.

---

## Prerequisites

- Node.js 20+
- [Supabase](https://supabase.com) project
- [Stripe](https://stripe.com) account (test mode is fine for local dev)
- Stripe CLI (for webhook forwarding locally)

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
| `STRIPE_SECRET_KEY` | Subscribe | Stripe API secret (`sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Subscribe | From `stripe listen` or Dashboard webhook |
| `STRIPE_PRICE_ID_MONTHLY` | Subscribe | Stripe Price ID for monthly plan |
| `STRIPE_PRICE_ID_YEARLY` | Subscribe | Stripe Price ID for yearly plan |
| `DRAW_FEE_PER_SUBSCRIBER` | Draws | Fee unit per active subscriber (default `10`) |
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

**Seed charities (example):**

```sql
INSERT INTO public.charities (name, slug, description, is_featured, images)
VALUES
  ('Community Futures', 'community-futures', 'Youth programmes and food security.', true, '[]'::jsonb),
  ('Green Hearth', 'green-hearth', 'Shelter and rehousing support.', false, '[]'::jsonb);
```

**Create a draft draw for the current month** (admin UI can also do this):

```sql
INSERT INTO public.draws (month, status, mode)
VALUES (date_trunc('month', CURRENT_DATE)::date, 'draft', 'random')
ON CONFLICT (month) DO NOTHING;
```

### 4. Stripe

1. Create **Products** with recurring **Prices** for monthly and yearly billing.
2. Put Price IDs in `STRIPE_PRICE_ID_MONTHLY` and `STRIPE_PRICE_ID_YEARLY`.
3. Forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

Checkout success redirects to `/dashboard?checkout=success`; cancel to `/subscribe?checkout=cancelled`.

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

There are **no built-in default users**. Create accounts through the app:

| Role | How to create |
|------|----------------|
| **Member** | [Sign up](/signup) — pick charity + ≥10% share, confirm email if enabled |
| **Admin** | Sign up, then in Supabase SQL: `UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';` |

**Stripe test card:** `4242 4242 4242 4242`, any future expiry, any CVC, any billing postcode.

**Login:** `/login` — supports `?next=/path` redirect after sign-in.

**Email confirmation:** If Supabase requires email verification, use the link in the inbox or disable confirmation in Supabase Auth settings for local dev.

---

## Feature checklist (implementation map)

| Area | Location | Notes |
|------|----------|--------|
| Sign up / login | `app/signup`, `app/login`, `lib/auth/actions.ts` | Charity + % on signup; auth callback route |
| Monthly / yearly subscription | `lib/stripe/actions.ts`, webhook `app/api/stripe/webhook` | Checkout + portal; `subscriptions` table |
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
| `/subscribe`, Stripe checkout / portal (`lib/stripe/actions.ts`) | Required | Not required (subscribe flow) |
| One-off donations (`lib/stripe/donation-actions.ts`) | Required | Not required |
| Score mutations + draw entry sync (`lib/scores/actions.ts`) | Required | Required |
| Charity % updates (`lib/charity/actions.ts`, `lib/profile/actions.ts`) | Required | **Not** required (settings / overview display) |
| `/admin/*` | Admin role | N/A (admins bypass subscription) |
| Marketing, `/charities`, login, signup | Public / auth as listed | N/A |

Middleware (`lib/supabase/middleware.ts`) enforces login for `/dashboard`, `/subscribe`, and `/admin`, and blocks non-admins from `/admin`.

---

## Prize pool calculation

Monthly draw prize pools are **not** read from Stripe prices in code. They are computed as:

`totalPool = activeSubscribers × DRAW_FEE_PER_SUBSCRIBER × (DRAW_PRIZE_POOL_PERCENTAGE / 100)`

Defaults in `.env.example`: **`DRAW_FEE_PER_SUBSCRIBER=10`**, **`DRAW_PRIZE_POOL_PERCENTAGE=100`** (see `lib/draw/db.ts` → `getDrawFeeConfig()` and `lib/draw/pools.ts`).

That total is split across tiers **40% / 35% / 25%** for 5-, 4-, and 3-match winners (`lib/draw/constants.ts`). Each tier pool is divided equally among winners in that tier. If there are **no 5-match winners**, the entire 5-match tier pool rolls into **`jackpot_carryover`** on the next month’s draw (`splitPrizes()` in `lib/draw/pools.ts`).

Align **Stripe charge currency** with how you display fees and prizes (README assumption: draws often use **GBP (£)**; marketing charity sliders may use **INR (₹)** via `NEXT_PUBLIC_SUBSCRIPTION_FEE_INR`).

---

## Assumptions & limitations

1. **Currency display:** Prize pools and draw fees use **GBP (£)** in draw engine and winner records; marketing/dashboard charity amounts often use **INR (₹)** via `NEXT_PUBLIC_SUBSCRIPTION_FEE_INR` for display — align Stripe currency with your production region.
2. **Draw entries** require a **draft/simulated draw row** for the current month; admins create it under **Admin → Draws**. Members sync entries when they save scores (if a draw exists).
3. **Active subscription** is determined server-side from `subscriptions` (+ cancelled-until-renewal-date). Stripe webhook must run for checkout to grant access.
4. **Admin user list / reports** need `SUPABASE_SERVICE_ROLE_KEY`. Winner verification works with admin session + RLS alone.
5. **Homepage “total raised”** uses donations + estimated subscription commitments when `SUPABASE_SERVICE_ROLE_KEY` is set; otherwise the hero stat is hidden (no fabricated number).
6. **No automated emails** for draw results or winner status (in-app only).
7. **Charity images** are URL strings in JSON (`charities.images`), not Supabase Storage uploads in admin.
8. **Draw participation counts** depend on `draw_entries` rows; empty until members log scores and a draw exists.
9. **Profile role** cannot be self-promoted to admin (DB trigger + RLS); only SQL or existing admin can set `role = 'admin'`.
10. **Middleware** protects `/dashboard`, `/admin`, `/subscribe`; Stripe webhook is excluded from session refresh.

---

## Project structure (high level)

```
app/                 Routes (marketing, dashboard, admin, API)
components/          UI, home, dashboard, admin, charity
lib/                 Auth, scores, draw, stripe, winners, admin queries
supabase/migrations/ Schema, RLS, storage policies
```

---

## Production deploy

- Set all env vars on the host (e.g. Vercel).
- Point Stripe webhook to `https://your-domain/api/stripe/webhook`.
- Run migrations on production Supabase.
- Ensure Storage bucket `winner-proofs` exists (migration `20261007140000_winner_proof_storage.sql`).

---

## License

Private / project-specific — see repository owner.
