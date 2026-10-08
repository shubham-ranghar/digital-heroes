# Digital Heroes — PRD audit progress

**Audit date:** 2026-10-07 (read-only codebase review; no product code changes in this audit)  
**PRD source:** User audit checklist (sections A–K) + `README.md` feature map. No standalone PRD file in repo.  
**Full checklist:** Filterable 52-item table in [PRD audit canvas](C:\Users\shubh\.cursor\projects\e-digital-heroes\canvases\prd-audit.canvas.tsx) (same scoring: Done = 1, Partial = 0.5, Missing = 0).

---

## 1. Summary

| Section | % complete | Status | Single biggest gap |
|---------|------------|--------|-------------------|
| **A.** Subscription & payment | **70%** | Partial | Subscription not enforced in DB (RLS); not checked on every authenticated request |
| **B.** Score management | **100%** | Done | Trigger not covered by automated tests (Vitest covers app-side retention only) |
| **C.** Draw & reward | **90%** | Partial | No auto-create next month’s draft; E2E simulate → publish not run on live Supabase |
| **D.** Prize pool | **75%** | Partial | Pool uses `DRAW_FEE_PER_SUBSCRIBER` (default 10), not Razorpay revenue; charity % not reserved |
| **E.** Charity | **75%** | Partial | Charity % stored/displayed only — no payout ledger or payment provider transfer; no admin event CRUD |
| **F.** Winner verification | **100%** | Done | Needs manual test on real Storage + RLS (code paths present) |
| **G.** User dashboard | **100%** | Done | Intentional: non-subscribers see overview/settings/prizes; scores gated under `(member)` |
| **H.** Admin dashboard | **80%** | Partial | Charity events/media limited; reports use estimates and mixed currency |
| **I.** Roles & access | **75%** | Partial | Paid features bypassable via Supabase client; middleware no-ops without env |
| **J.** UI/UX | **92%** | Partial | Responsive/motion in code; lint still red; viewport pass not repeated this audit |
| **K.** Technical & deliverables | **58%** | Partial | No seeded test users/admins; deploy-ready but manual Razorpay/Supabase setup |

**Overall completion (52 checklist items, weighted):** **83%**  
**Item counts:** Done **35** · Partial **16** · Missing **1** (seed credentials)

**Live integration:** Razorpay checkout, webhooks, and a fresh Supabase project were **not** executed in this audit.

---

## 2. Automated checks (last recorded on this machine)

| Check | Result | Notes |
|-------|--------|--------|
| `npm run build` | Pass (after fix) | Earlier failure: `loopId` in `components/motion/curtain-section.tsx`; re-run clean in CI |
| `npx tsc --noEmit` | Pass | |
| `npm run lint` | Fail | `react-hooks/set-state-in-effect` in motion/menu/smooth-scroll files |
| `npm run test` | Pass | 27 tests / 8 files (draw, pools, scores, charity contribution, validations) |

### Test coverage map

| Covered (Vitest) | Not covered |
|------------------|-------------|
| `lib/draw/match`, `random`, `pools`, `simulate`, `sync-entry` | Razorpay checkout, webhook, portal, donations |
| `lib/charity/contribution` | Auth signup trigger, RLS subscription enforcement |
| `lib/scores/rolling`, `lib/validations/score` | DB trigger, admin/winner actions, middleware |
| | UI/E2E, dashboard queries |

---

## 3. Checklist snapshot (strict)

Evidence paths and one-line notes for every item are in the canvas. Abbreviated status below.

### A. Subscription & payment

| Item | Status | Evidence |
|------|--------|----------|
| Monthly + yearly (yearly discounted) | Partial | `lib/payments/prices.ts`, `components/subscription/checkout-buttons.tsx` |
| Razorpay integration | Done | `lib/payments/actions.ts`, `app/api/payments/webhook/route.ts`, `lib/payments/webhook-handler.ts` |
| Non-subscribers restricted | Partial | `(member)/layout.tsx`, `lib/scores/actions.ts`; **RLS allows score/draw_entry insert for any auth user** |
| Renewal / cancel / lapsed (webhooks) | Done | `lib/payments/webhook-handler.ts`, `lib/payments/subscription-store.ts` |
| Subscription on every authenticated request | Partial | Middleware: login only (`lib/supabase/middleware.ts`); sub check on member routes + score actions |

**Note:** Webhook **idempotency is implemented** — `lib/payments/webhook-idempotency.ts`, migration `supabase/migrations/20261008140000_rename_stripe_webhook_events.sql`.

### B. Score management — **all Done**

`lib/validations/score.ts`, `scores_enforce_latest_five` trigger, `lib/scores/actions.ts`, `components/scores/scores-panel.tsx`, `lib/dashboard/queries.ts` (newest-first order).

### C. Draw & reward

| Item | Status | Evidence |
|------|--------|----------|
| 3 / 4 / 5 match tiers | Done | `lib/draw/match.ts` |
| Random + algorithmic (frequency weighted) | Done | `lib/draw/random.ts`, `lib/draw/algorithmic.ts` |
| Monthly cadence, admin publish | Partial | `draws.month`, `lib/draw/admin-actions.ts` |
| Simulate / preview before publish | Done | `runSimulationAction`, publish requires `simulated` |
| Jackpot rollover (unclaimed 5-match) | Done | `lib/draw/pools.ts` `splitPrizes`, `publishDrawAction` |

### D. Prize pool

| Item | Status | Evidence |
|------|--------|----------|
| Subscription share → pool | Partial | `getDrawFeeConfig()` in `lib/draw/db.ts` — env fee, not Stripe |
| 40 / 35 / 25 + 5-match rollover | Done | `lib/draw/constants.ts`, `lib/draw/pools.ts` |
| Auto from active subscriber count | Partial | `loadActiveSubscriberScores` — count OK, fee wrong; may count stale subscription rows |
| Equal split per tier | Done | `splitPoolAmongWinners` in `lib/draw/pools.ts` |

### E. Charity

| Item | Status | Evidence |
|------|--------|----------|
| Charity at signup | Done | `lib/auth/actions.ts`, `20261007130000_signup_charity_metadata.sql` |
| Min 10%, user can increase | Partial | DB + `lib/charity/contribution.ts` — **no payment out** |
| Independent donation | Done | `lib/payments/donation-actions.ts`, `components/charity/donation-form.tsx` |
| Directory search + filter | Partial | `components/charity/charities-directory.tsx` (search + featured) |
| Profile (description, images, events) | Partial | `app/charities/[slug]/page.tsx` — events read-only; admin cannot create events |
| Homepage featured spotlight | Done | `components/home/editorial-charity-spotlight.tsx` |

### F. Winner verification — **all Done**

`lib/winners/actions.ts`, `lib/winners/admin-actions.ts`, `20261007140000_winner_proof_storage.sql`, `winners_guard_member_update`.

### G. User dashboard — **all Done**

`components/dashboard/dashboard-home.tsx`, `lib/dashboard/queries.ts`, `(member)/scores`, `app/dashboard/prizes/page.tsx`.

### H. Admin dashboard

| Item | Status | Evidence |
|------|--------|----------|
| Users, scores, subscriptions | Done | `lib/admin/users-actions.ts`, `app/admin/users/page.tsx` |
| Draws: simulate, publish | Done | `app/admin/draws/page.tsx`, `lib/draw/admin-actions.ts` |
| Charities CRUD + media | Partial | `lib/admin/charities-actions.ts` — URL list only, no events UI |
| Winners verify + paid | Done | `app/admin/winners/page.tsx` |
| Reports & analytics | Partial | `lib/admin/queries.ts` `getAdminReports` — estimates, INR/GBP mix |

### I. Roles & access

| Item | Status | Evidence |
|------|--------|----------|
| Visitor / subscriber / admin | Done | `profiles.role`, `requireAdmin` |
| Route + API protection | Partial | Middleware + server actions + RLS; **scores/draw_entries lack subscription in RLS** |

### J. UI/UX

| Item | Status | Evidence |
|------|--------|----------|
| Modern, motion-led, not golf-themed UI | Done | `homepage-curtain.tsx`, `curtain-section.tsx`, editorial home |
| Charity-led homepage story + CTA | Done | `EditorialHero`, pricing, final CTA, mobile subscribe bar |
| Animations + responsive | Partial | `lib/motion.ts`, Framer; breakpoints — manual viewport QA pending |

### K. Technical & deliverables

| Item | Status | Evidence |
|------|--------|----------|
| Supabase schema + migrations | Done | `supabase/migrations/*.sql` |
| Env vars, no secrets in code | Done | `.env.example`, `lib/stripe/env.ts` |
| Clean structure | Partial | Domain split in `lib/`; lint failures |
| Error handling | Partial | Zod + 23505; swallowed draw sync errors; webhook 500 exposes message |
| Vercel + new Supabase ready | Partial | `README.md` deploy section |
| Test user + admin seed | **Missing** | `supabase/seed.sql` charities only; README manual admin SQL |

---

## 4. Bugs and risks (current)

### Critical

1. **Paid gate bypassable in database** — RLS on `scores` and `draw_entries` allows insert/update for any authenticated user without checking subscription. App uses `requireActiveSubscription()` only on server actions. **Fix:** SQL helper mirroring `subscriptionGrantsAccess`; tighten INSERT/UPDATE policies.
2. **Prize pool ignores real money and charity share** — `DRAW_FEE_PER_SUBSCRIBER` + `DRAW_PRIZE_POOL_PERCENTAGE` (default 100%) can award full fictional pool while UI promises ≥10% to charity. **Fix:** Derive pool from collected amount minus charity reservation; single currency aligned with Razorpay.
3. **Charity percentage is not paid** — Stored in `user_charity` and shown on dashboard; no ledger or payment provider transfer. **Fix:** Record payables on payment success; payout process before marketing "impact" as settled.

### High

4. **Stale subscription rows inflate active count** — `loadActiveSubscriberScores` iterates all rows; access logic uses latest per user in app only. **Fix:** Latest row per `user_id` for pool sizing.
5. **`invoice.payment_failed` → immediate `lapsed`** — `lib/payments/webhook-handler.ts` — may cut access before Razorpay retries. **Fix:** Map `past_due` separately; lapse on terminal states.
6. **Admin subscription edits skip Razorpay** — `updateAdminSubscriptionAction` — DB and Razorpay can diverge.
7. **Middleware skips auth when Supabase env missing** — `hasSupabaseEnv()` early return in `lib/supabase/middleware.ts`.

### Medium

8. **Currency mismatch** — Draw/prizes in £-style amounts; charity slider and reports use `NEXT_PUBLIC_SUBSCRIPTION_FEE_INR`; donation cents ÷ 100 as INR.
9. **Algorithmic draw with replacement** — Same number can appear multiple times in five winning numbers (`lib/draw/algorithmic.ts`).
10. **Admin cannot manage `charity_events`** — Table exists; no admin UI.
11. **`npm run lint` fails** — Blocks CI if lint is required.

### Low

12. Unused `components/layout/navbar.tsx`; dev font-audit Geist warning; Next middleware → proxy deprecation.

---

## 5. Remaining work (prioritized)

### P0 — blocking / core

1. RLS: require active subscription (or admin) on `scores` and `draw_entries` writes.
2. Prize pool formula: collected fees − charity % → then 40/35/25; remove default “100% of flat £10” unless that is explicit product policy.
3. Charity payout or ledger (even if payout is manual at first).

### P1 — important

- Latest subscription row per user for pool + reporting.
- Softer failed-payment handling (`past_due` vs `lapsed`).
- Admin CRUD for charity events; unify report currency and totals.
- Auto or documented workflow for next month’s draft draw.
- `seed.sql` + README: one member + one admin for local QA.

### P2 — polish

- Charity filters beyond featured; image upload in admin; distinct algorithmic numbers; lint fixes; full mobile/desktop pass on homepage curtains.

### Suggested next five steps (start today)

1. Migration: `subscription_grants_access(auth.uid())` + update score/draw_entry policies.
2. Replace `getDrawFeeConfig()` usage in simulate/publish with documented fee formula (document in README).
3. `charity_payables` table + write on `invoice.paid`; surface in admin reports as **owed**.
4. Fix `loadActiveSubscriberScores` + webhook lapsed mapping.
5. Extend seed: current-month draft draw + documented Auth admin API users.

---

## 6. PRD decisions (recommended)

| Question | Recommendation |
|----------|----------------|
| What enters the prize pool? | Net subscription after each member’s charity %; same currency as Stripe |
| Yearly plan vs monthly draws? | Accrue 1/12 of yearly fee per active month |
| Is charity % automatically paid? | Ledger now; Connect or export before claiming funds “delivered” |
| Latest five by round date or entry time? | Keep `played_on` (current trigger) |
| Can winning numbers repeat? | No — five distinct values for algorithmic mode |
| When does failed payment remove access? | Active through `past_due`; lapsed on terminal cancel/unpaid |
| Lapsed users on dashboard? | Keep overview/settings/prizes; lock scores and new draw entries |

---

## 7. What you must do manually

- [ ] New Supabase project → `supabase db push` (all migrations in order, including `20261008140000_rename_stripe_webhook_events.sql`).
- [ ] Run `supabase/seed.sql` or insert charities; **create draft draw** for current month (README SQL or Admin → Draws).
- [ ] Razorpay test products/prices (monthly + yearly); env: `RAZORPAY_*`, webhook to `/api/payments/webhook`.
- [ ] Local: use tunnel (ngrok) to forward Razorpay webhooks to localhost:3000.
- [ ] `.env.example` → `.env.local` (do **not** commit `.env` — keep secrets out of `components/`).
- [ ] Signup → `UPDATE profiles SET role = 'admin'` for admin UUID.
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` for admin lists, draw sync, homepage stats.
- [ ] Align `DRAW_FEE_*` / Razorpay currency with production business rules (or replace with code change per P0).
- [ ] Deploy Vercel; run manual test script below on live URL.

---

## 8. Manual test script

Prerequisites: env configured, migrations applied, seed charities, Razorpay webhook, draft draw for current month.

| Step | Action | Expected result |
|------|--------|-----------------|
| 1 | `/` logged out | Hero + curtain sections (how it works, how you win, charity, pricing, CTA) |
| 2 | `/signup` — charity, ≥10% | `user_charity` row; trigger on email confirm if enabled |
| 3 | `/subscribe` — monthly test card | `subscriptions.status=active`; dashboard shows plan + renewal |
| 4 | Yearly checkout (optional second user) | `plan=yearly` after webhook |
| 5 | `/dashboard/scores` — 6 dates | Only 5 scores remain |
| 6 | Duplicate date | 23505 / “One score per calendar date” |
| 7 | Admin simulate → publish | Winners; 5-match rollover on next month if none |
| 8 | Winner proof → admin approve → paid | Status pending → approved → paid |
| 9 | Non-admin `/admin` | Redirect `/dashboard` |
| 10 | `/charities` search + donation | Filters work; donation checkout when logged in |
| 11 | **RLS test** | Authenticated non-subscriber cannot insert score via API (after P0 fix) |
| 12 | Viewports 390 / 768 / 1440 | Nav, dashboard, admin usable |

---

## 9. Cursor-friendly follow-ups (from audit)

1. RLS subscription policies (P0).
2. Pool + charity ledger (P0).
3. Subscribe page `hasSupabaseEnv()` guard (mirror charities).
4. Lint: `set-state-in-effect` in motion/menu files.
5. Admin charity events CRUD.
6. Remove neutral “golf days” copy on charity profile if still present.

---

*End of progress document. Update this file when completing P0 items or after the next full audit.*
