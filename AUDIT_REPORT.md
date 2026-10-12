# digital.HEROES — Codebase Audit for Interview Prep

Audited: working tree of branch `main` at commit `8b798a8` (with uncommitted edits to `.gitignore` and `README.md`). Date: 2026-10-11.

=== SECTION 1: PROJECT META ===

## 1.1 package.json

Name `digital-heroes`, version `0.1.0`, `private: true`.

**scripts**

| script | command |
|---|---|
| dev | `next dev` |
| build | `next build` |
| start | `next start` |
| lint | `eslint` |
| seed | `npx tsx scripts/seed.ts` |
| test | `vitest run` |
| test:watch | `vitest` |

**dependencies**

| package | version |
|---|---|
| @base-ui/react | ^1.8.0 |
| @radix-ui/react-slot | ^1.4.0 |
| @supabase/ssr | ^0.12.7 |
| @supabase/supabase-js | ^2.117.2 |
| class-variance-authority | ^0.7.1 |
| clsx | ^2.1.1 |
| cn | ^0.4.0 |
| framer-motion | ^14.0.0 |
| lenis | ^1.3.26 |
| lucide-react | ^1.52.0 |
| next | 16.4.0 |
| next-themes | ^0.4.6 |
| react | 19.3.0 |
| react-dom | 19.3.0 |
| shadcn | ^4.21.3 |
| sonner | ^2.0.8 |
| tailwind-merge | ^3.7.0 |
| tw-animate-css | ^1.4.0 |
| zod | ^4.6.5 |

**devDependencies**

| package | version |
|---|---|
| @tailwindcss/turbopack | ^4 |
| @types/node | ^20 |
| @types/react | ^19 |
| @types/react-dom | ^19 |
| eslint | ^9 |
| eslint-config-next | 16.4.0 |
| tailwindcss | ^4 |
| typescript | ^5 |
| vitest | ^2.1.9 |

`next.config.ts` sets `experimental.agentFeedback: true`, `cacheComponents: true`, `partialPrefetching: true`, and a Turbopack rule that runs `*.css` through `@tailwindcss/turbopack`.

## 1.2 Environment variables referenced (names only, values never read)

Found via `process.env.X` in `app/ components/ lib/ hooks/ scripts/ middleware.ts next.config.ts vitest.config.ts`, plus the dynamic `process.env[key]` lookup in `lib/footer-links.ts:23`.

| Name | Where read (main location) | Exposed to browser bundle? |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | lib/supabase/env.ts, scripts/seed.ts | yes (NEXT_PUBLIC_) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | lib/supabase/env.ts | yes |
| SUPABASE_SERVICE_ROLE_KEY | lib/supabase/admin.ts, lib/config/env.ts, lib/home/stats.ts, lib/winners/public-queries.ts, scripts/seed.ts | no |
| NEXT_PUBLIC_SITE_URL | lib/auth/actions.ts:105, lib/site-url.ts | yes |
| PAYMENT_PROVIDER | lib/payments/env.ts | no |
| RAZORPAY_KEY_ID | lib/payments/env.ts, lib/payments/donation-actions.ts | no (value is sent to the browser as checkout `keyId`) |
| RAZORPAY_KEY_SECRET | lib/payments/env.ts | no |
| RAZORPAY_WEBHOOK_SECRET | lib/payments/env.ts | no |
| RAZORPAY_PLAN_ID_MONTHLY | lib/payments/env.ts | no |
| RAZORPAY_PLAN_ID_YEARLY | lib/payments/env.ts | no |
| DRAW_FEE_PER_SUBSCRIBER_INR | lib/draw/db.ts | no |
| DRAW_FEE_PER_SUBSCRIBER (legacy fallback) | lib/draw/db.ts | no |
| DRAW_PRIZE_POOL_PERCENTAGE | lib/draw/db.ts | no |
| NEXT_PUBLIC_SUBSCRIPTION_FEE_INR | lib/subscription/fees.ts, lib/payments/prices.ts | yes |
| NEXT_PUBLIC_SUBSCRIPTION_FEE_INR_YEARLY | lib/subscription/fees.ts, lib/payments/prices.ts | yes |
| NEXT_PUBLIC_CONTACT_EMAIL | (footer/contact) | yes |
| NEXT_PUBLIC_CONTACT_ADDRESS | (footer/contact) | yes |
| NEXT_PUBLIC_SOCIAL_LINKEDIN_URL | lib/footer-links.ts (dynamic key) | yes |
| NEXT_PUBLIC_SOCIAL_FACEBOOK_URL | lib/footer-links.ts (dynamic key) | yes |
| NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL | lib/footer-links.ts (dynamic key) | yes |
| NEXT_PUBLIC_SOCIAL_YOUTUBE_URL | lib/footer-links.ts (dynamic key) | yes |
| NODE_ENV | lib/supabase/middleware.ts and others | n/a |

All names except `DRAW_FEE_PER_SUBSCRIBER` and `NODE_ENV` also appear in `.env.example` (values: `<redacted>`). A `.env.local` file exists in the repo root and is git-ignored; it was not opened.

## 1.3 Folder tree (depth 3)

Excludes `node_modules/`, `.next/`, `.git/`. Shown one directory per line with its files listed after the colon, to keep it short. `public/` asset names are included.

```
./: .env.example, .env.local, .gitignore, AGENTS.md, AUDIT_REPORT.md, components.json, debug.log, DECISIONS.md, eslint.config.mjs, middleware.ts, next-env.d.ts, next.config.ts, package-lock.json, package.json, PROGRESS.md, README.md, skills-lock.json, tailwind.config.ts, tsconfig.json, tsconfig.tsbuildinfo, vitest.config.ts
.agents/
.agents/skills/
.agents/skills/full-output-enforcement/  (1 entries, below depth 3)
.agents/skills/redesign-existing-projects/  (1 entries, below depth 3)
app/: error.tsx, favicon.ico, globals.css, layout.tsx, not-found.tsx
app/(app)/: layout.tsx, loading.tsx
app/(app)/admin/  (10 entries, below depth 3)
app/(app)/dashboard/  (7 entries, below depth 3)
app/(app)/subscribe/  (2 entries, below depth 3)
app/(auth)/: layout.tsx
app/(auth)/forgot-password/  (2 entries, below depth 3)
app/(auth)/login/  (2 entries, below depth 3)
app/(auth)/reset-password/  (2 entries, below depth 3)
app/(auth)/signup/  (2 entries, below depth 3)
app/(marketing)/: layout.tsx, loading.tsx, page.tsx
app/(marketing)/charities/  (4 entries, below depth 3)
app/(marketing)/contact/  (3 entries, below depth 3)
app/(marketing)/faq/  (1 entries, below depth 3)
app/(marketing)/how-it-works/  (2 entries, below depth 3)
app/(marketing)/privacy/  (1 entries, below depth 3)
app/(marketing)/terms/  (1 entries, below depth 3)
app/(marketing)/winners/  (3 entries, below depth 3)
app/api/
app/api/payments/  (1 entries, below depth 3)
app/auth/
app/auth/callback/  (1 entries, below depth 3)
components/
components/admin/: admin-charities-panel.tsx, admin-draws-panel.tsx, admin-messages-panel.tsx, admin-reports-panel.tsx, admin-section.tsx, admin-users-panel.tsx, admin-winners-panel.tsx, admin-winners-table.tsx, confirm-dialog.tsx, member-label.tsx, sortable-data-table.tsx, status-pill.tsx, table-pagination.tsx, use-admin-table-url.ts
components/auth/: auth-shell.tsx, forgot-password-form.tsx, form-message.tsx, login-form.tsx, reset-password-form.tsx, sign-out-button.tsx, signup-form.tsx
components/charity/: charities-directory.tsx, charity-card.tsx, charity-image.tsx, donation-form.tsx, featured-charity-section.tsx, featured-charity-skeleton.tsx, featured-charity-spotlight.tsx
components/contact/: contact-form.tsx
components/dashboard/: bento-card.tsx, checkout-toast.tsx, dashboard-charity-card.tsx, dashboard-home.tsx, dashboard-nav.tsx, dashboard-skeleton.tsx, empty-state.tsx, settings-form.tsx
components/dev/: font-family-audit.tsx
components/draw/: count-up-currency.tsx, draw-status-steps.tsx, winning-numbers.tsx
components/editorial/: highlight-headline.tsx, paren-label.tsx, stepped-block.tsx, stepped-edge.tsx
components/faq/: faq-accordion.tsx
components/home/: editorial-charity-spotlight.tsx, editorial-final-cta.tsx, editorial-hero.tsx, editorial-how-it-works.tsx, editorial-how-you-win.tsx, editorial-mobile-subscribe-bar.tsx, editorial-pricing.tsx, homepage-curtain.tsx, human-moment.tsx, impact-count.tsx, statement-section.tsx
components/how-it-works/: pool-calculator.tsx
components/layout/: admin-chrome.tsx, app-page-heading.tsx, container.tsx, dashboard-chrome.tsx, dashboard-shell.tsx, footer-link-grid.tsx, footer-nav-link.tsx, footer-stepped-brand.tsx, footer.tsx, logo-mark.tsx, marketing-page-shell.tsx, marketing-page-skeleton.tsx, marketing-section.tsx, menu-overlay.tsx, site-footer-shell.tsx, site-footer.tsx, site-header.tsx, site-logo.tsx, site-navbar.tsx
components/legal/: legal-document.tsx
components/motion/: clip-reveal.ts, column-wipe.tsx, curtain-section.tsx, intro-wipe.tsx, line-reveal.tsx, marquee.tsx, reveal.tsx, roll-link.tsx, route-wipe.tsx, scroll-fade.tsx, scroll-progress.tsx, section-headline.tsx, step-mark.tsx
components/providers/: app-motion-shell.tsx, menu-open-context.tsx, motion-features.tsx, smooth-scroll-provider.tsx
components/scores/: score-chips.tsx, scores-load-error.tsx, scores-panel.tsx
components/subscription/: billing-manage-buttons.tsx, checkout-buttons.tsx, razorpay-checkout.ts, subscribe-plan-checkout.tsx, subscription-access-pill.tsx, upgrade-prompt.tsx
components/ui/: badge.tsx, button.tsx, card.tsx, dialog.tsx, editorial-card.tsx, input.tsx, label.tsx, page-state.tsx, password-input.tsx, section-heading.tsx, select.tsx, skeleton.tsx, slider.tsx, sonner.tsx, stat-card.tsx, table.tsx, tabs.tsx
components/winners/: winner-proof-preview.tsx, winner-proof-upload.tsx
hooks/: use-client-mounted.ts, use-count-up.ts, use-media-query.ts, use-scrub-flag.ts, use-section-tone.ts
lib/: dates.ts, fonts.ts, footer-links.ts, impact.test.ts, impact.ts, intro.ts, lenis-store.ts, money.ts, motion.ts, platform-totals.ts, scroll-to-hash.ts, site-nav-links.ts, site-url.ts, smooth-scroll-context.tsx, stepped-edge-config.ts, typography-editorial.ts, typography.ts, utils.ts
lib/actions/: failure.ts
lib/admin/: charities-actions.ts, member-labels.ts, nav.ts, overview.ts, pagination.test.ts, pagination.ts, queries.ts, users-actions.ts
lib/auth/: actions.ts, password-actions.ts, redirect-if-authenticated.ts, safe-redirect.test.ts, safe-redirect.ts, session.ts, types.ts
lib/charity/: actions.ts, categories.ts, contribution.test.ts, contribution.ts, imagery.ts, queries.ts, types.ts
lib/config/: env.ts
lib/contact/: actions.ts, admin-actions.ts, admin-queries.ts
lib/dashboard/: nav.ts, queries.ts
lib/dev/: font-audit.ts
lib/draw/: admin-actions.ts, algorithmic.ts, constants.ts, db.test.ts, db.ts, index.ts, match.test.ts, match.ts, pools.test.ts, pools.ts, publish-outcome.test.ts, publish-outcome.ts, random.test.ts, random.ts, rng.ts, simulate.test.ts, simulate.ts, sync-entry.test.ts, sync-entry.ts, types.ts
lib/faq/: content.ts
lib/home/: charities.ts, hero-image.ts, stats.ts, step-line.ts
lib/payments/: actions.ts, donation-actions.ts, env.ts, index.ts, map-razorpay-status.test.ts, map-razorpay-status.ts, mock-provider.test.ts, mock-provider.ts, prices.ts, razorpay-client.ts, razorpay-provider.test.ts, razorpay-provider.ts, razorpay-signature.test.ts, subscription-cancel.test.ts, subscription-store.ts, types.ts, webhook-handler.ts, webhook-idempotency.test.ts, webhook-idempotency.ts
lib/profile/: actions.ts, deletion-actions.ts
lib/scores/: actions.ts, dates.ts, errors.test.ts, errors.ts, rolling.test.ts, rolling.ts, types.ts
lib/subscription/: access.test.ts, access.ts, fees.ts, grants.ts, types.ts
lib/supabase/: admin.ts, client.ts, env.ts, fetch-all.test.ts, fetch-all.ts, middleware.ts, server.ts
lib/validations/: admin.ts, auth.ts, charity.ts, donation.ts, password.ts, profile.ts, score.test.ts, score.ts, subscription.ts, winner.ts
lib/winners/: actions.ts, admin-actions.ts, constants.ts, mask-name.ts, public-queries.ts, queries.ts, storage.ts, types.ts
public/: file.svg, globe.svg, hero.png, hero.webp, next.svg, Smiling Volunteers Under the Pavilion.png, vercel.svg, window.svg
public/charities/: community-health.webp, community-kitchen.webp, literacy.webp, youth-sports.webp
public/font/: Austin.woff2, BagossStandard-Medium.woff2, BagossStandard-Regular.woff2
public/impact/: children-gathered.webp
scripts/: optimize-hero.mjs, seed.ts
supabase/: seed.sql
supabase/migrations/: 20261007120000_initial_schema.sql, 20261007130000_signup_charity_metadata.sql, 20261007140000_winner_proof_storage.sql, 20261007150000_stripe_webhook_events.sql, 20261007160000_contact_and_deletion_requests.sql, 20261007170000_has_active_subscription_rls.sql, 20261007180000_subscription_past_due_status.sql, 20261008120000_charity_category.sql, 20261008130000_subscription_cancel_at_period_end.sql, 20261008140000_rename_stripe_webhook_events.sql, 20261008150000_donations_currency_inr.sql, 20261008160000_scores_reject_outside_latest_five.sql, 20261009120000_admin_pagination_and_indexes.sql, 20261009130000_donations_insert_pending_only.sql, 20261009140000_admin_winner_member_labels.sql, 20261009150000_admin_charity_breakdown.sql, 20261009160000_subscription_renewal_grace.sql
```

=== SECTION 2: CORE SOURCE FILES (verbatim) ===

Path notes:
- All requested paths exist except where noted. `requireUser` and `requireAdmin` are in `lib/auth/session.ts`. `requireActiveSubscription` is in `lib/subscription/access.ts` (re-exported from `lib/auth/session.ts`).
- Supabase clients: browser `lib/supabase/client.ts`, server (cookie session) `lib/supabase/server.ts`, service role `lib/supabase/admin.ts`, middleware client inside `lib/supabase/middleware.ts`, env helper `lib/supabase/env.ts`.
- `lib/payments/*`: included are `types.ts` (the `PaymentProvider` interface), `razorpay-provider.ts` (Razorpay adapter) and `webhook-handler.ts`. Cut to stay under the ~3000-line cap:
  - **Mock adapter `lib/payments/mock-provider.ts`** (54 lines; first in the sacrifice order). Summary: `createSubscription` upserts an `active` subscription row with external id `mock_sub_{userId}_{plan}`, customer `mock_cust_{userId}`, and `renewal_date` = today + 1 or 12 UTC months, then returns `{ mode: "mock", redirectUrl: <site>/dashboard?checkout=success }` (lines 17-37). `verifyWebhook` always throws "Mock provider does not accept webhooks" (39-41). `cancelSubscription` / `resumeSubscription` only call the store helpers that set or clear cancel-at-period-end.
  - `subscription-store.ts` (117): service-role helpers. `upsertSubscriptionRow` does a select by `external_subscription_id`, then update or insert (not an atomic upsert). `updateSubscriptionStatusByExternalId` patches status plus optional `renewal_date` / `cancel_at_period_end`. `markSubscriptionCancelAtPeriodEnd` / `clearSubscriptionCancelAtPeriodEnd` set the flag and force `status = "active"`. `renewalDateFromUnix` turns seconds into `YYYY-MM-DD` (UTC).
  - `map-razorpay-status.ts` (33): active/authenticated → active; halted/completed/expired → lapsed; cancelled → cancelled if `current_end ?? ended_at` is in the future, else lapsed; pending → past_due; anything else → lapsed.
  - `razorpay-client.ts` (50): `razorpayFetch` calls `https://api.razorpay.com/v1{path}` with Basic auth (key id:secret) and throws `RazorpayApiError(path, status, error.description)` on a non-2xx response.
  - `env.ts` (70): env getters (see 1.2). `getPaymentProviderName()` returns "mock" only when `PAYMENT_PROVIDER` is "mock", otherwise "razorpay". `planFromRazorpayPlanId` returns "yearly" only on an exact match with the yearly plan id, otherwise "monthly".
  - `index.ts` (15): `getPaymentProvider()` picks the mock or Razorpay provider and re-exports env and types.
  - `lib/supabase/env.ts` (20): `hasSupabaseEnv()` / `getSupabaseEnv()` read the URL and anon key and throw if either is missing.
  - Also not included: `actions.ts`, `donation-actions.ts` (Section 4), `prices.ts` (display labels), tests (Section 6).
- `lib/draw/constants.ts` is included because `random.ts`, `algorithmic.ts` and `pools.ts` depend on it.

### 2.1 Webhook route and idempotency

#### `app/api/payments/webhook/route.ts`

```ts
import { NextResponse } from "next/server";

import { getPaymentProvider } from "@/lib/payments";
import { handlePaymentWebhook } from "@/lib/payments/webhook-handler";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  try {
    const provider = getPaymentProvider();
    const verified = provider.verifyWebhook(rawBody, signature);
    await handlePaymentWebhook(verified);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    console.error("[payments webhook]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
```

#### `lib/payments/webhook-idempotency.ts`

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

export type WebhookIdempotencyResult = "processed" | "duplicate";

const TABLE = "payment_webhook_events";

/**
 * Inserts the payment webhook event id before handling. On duplicate (23505), skips processing.
 * On handler failure after insert, deletes the row so the provider can retry.
 */
export async function runWithWebhookIdempotency(
  admin: SupabaseClient,
  event: { id: string; type: string },
  handle: () => Promise<void>,
): Promise<WebhookIdempotencyResult> {
  const { error: insertError } = await admin.from(TABLE).insert({
    event_id: event.id,
    type: event.type,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return "duplicate";
    }
    throw new Error(insertError.message);
  }

  try {
    await handle();
    return "processed";
  } catch (error) {
    const { error: deleteError } = await admin
      .from(TABLE)
      .delete()
      .eq("event_id", event.id);

    if (deleteError) {
      throw new Error(
        `${error instanceof Error ? error.message : "Webhook handler failed"}; failed to release idempotency lock: ${deleteError.message}`,
      );
    }

    throw error;
  }
}
```

#### `lib/payments/webhook-handler.ts`

```ts
import { planFromRazorpayPlanId } from "@/lib/payments/env";
import { mapRazorpaySubscriptionStatus } from "@/lib/payments/map-razorpay-status";
import {
  renewalDateFromUnix,
  upsertSubscriptionRow,
  updateSubscriptionStatusByExternalId,
} from "@/lib/payments/subscription-store";
import type {
  RazorpayPaymentEntity,
  RazorpaySubscriptionEntity,
  RazorpayWebhookBody,
} from "@/lib/payments/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { runWithWebhookIdempotency } from "@/lib/payments/webhook-idempotency";

function subscriptionEntity(
  body: RazorpayWebhookBody,
): RazorpaySubscriptionEntity | null {
  return body.payload?.subscription?.entity ?? null;
}

function paymentEntity(body: RazorpayWebhookBody): RazorpayPaymentEntity | null {
  return body.payload?.payment?.entity ?? null;
}

function userIdFromNotes(
  notes: Record<string, string> | null | undefined,
): string | null {
  return notes?.user_id ?? notes?.userId ?? null;
}

async function syncSubscriptionEntity(entity: RazorpaySubscriptionEntity) {
  const userId = userIdFromNotes(entity.notes ?? undefined);
  if (!userId) {
    throw new Error("Razorpay subscription missing user_id note");
  }

  const planId = entity.plan_id ?? "";
  await upsertSubscriptionRow({
    userId,
    plan: planFromRazorpayPlanId(planId),
    status: mapRazorpaySubscriptionStatus(entity),
    externalCustomerId: entity.customer_id ?? null,
    externalSubscriptionId: entity.id,
    renewalDate: renewalDateFromUnix(entity.current_end),
    cancelAtPeriodEnd: false,
  });
}

async function processRazorpayEvent(body: RazorpayWebhookBody) {
  const event = body.event ?? "";

  if (event === "subscription.activated" || event === "subscription.charged") {
    const entity = subscriptionEntity(body);
    if (!entity) {
      return;
    }
    await syncSubscriptionEntity({ ...entity, status: "active" });
    return;
  }

  if (event === "payment.failed") {
    const payment = paymentEntity(body);
    const subscriptionId = payment?.subscription_id;
    if (subscriptionId) {
      await updateSubscriptionStatusByExternalId(subscriptionId, "past_due");
    }
    return;
  }

  if (event === "subscription.halted") {
    const entity = subscriptionEntity(body);
    if (entity) {
      await updateSubscriptionStatusByExternalId(entity.id, "lapsed");
    }
    return;
  }

  // All billing cycles charged: the last paid period still runs to current_end,
  // so end like a period-end cancellation (lapsed once current_end has passed).
  if (event === "subscription.completed") {
    const entity = subscriptionEntity(body);
    if (!entity) {
      return;
    }
    await updateSubscriptionStatusByExternalId(
      entity.id,
      mapRazorpaySubscriptionStatus({ ...entity, status: "cancelled" }),
      renewalDateFromUnix(entity.current_end ?? entity.ended_at),
      { cancelAtPeriodEnd: false },
    );
    return;
  }

  if (event === "subscription.cancelled") {
    const entity = subscriptionEntity(body);
    if (!entity) {
      return;
    }
    const status = mapRazorpaySubscriptionStatus(entity);
    await updateSubscriptionStatusByExternalId(
      entity.id,
      status,
      renewalDateFromUnix(entity.current_end),
      { cancelAtPeriodEnd: false },
    );
    return;
  }

  if (event === "payment.captured") {
    const payment = paymentEntity(body);
    const donationId = payment?.notes?.donation_id;
    if (!donationId) {
      return;
    }
    const admin = createAdminClient();
    const { error } = await admin
      .from("donations")
      .update({
        status: "succeeded",
        payment_intent_id: payment.id,
      })
      .eq("id", donationId);
    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function handlePaymentWebhook(
  verified: { eventId: string; eventType: string; payload: RazorpayWebhookBody },
) {
  const admin = createAdminClient();
  return runWithWebhookIdempotency(
    admin,
    { id: verified.eventId, type: verified.eventType },
    () => processRazorpayEvent(verified.payload),
  );
}
```

### 2.2 Payment provider interface and Razorpay adapter

#### `lib/payments/types.ts`

```ts
import type { SubscriptionPlan } from "@/lib/subscription/types";

export type PaymentProviderName = "razorpay" | "mock";

export type CreateSubscriptionInput = {
  userId: string;
  email?: string | null;
  plan: SubscriptionPlan;
};

export type RazorpayCheckoutPayload = {
  keyId: string;
  subscriptionId: string;
  name: string;
  description: string;
  prefill?: { email?: string; name?: string };
};

export type CreateSubscriptionResult =
  | { mode: "razorpay"; checkout: RazorpayCheckoutPayload }
  | { mode: "mock"; redirectUrl: string };

export type VerifiedWebhook = {
  eventId: string;
  eventType: string;
  payload: RazorpayWebhookBody;
};

export type RazorpayWebhookBody = {
  entity?: string;
  event?: string;
  id?: string;
  payload?: Record<string, { entity?: RazorpaySubscriptionEntity | RazorpayPaymentEntity }>;
  created_at?: number;
};

export type RazorpaySubscriptionEntity = {
  id: string;
  plan_id?: string;
  customer_id?: string | null;
  status?: string;
  current_end?: number | null;
  ended_at?: number | null;
  notes?: Record<string, string> | null;
};

export type RazorpayPaymentEntity = {
  id: string;
  status?: string;
  subscription_id?: string | null;
  notes?: Record<string, string> | null;
};

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult>;
  verifyWebhook(rawBody: string, signature: string | null): VerifiedWebhook;
  cancelSubscription(externalSubscriptionId: string): Promise<void>;
  resumeSubscription(externalSubscriptionId: string): Promise<void>;
}
```

#### `lib/payments/razorpay-provider.ts`

```ts
import { createHmac, timingSafeEqual } from "node:crypto";

import {
  getRazorpayKeyId,
  getRazorpayWebhookSecret,
  razorpayPlanIdForPlan,
} from "@/lib/payments/env";
import { razorpayFetch } from "@/lib/payments/razorpay-client";
import type {
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  PaymentProvider,
  RazorpayWebhookBody,
  VerifiedWebhook,
} from "@/lib/payments/types";

type RazorpaySubscriptionResponse = {
  id: string;
  status: string;
};

type RazorpayPlanResponse = {
  id: string;
  period?: string;
  interval?: number;
};

/**
 * Razorpay rejects subscriptions longer than 100 billing cycles for a
 * period/interval ("Exceeds the maximum total_count (100) allowed…"), so
 * every plan is capped here: 100 monthly cycles (~8 years), 10 yearly.
 */
const MAX_TOTAL_COUNT = 100;

function totalCountForPlan(plan: CreateSubscriptionInput["plan"]): number {
  return Math.min(plan === "yearly" ? 10 : 100, MAX_TOTAL_COUNT);
}

/** period reported by Razorpay for each of our plans (interval is 1). */
const EXPECTED_PERIOD: Record<CreateSubscriptionInput["plan"], string> = {
  monthly: "monthly",
  yearly: "yearly",
};

/**
 * A plan whose dashboard period doesn't match the app's idea of it also
 * trips Razorpay's total_count limit (e.g. a weekly plan billed 120 times).
 * Checked on each checkout start (subscription creation is rare, the GET is
 * cheap); if the lookup itself fails or omits `period`, checkout proceeds
 * and Razorpay stays the authority.
 */
async function assertPlanPeriodMatches(
  planId: string,
  plan: CreateSubscriptionInput["plan"],
): Promise<void> {
  let period: string;
  try {
    const response = await razorpayFetch<RazorpayPlanResponse>(`/plans/${planId}`);
    period = response.period ?? "";
  } catch {
    return;
  }
  if (period && period !== EXPECTED_PERIOD[plan]) {
    throw new Error(
      `Razorpay plan ${planId} bills per "${period}" but is configured as the ${plan} plan. ` +
        `Point RAZORPAY_PLAN_ID_${plan.toUpperCase()} at a plan with period "${EXPECTED_PERIOD[plan]}".`,
    );
  }
}

function verifyRazorpaySignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch {
    return false;
  }
}

function webhookEventId(body: RazorpayWebhookBody): string {
  if (body.id) {
    return body.id;
  }
  const sub = body.payload?.subscription?.entity?.id;
  const payment = body.payload?.payment?.entity?.id;
  return `${body.event ?? "event"}:${sub ?? payment ?? body.created_at ?? "unknown"}`;
}

export const razorpayProvider: PaymentProvider = {
  name: "razorpay",

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult> {
    const planId = razorpayPlanIdForPlan(input.plan);
    await assertPlanPeriodMatches(planId, input.plan);
    const subscription = await razorpayFetch<RazorpaySubscriptionResponse>(
      "/subscriptions",
      {
        body: {
          plan_id: planId,
          total_count: totalCountForPlan(input.plan),
          customer_notify: 1,
          notes: {
            user_id: input.userId,
            plan: input.plan,
          },
        },
      },
    );

    return {
      mode: "razorpay",
      checkout: {
        keyId: getRazorpayKeyId(),
        subscriptionId: subscription.id,
        name: "digital.HEROES",
        description:
          input.plan === "yearly"
            ? "Yearly membership"
            : "Monthly membership",
        prefill: input.email ? { email: input.email } : undefined,
      },
    };
  },

  verifyWebhook(rawBody: string, signature: string | null): VerifiedWebhook {
    if (!signature) {
      throw new Error("Missing X-Razorpay-Signature header");
    }
    const secret = getRazorpayWebhookSecret();
    if (!verifyRazorpaySignature(rawBody, signature, secret)) {
      throw new Error("Invalid Razorpay webhook signature");
    }

    const payload = JSON.parse(rawBody) as RazorpayWebhookBody;
    const eventType = payload.event ?? "unknown";
    return {
      eventId: webhookEventId(payload),
      eventType,
      payload,
    };
  },

  async cancelSubscription(externalSubscriptionId: string): Promise<void> {
    await razorpayFetch(`/subscriptions/${externalSubscriptionId}/cancel`, {
      body: { cancel_at_cycle_end: 1 },
    });
    const { markSubscriptionCancelAtPeriodEnd } =
      await import("@/lib/payments/subscription-store");
    await markSubscriptionCancelAtPeriodEnd(externalSubscriptionId);
  },

  async resumeSubscription(externalSubscriptionId: string): Promise<void> {
    await razorpayFetch(`/subscriptions/${externalSubscriptionId}/resume`, {
      body: {},
    });
    const { clearSubscriptionCancelAtPeriodEnd } =
      await import("@/lib/payments/subscription-store");
    await clearSubscriptionCancelAtPeriodEnd(externalSubscriptionId);
  },
};
```

### 2.3 Draw engine

#### `lib/draw/constants.ts`

```ts
/** Stableford points range used in draws. */
export const STABLEFORD_MIN = 1;
export const STABLEFORD_MAX = 45;

export const WINNING_NUMBER_COUNT = 5;

export const TIER_PERCENTAGES = {
  5: 0.4,
  4: 0.35,
  3: 0.25,
} as const;

export type PrizeTier = keyof typeof TIER_PERCENTAGES;
```

#### `lib/draw/random.ts`

```ts
import {
  STABLEFORD_MAX,
  STABLEFORD_MIN,
  WINNING_NUMBER_COUNT,
} from "@/lib/draw/constants";
import { defaultRng, randomInt, type Rng } from "@/lib/draw/rng";

/**
 * Lottery-style draw: five independent random Stableford values (1–45).
 * Duplicates are allowed, matching numbered-ball draws.
 */
export function generateRandomDraw(rng: Rng = defaultRng()): number[] {
  const numbers: number[] = [];
  for (let i = 0; i < WINNING_NUMBER_COUNT; i += 1) {
    numbers.push(randomInt(STABLEFORD_MIN, STABLEFORD_MAX, rng));
  }
  return numbers;
}
```

#### `lib/draw/algorithmic.ts`

```ts
import {
  STABLEFORD_MAX,
  STABLEFORD_MIN,
  WINNING_NUMBER_COUNT,
} from "@/lib/draw/constants";
import { defaultRng, randomInt, type Rng } from "@/lib/draw/rng";
import { generateRandomDraw } from "@/lib/draw/random";

export type ScoreFrequencyMap = Record<number, number>;

function buildFrequencyMap(scores: number[]): ScoreFrequencyMap {
  const map: ScoreFrequencyMap = {};
  for (let value = STABLEFORD_MIN; value <= STABLEFORD_MAX; value += 1) {
    map[value] = 0;
  }
  for (const score of scores) {
    if (score >= STABLEFORD_MIN && score <= STABLEFORD_MAX) {
      map[score] = (map[score] ?? 0) + 1;
    }
  }
  return map;
}

function pickWeightedScore(frequencies: ScoreFrequencyMap, rng: Rng): number {
  const entries = Object.entries(frequencies).map(([value, weight]) => ({
    value: Number(value),
    weight: Math.max(weight, 0),
  }));

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    return randomInt(STABLEFORD_MIN, STABLEFORD_MAX, rng);
  }

  let threshold = rng() * totalWeight;
  for (const entry of entries) {
    threshold -= entry.weight;
    if (threshold <= 0) {
      return entry.value;
    }
  }
  return entries[entries.length - 1]?.value ?? STABLEFORD_MIN;
}

/**
 * Weighted draw using score frequency across subscribers' latest scores.
 * Falls back to uniform random when no score data exists.
 */
export function generateAlgorithmicDraw(
  subscriberScores: number[],
  rng: Rng = defaultRng(),
): number[] {
  if (subscriberScores.length === 0) {
    return generateRandomDraw(rng);
  }

  const frequencies = buildFrequencyMap(subscriberScores);
  const numbers: number[] = [];
  for (let i = 0; i < WINNING_NUMBER_COUNT; i += 1) {
    numbers.push(pickWeightedScore(frequencies, rng));
  }
  return numbers;
}
```

#### `lib/draw/match.ts`

```ts
import type { PrizeTier } from "@/lib/draw/constants";
import type { DrawEntryInput, MatchResult } from "@/lib/draw/types";

/**
 * Greedy one-to-one matching between entry scores and winning numbers.
 */
export function countMatches(
  entryScores: number[],
  winningNumbers: number[],
): number {
  const remaining = [...winningNumbers];
  let matches = 0;

  for (const score of entryScores) {
    const index = remaining.indexOf(score);
    if (index !== -1) {
      matches += 1;
      remaining.splice(index, 1);
    }
  }

  return matches;
}

function tierFromMatchCount(matchCount: number): PrizeTier | null {
  if (matchCount === 5 || matchCount === 4 || matchCount === 3) {
    return matchCount as PrizeTier;
  }
  return null;
}

/** Returns per-user match counts and prize tier (3, 4, 5) when eligible. */
export function matchEntries(
  entries: DrawEntryInput[],
  winningNumbers: number[],
): MatchResult[] {
  return entries.map((entry) => {
    const matchCount = countMatches(entry.scores, winningNumbers);
    return {
      userId: entry.userId,
      matchCount,
      tier: tierFromMatchCount(matchCount),
    };
  });
}
```

#### `lib/draw/pools.ts`

```ts
import { TIER_PERCENTAGES, type PrizeTier } from "@/lib/draw/constants";
import type {
  MatchResult,
  PrizePoolBreakdown,
  SplitPrizesResult,
  WinnerAllocation,
} from "@/lib/draw/types";

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Compute tier pools from active subscribers and fee.
 * `poolPercentage` is the share of gross fees allocated to prizes (e.g. 100 = full fee pool).
 * `carryover` is added only to the 5-match tier (jackpot).
 */
export function calculatePrizePools(
  activeSubscribers: number,
  feePerSubscriber: number,
  poolPercentage: number,
  carryover: number,
): PrizePoolBreakdown {
  const safeSubscribers = Math.max(0, activeSubscribers);
  const safeFee = Math.max(0, feePerSubscriber);
  const safePercentage = Math.max(0, poolPercentage);

  const totalPool = roundMoney(
    safeSubscribers * safeFee * (safePercentage / 100),
  );

  const tier5Pool = roundMoney(
    totalPool * TIER_PERCENTAGES[5] + Math.max(0, carryover),
  );
  const tier4Pool = roundMoney(totalPool * TIER_PERCENTAGES[4]);
  const tier3Pool = roundMoney(totalPool * TIER_PERCENTAGES[3]);

  return {
    totalPool,
    tier5Pool,
    tier4Pool,
    tier3Pool,
  };
}

function splitPoolAmongWinners(
  poolAmount: number,
  winnerUserIds: string[],
  tier: PrizeTier,
): WinnerAllocation[] {
  if (winnerUserIds.length === 0 || poolAmount <= 0) {
    return [];
  }

  const poolCents = Math.round(poolAmount * 100);
  const baseShare = Math.floor(poolCents / winnerUserIds.length);
  let remainder = poolCents - baseShare * winnerUserIds.length;

  return winnerUserIds.map((userId) => {
    const extra = remainder > 0 ? 1 : 0;
    if (remainder > 0) {
      remainder -= 1;
    }
    const cents = baseShare + extra;
    return {
      userId,
      tier,
      prizeAmount: cents / 100,
    };
  });
}

/**
 * Split each tier pool equally among winners in that tier.
 * Unclaimed 5-match pool rolls over to `nextJackpotCarryover`.
 */
export function splitPrizes(
  pools: PrizePoolBreakdown,
  matches: MatchResult[],
): SplitPrizesResult {
  const tier5Winners = matches
    .filter((match) => match.tier === 5)
    .map((match) => match.userId);
  const tier4Winners = matches
    .filter((match) => match.tier === 4)
    .map((match) => match.userId);
  const tier3Winners = matches
    .filter((match) => match.tier === 3)
    .map((match) => match.userId);

  const allocations: WinnerAllocation[] = [
    ...splitPoolAmongWinners(pools.tier5Pool, tier5Winners, 5),
    ...splitPoolAmongWinners(pools.tier4Pool, tier4Winners, 4),
    ...splitPoolAmongWinners(pools.tier3Pool, tier3Winners, 3),
  ];

  const nextJackpotCarryover =
    tier5Winners.length === 0 ? roundMoney(pools.tier5Pool) : 0;

  return {
    allocations,
    nextJackpotCarryover,
  };
}
```

#### `lib/draw/rng.ts`

```ts
/** Random in [0, 1). */
export type Rng = () => number;

export function defaultRng(): Rng {
  return Math.random;
}

/** Deterministic RNG for tests (mulberry32). */
export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(min: number, max: number, rng: Rng): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}
```

### 2.4 Scores, subscription access, charity

#### `lib/scores/rolling.ts`

```ts
export type ScoreRecord = {
  id: string;
  played_on: string;
  score: number;
  created_at?: string;
};

const MAX_STORED_SCORES = 5;

/** Newest `played_on` first; ties broken by `created_at` descending. */
export function sortScoresNewestFirst(scores: ScoreRecord[]): ScoreRecord[] {
  return [...scores].sort((a, b) => {
    const byDate = b.played_on.localeCompare(a.played_on);
    if (byDate !== 0) {
      return byDate;
    }
    const aCreated = a.created_at ?? "";
    const bCreated = b.created_at ?? "";
    return bCreated.localeCompare(aCreated);
  });
}

/** Returns the five scores that should remain after the DB retention trigger runs. */
export function keepLatestScores(
  scores: ScoreRecord[],
  limit = MAX_STORED_SCORES,
): ScoreRecord[] {
  return sortScoresNewestFirst(scores).slice(0, limit);
}

/**
 * Simulates insert + unique-per-day replace + five-score cap (matches DB trigger intent).
 */
export function applyScoreRetention(
  existing: ScoreRecord[],
  incoming: ScoreRecord,
  limit = MAX_STORED_SCORES,
): ScoreRecord[] {
  const withoutSameDay = existing.filter(
    (row) =>
      row.id !== incoming.id && row.played_on !== incoming.played_on,
  );
  return keepLatestScores([...withoutSameDay, incoming], limit);
}

/**
 * The oldest kept score that `incoming` would have to beat, or null when it
 * would be retained. `incoming.id` is set on edits so the row being changed
 * doesn't count against itself. Mirrors `scores_reject_outside_latest_five`.
 */
export function findRetentionCutoff(
  existing: ScoreRecord[],
  incoming: Pick<ScoreRecord, "played_on"> & { id?: string },
  limit = MAX_STORED_SCORES,
): ScoreRecord | null {
  const others = existing.filter((row) => row.id !== incoming.id);
  if (others.length < limit) {
    return null;
  }
  const cutoff = sortScoresNewestFirst(others)[limit - 1];
  return incoming.played_on < cutoff.played_on ? cutoff : null;
}

export function findScoreOnDate(
  scores: ScoreRecord[],
  playedOn: string,
): ScoreRecord | undefined {
  return scores.find((row) => row.played_on === playedOn);
}

export const SCORE_SLOT_COUNT = MAX_STORED_SCORES;
```

#### `lib/subscription/grants.ts`

```ts
import type { SubscriptionRow, SubscriptionStatus } from "@/lib/subscription/types";

function isoDateLocal(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isOnOrBeforePeriodEnd(
  renewalDate: string | null | undefined,
  today: Date,
): boolean {
  if (!renewalDate) {
    return false;
  }
  return renewalDate >= isoDateLocal(today);
}

/**
 * Days an `active` row keeps access past its `renewal_date` while the renewal
 * webhook is outstanding. After that it is treated as lapsed, so a missed or
 * never-coming renewal (or a mock subscription) can't grant access forever.
 * Mirrored in has_active_subscription() — change both together.
 */
export const RENEWAL_GRACE_DAYS = 3;

function isWithinRenewalGrace(
  renewalDate: string | null | undefined,
  today: Date,
): boolean {
  // No renewal date (e.g. an admin-created row): nothing to lapse against.
  if (!renewalDate) {
    return true;
  }
  const cutoff = new Date(today);
  cutoff.setUTCDate(cutoff.getUTCDate() - RENEWAL_GRACE_DAYS);
  return renewalDate >= isoDateLocal(cutoff);
}

/** Whether a subscription row grants product access (mirrors has_active_subscription RLS). */
export function subscriptionGrantsAccess(
  subscription: Pick<
    SubscriptionRow,
    "status" | "renewal_date" | "cancel_at_period_end"
  >,
  today = new Date(),
): boolean {
  const cancelAtEnd = Boolean(subscription.cancel_at_period_end);

  if (subscription.status === "active") {
    if (cancelAtEnd) {
      return isOnOrBeforePeriodEnd(subscription.renewal_date, today);
    }
    return isWithinRenewalGrace(subscription.renewal_date, today);
  }

  if (subscription.status === "cancelled") {
    return isOnOrBeforePeriodEnd(subscription.renewal_date, today);
  }

  return false;
}

export type SubscriptionAccessLabel =
  | { tone: "active"; label: string }
  | { tone: "cancelling"; label: string }
  | { tone: "inactive"; label: string };

/** User-facing membership label for dashboard, settings, and admin. */
export function getSubscriptionAccessLabel(
  subscription: Pick<
    SubscriptionRow,
    "status" | "renewal_date" | "cancel_at_period_end"
  > | null,
  hasAccess: boolean,
): SubscriptionAccessLabel {
  if (!subscription || !hasAccess) {
    if (subscription?.status === "lapsed") {
      return { tone: "inactive", label: "Lapsed" };
    }
    return { tone: "inactive", label: "Inactive" };
  }

  if (subscription.cancel_at_period_end && subscription.renewal_date) {
    const formatted = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
    }).format(new Date(`${subscription.renewal_date}T12:00:00`));
    return {
      tone: "cancelling",
      label: `Active, cancels on ${formatted}`,
    };
  }

  return { tone: "active", label: "Active" };
}

export function isSubscriptionStatus(
  value: string,
): value is SubscriptionStatus {
  return (
    value === "active" ||
    value === "cancelled" ||
    value === "lapsed" ||
    value === "past_due"
  );
}
```

#### `lib/charity/contribution.ts`

```ts
/** Minimum share of subscription fee directed to charity (PRD). */
export const MIN_CHARITY_PERCENTAGE = 10;

export type CharityContribution = {
  /** Effective percentage after clamping to [10, 100]. */
  percentage: number;
  /** Whole paise allocated to charity (rounded). */
  amountCents: number;
};

/** Clamp user-selected percentage to the allowed range. */
export function normalizeCharityPercentage(percentage: number): number {
  if (!Number.isFinite(percentage)) {
    return MIN_CHARITY_PERCENTAGE;
  }
  return Math.min(100, Math.max(MIN_CHARITY_PERCENTAGE, percentage));
}

/**
 * Compute charity amount from subscription fee and member percentage.
 * Fee is in paise (INR minor units). Percentage minimum 10%.
 */
export function calculateCharityContribution(
  subscriptionFeeCents: number,
  percentage: number,
): CharityContribution {
  if (!Number.isFinite(subscriptionFeeCents) || subscriptionFeeCents < 0) {
    throw new Error("subscriptionFeeCents must be a non-negative number");
  }

  const effectivePercentage = normalizeCharityPercentage(percentage);
  const amountCents = Math.round(
    subscriptionFeeCents * (effectivePercentage / 100),
  );

  return {
    percentage: effectivePercentage,
    amountCents,
  };
}
```

### 2.5 Auth guards

#### `lib/auth/session.ts`

```ts
import { redirect } from "next/navigation";

import type { ProfileRole } from "@/lib/supabase/middleware";
import { createClient } from "@/lib/supabase/server";

type RequireUserOptions = {
  /** Path passed to login as `next` (must start with /). */
  loginNext?: string;
};

/** Require an authenticated user (server-side; middleware is first line of defense). */
export async function requireUser(options?: RequireUserOptions) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const next = options?.loginNext;
    if (next?.startsWith("/")) {
      redirect(`/login?next=${encodeURIComponent(next)}`);
    }
    redirect("/login");
  }

  return { supabase, user };
}

/** Require admin role; redirects subscribers to dashboard. */
export async function requireAdmin() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return { supabase, user, role: profile.role as ProfileRole };
}

export { requireActiveSubscription, getSubscriptionAccess } from "@/lib/subscription/access";
```

#### `lib/subscription/access.ts`

```ts
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/session";
import { subscriptionGrantsAccess } from "@/lib/subscription/grants";
import type { SubscriptionRow } from "@/lib/subscription/types";
import type { createClient } from "@/lib/supabase/server";

export {
  getSubscriptionAccessLabel,
  isSubscriptionStatus,
  subscriptionGrantsAccess,
  type SubscriptionAccessLabel,
} from "@/lib/subscription/grants";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/** Latest subscription row for a user (any status). */
export async function getLatestSubscription(
  supabase: SupabaseServer,
  userId: string,
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as SubscriptionRow | null;
}

export type SubscriptionAccess = {
  hasAccess: boolean;
  subscription: SubscriptionRow | null;
  isAdmin: boolean;
};

/** Resolve subscription access without redirecting. Admins always have access. */
export async function getSubscriptionAccess(
  supabase: SupabaseServer,
  userId: string,
): Promise<SubscriptionAccess> {
  // Both reads in parallel: this sits on the critical path of /subscribe and
  // the dashboard, and the subscription read is wasted only for admins.
  const [{ data: profile }, subscription] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
    getLatestSubscription(supabase, userId),
  ]);

  if (profile?.role === "admin") {
    return { hasAccess: true, subscription: null, isAdmin: true };
  }

  const hasAccess = subscription
    ? subscriptionGrantsAccess({
        status: subscription.status,
        renewal_date: subscription.renewal_date,
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      })
    : false;

  return { hasAccess, subscription, isAdmin: false };
}

/**
 * Require an active subscription on protected server routes.
 * Admins bypass. Others redirect to /subscribe.
 */
export async function requireActiveSubscription() {
  const { supabase, user } = await requireUser();
  const access = await getSubscriptionAccess(supabase, user.id);

  if (!access.hasAccess) {
    redirect("/subscribe");
  }

  return { supabase, user, subscription: access.subscription, isAdmin: access.isAdmin };
}

```

### 2.6 Supabase clients

#### `lib/supabase/client.ts`

```ts
import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/supabase/env";

/** Browser Supabase client for client components. */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
```

#### `lib/supabase/server.ts`

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "@/lib/supabase/env";

/** Server Supabase client with cookie-backed session (Server Components / Actions). */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll from Server Component — middleware will refresh session.
        }
      },
    },
  });
}
```

#### `lib/supabase/admin.ts`

```ts
import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";

/** Service-role client for payment webhooks and admin tasks (bypasses RLS). */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  const { url } = getSupabaseEnv();
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

### 2.7 Middleware

#### `middleware.ts`

```ts
import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

#### `lib/supabase/middleware.ts`

```ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

export type ProfileRole = "subscriber" | "admin";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Service misconfigured", { status: 503 });
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/payments")) {
    return supabaseResponse;
  }

  const isProtectedDashboard = pathname.startsWith("/dashboard");
  const isProtectedAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  const isSubscribe = pathname === "/subscribe";

  if (!user && (isProtectedDashboard || isProtectedAdmin || isSubscribe)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isProtectedAdmin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
```

=== SECTION 3: DATABASE ===

Source: the 17 files in `supabase/migrations/` (plus `supabase/seed.sql`, which only inserts sample charities). Everything below is the **final state after all migrations**, with superseded definitions noted.

## 3a. Tables

Common pattern: `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at timestamptz NOT NULL DEFAULT now()`. RLS is enabled on every table listed.

**profiles** (initial_schema)
| column | type | null | default | constraints |
|---|---|---|---|---|
| id | uuid | NOT NULL | — | PK, FK → auth.users(id) ON DELETE CASCADE |
| role | text | NOT NULL | 'subscriber' | CHECK `profiles_role_check`: role IN ('subscriber','admin') |
| display_name | text | null | — | |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**subscriptions**
| column | type | null | default | constraints |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → profiles(id) ON DELETE CASCADE |
| plan | text | NOT NULL | — | CHECK `subscriptions_plan_check`: plan IN ('monthly','yearly') |
| status | text | NOT NULL | 'active' | CHECK `subscriptions_status_check`: status IN ('active','cancelled','lapsed','past_due') (`past_due` added in 20261007180000) |
| external_customer_id | text | null | — | renamed from stripe_customer_id (20261008140000) |
| external_subscription_id | text | null | — | UNIQUE `subscriptions_external_subscription_id_unique` (renamed from stripe_subscription_id) |
| renewal_date | date | null | — | |
| cancel_at_period_end | boolean | NOT NULL | false | added 20261008130000 |
| created_at / updated_at | timestamptz | NOT NULL | now() | |

Indexes: `subscriptions_status_idx (status)`, `subscriptions_user_id_created_at_idx (user_id, created_at DESC)`. `subscriptions_user_id_idx (user_id)` was created then dropped in 20261009120000.

**charities**
| column | type | null | default | constraints |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| name | text | NOT NULL | — | |
| slug | text | NOT NULL | — | UNIQUE |
| description | text | null | — | |
| images | jsonb | NOT NULL | '[]'::jsonb | |
| is_featured | boolean | NOT NULL | false | |
| category | text | null | — | added 20261008120000 |
| created_at / updated_at | timestamptz | NOT NULL | now() | |

Indexes: `charities_is_featured_idx (is_featured) WHERE is_featured = true`, `charities_category_idx (category) WHERE category IS NOT NULL`.

**charity_events**: id PK; charity_id uuid NOT NULL FK → charities(id) ON DELETE CASCADE; title text NOT NULL; description text null; event_date date NOT NULL; location text null; created_at/updated_at timestamptz NOT NULL now(). Indexes: `charity_events_charity_id_idx (charity_id)`, `charity_events_event_date_idx (event_date)`.

**user_charity**
| column | type | null | default | constraints |
|---|---|---|---|---|
| user_id | uuid | NOT NULL | — | PK, FK → profiles(id) ON DELETE CASCADE |
| charity_id | uuid | NOT NULL | — | FK → charities(id) ON DELETE RESTRICT |
| percentage | numeric(5,2) | NOT NULL | — | CHECK `user_charity_percentage_min`: percentage >= 10 (no upper bound in the DB) |
| created_at / updated_at | timestamptz | NOT NULL | now() | |

Index: `user_charity_charity_id_idx (charity_id)` (added 20261009120000).

**donations**
| column | type | null | default | constraints |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → profiles(id) ON DELETE CASCADE |
| charity_id | uuid | NOT NULL | — | FK → charities(id) ON DELETE RESTRICT |
| amount_cents | integer | NOT NULL | — | CHECK `donations_amount_cents_positive`: amount_cents > 0 (holds paise for INR) |
| currency | text | NOT NULL | 'inr' | default was 'gbp' until 20261008150000 |
| payment_intent_id | text | null | — | renamed from stripe_payment_intent_id |
| status | text | NOT NULL | 'pending' | CHECK `donations_status_check`: status IN ('pending','succeeded','failed') |
| created_at | timestamptz | NOT NULL | now() | |

Indexes: `donations_user_id_idx (user_id)`, `donations_charity_id_idx (charity_id)`.

**scores**
| column | type | null | default | constraints |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | — | FK → profiles(id) ON DELETE CASCADE |
| score | smallint | NOT NULL | — | CHECK `scores_score_range`: score BETWEEN 1 AND 45 |
| played_on | date | NOT NULL | — | |
| created_at | timestamptz | NOT NULL | now() | |

Unique `scores_one_per_user_per_day (user_id, played_on)`. Index `scores_user_id_played_on_idx (user_id, played_on DESC)`.

**draws**
| column | type | null | default | constraints |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| month | date | NOT NULL | — | UNIQUE `draws_month_unique`; CHECK `draws_month_first_day`: extract(day FROM month) = 1 |
| status | text | NOT NULL | 'draft' | CHECK `draws_status_check`: status IN ('draft','simulated','published') |
| mode | text | NOT NULL | 'random' | CHECK `draws_mode_check`: mode IN ('random','algorithmic') |
| winning_numbers | jsonb | null | — | |
| jackpot_carryover | numeric(12,2) | NOT NULL | 0 | |
| created_at / updated_at | timestamptz | NOT NULL | now() | |

**draw_entries**: id PK; draw_id uuid NOT NULL FK → draws(id) ON DELETE CASCADE; user_id uuid NOT NULL FK → profiles(id) ON DELETE CASCADE; score_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb; created_at. Unique `draw_entries_unique_per_draw (draw_id, user_id)`. Indexes `draw_entries_draw_id_idx (draw_id)`, `draw_entries_user_id_idx (user_id)`.

**winners**
| column | type | null | default | constraints |
|---|---|---|---|---|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| draw_id | uuid | NOT NULL | — | FK → draws(id) ON DELETE CASCADE |
| user_id | uuid | NOT NULL | — | FK → profiles(id) ON DELETE CASCADE |
| tier | smallint | NOT NULL | — | CHECK `winners_tier_check`: tier IN (3,4,5) |
| prize_amount | numeric(12,2) | NOT NULL | — | CHECK `winners_prize_amount_non_negative`: prize_amount >= 0 (rupees) |
| proof_url | text | null | — | storage object path, not a URL |
| verification | text | NOT NULL | 'pending' | CHECK `winners_verification_check`: IN ('pending','approved','rejected') |
| payment | text | NOT NULL | 'pending' | CHECK `winners_payment_check`: IN ('pending','paid') |
| created_at / updated_at | timestamptz | NOT NULL | now() | |

Unique `winners_unique_user_tier_per_draw (draw_id, user_id, tier)`. Indexes `winners_draw_id_idx`, `winners_user_id_idx`.

**payment_webhook_events** (created as `stripe_webhook_events` in 20261007150000, renamed in 20261008140000): event_id text PK; type text NOT NULL; processed_at timestamptz NOT NULL DEFAULT now(). RLS enabled with **no policies**; `GRANT ALL ... TO service_role`.

**contact_messages** (20261007160000): id PK; name text NOT NULL; email text NOT NULL; message text NOT NULL; resolved boolean NOT NULL DEFAULT false; created_at. Indexes `contact_messages_created_at_idx (created_at DESC)`, `contact_messages_unresolved_created_at_idx (created_at DESC) WHERE resolved = false`. Grants: INSERT to anon, authenticated; SELECT, UPDATE to authenticated.

**account_deletion_requests** (20261007160000): id PK; user_id uuid NOT NULL FK → profiles(id) ON DELETE CASCADE, UNIQUE `account_deletion_requests_user_unique`; status text NOT NULL DEFAULT 'pending' CHECK `account_deletion_requests_status_check`: IN ('pending','reviewed','cancelled'); created_at. Grants: INSERT, SELECT, UPDATE to authenticated.

**Storage bucket** `winner-proofs` (20261007140000): private (`public = false`), `file_size_limit = 5242880`, `allowed_mime_types = {image/png, image/jpeg, image/jpg, image/webp}`. Path convention `{user_id}/{winner_id}/filename.ext`.

**Grants in initial_schema**: `GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role`; `GRANT SELECT ON charities, charity_events TO anon, authenticated`; `GRANT SELECT ON draws TO authenticated`; `GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role` (applies to the tables existing at that point); same for sequences.

## 3b. Row-Level Security policies (final state)

Expressions are verbatim; only line breaks and indentation inside multi-line expressions were collapsed to single spaces. "roles = (default)" means the policy has no `TO` clause, so it applies to all roles (PUBLIC, including `anon`). `service_role` bypasses RLS entirely.

| table | policy | cmd | roles | USING | WITH CHECK |
|---|---|---|---|---|---|
| profiles | profiles_select_own_or_admin | SELECT | (default) | `id = auth.uid() OR public.is_admin()` | — |
| profiles | profiles_update_own_or_admin | UPDATE | (default) | `id = auth.uid() OR public.is_admin()` | `id = auth.uid() OR public.is_admin()` |
| profiles | profiles_insert_admin | INSERT | (default) | — | `public.is_admin() OR id = auth.uid()` |
| profiles | profiles_delete_admin | DELETE | (default) | `public.is_admin()` | — |
| subscriptions | subscriptions_select_own_or_admin | SELECT | (default) | `user_id = auth.uid() OR public.is_admin()` | — |
| subscriptions | subscriptions_insert_admin | INSERT | (default) | — | `public.is_admin()` |
| subscriptions | subscriptions_update_admin | UPDATE | (default) | `public.is_admin()` | `public.is_admin()` |
| subscriptions | subscriptions_delete_admin | DELETE | (default) | `public.is_admin()` | — |
| charities | charities_select_public | SELECT | (default) | `true` | — |
| charities | charities_insert_admin | INSERT | (default) | — | `public.is_admin()` |
| charities | charities_update_admin | UPDATE | (default) | `public.is_admin()` | `public.is_admin()` |
| charities | charities_delete_admin | DELETE | (default) | `public.is_admin()` | — |
| charity_events | charity_events_select_public | SELECT | (default) | `true` | — |
| charity_events | charity_events_insert_admin | INSERT | (default) | — | `public.is_admin()` |
| charity_events | charity_events_update_admin | UPDATE | (default) | `public.is_admin()` | `public.is_admin()` |
| charity_events | charity_events_delete_admin | DELETE | (default) | `public.is_admin()` | — |
| user_charity | user_charity_select_own_or_admin | SELECT | (default) | `user_id = auth.uid() OR public.is_admin()` | — |
| user_charity | user_charity_insert_own_or_admin | INSERT | (default) | — | `user_id = auth.uid() OR public.is_admin()` |
| user_charity | user_charity_update_own_or_admin | UPDATE | (default) | `user_id = auth.uid() OR public.is_admin()` | `user_id = auth.uid() OR public.is_admin()` |
| user_charity | user_charity_delete_own_or_admin | DELETE | (default) | `user_id = auth.uid() OR public.is_admin()` | — |
| donations | donations_select_own_or_admin | SELECT | (default) | `user_id = auth.uid() OR public.is_admin()` | — |
| donations | donations_insert_own_or_admin (replaced in 20261009130000) | INSERT | (default) | — | `public.is_admin() OR ( user_id = auth.uid() AND status = 'pending' )` |
| donations | donations_update_admin | UPDATE | (default) | `public.is_admin()` | `public.is_admin()` |
| donations | donations_delete_admin | DELETE | (default) | `public.is_admin()` | — |
| scores | scores_select_own_or_admin | SELECT | (default) | `user_id = auth.uid() OR public.is_admin()` | — |
| scores | scores_insert_own_or_admin (replaced in 20261007170000) | INSERT | (default) | — | `public.is_admin() OR ( user_id = auth.uid() AND public.has_active_subscription(auth.uid()) )` |
| scores | scores_update_own_or_admin (replaced in 20261007170000) | UPDATE | (default) | `public.is_admin() OR ( user_id = auth.uid() AND public.has_active_subscription(auth.uid()) )` | `public.is_admin() OR ( user_id = auth.uid() AND public.has_active_subscription(auth.uid()) )` |
| scores | scores_delete_own_or_admin | DELETE | (default) | `user_id = auth.uid() OR public.is_admin()` | — |
| draws | draws_select_published_or_admin | SELECT | (default) | `status = 'published' OR public.is_admin()` | — |
| draws | draws_insert_admin | INSERT | (default) | — | `public.is_admin()` |
| draws | draws_update_admin | UPDATE | (default) | `public.is_admin()` | `public.is_admin()` |
| draws | draws_delete_admin | DELETE | (default) | `public.is_admin()` | — |
| draw_entries | draw_entries_select_own_or_admin | SELECT | (default) | `user_id = auth.uid() OR public.is_admin()` | — |
| draw_entries | draw_entries_insert_own_or_admin (replaced in 20261007170000) | INSERT | (default) | — | `public.is_admin() OR ( user_id = auth.uid() AND public.has_active_subscription(auth.uid()) )` |
| draw_entries | draw_entries_update_own_or_admin (replaced in 20261007170000) | UPDATE | (default) | `public.is_admin() OR ( user_id = auth.uid() AND public.has_active_subscription(auth.uid()) )` | `public.is_admin() OR ( user_id = auth.uid() AND public.has_active_subscription(auth.uid()) )` |
| draw_entries | draw_entries_delete_admin | DELETE | (default) | `public.is_admin()` | — |
| winners | winners_select_own_or_admin | SELECT | (default) | `user_id = auth.uid() OR public.is_admin()` | — |
| winners | winners_insert_admin | INSERT | (default) | — | `public.is_admin()` |
| winners | winners_update_own_or_admin | UPDATE | (default) | `user_id = auth.uid() OR public.is_admin()` | `user_id = auth.uid() OR public.is_admin()` |
| winners | winners_delete_admin | DELETE | (default) | `public.is_admin()` | — |
| contact_messages | contact_messages_insert_public | INSERT | anon, authenticated | — | `true` |
| contact_messages | contact_messages_select_admin | SELECT | authenticated | `public.is_admin()` | — |
| contact_messages | contact_messages_update_admin | UPDATE | authenticated | `public.is_admin()` | `public.is_admin()` |
| account_deletion_requests | account_deletion_insert_own | INSERT | authenticated | — | `auth.uid() = user_id` |
| account_deletion_requests | account_deletion_select_own_or_admin | SELECT | authenticated | `auth.uid() = user_id OR public.is_admin()` | — |
| account_deletion_requests | account_deletion_update_own | UPDATE | authenticated | `auth.uid() = user_id` | `auth.uid() = user_id` |
| payment_webhook_events | (none) | — | — | — | — |
| storage.objects | winner_proofs_select_owner_or_admin | SELECT | authenticated | `bucket_id = 'winner-proofs' AND ( public.is_admin() OR (storage.foldername(name))[1] = auth.uid()::text )` | — |
| storage.objects | winner_proofs_insert_owner | INSERT | authenticated | — | `bucket_id = 'winner-proofs' AND (storage.foldername(name))[1] = auth.uid()::text` |
| storage.objects | winner_proofs_update_owner | UPDATE | authenticated | `bucket_id = 'winner-proofs' AND (storage.foldername(name))[1] = auth.uid()::text` | `bucket_id = 'winner-proofs' AND (storage.foldername(name))[1] = auth.uid()::text` |
| storage.objects | winner_proofs_delete_owner_or_admin | DELETE | authenticated | `bucket_id = 'winner-proofs' AND ( public.is_admin() OR (storage.foldername(name))[1] = auth.uid()::text )` | — |

Superseded originals (initial_schema), for history:
- `donations_insert_own_or_admin` WITH CHECK `user_id = auth.uid() OR public.is_admin()` (allowed members to insert `status = 'succeeded'`; fixed in 20261009130000).
- `scores_insert_own_or_admin` / `scores_update_own_or_admin` and `draw_entries_insert_own_or_admin` / `draw_entries_update_own_or_admin`: `user_id = auth.uid() OR public.is_admin()` (no subscription check; fixed in 20261007170000).

Table grants limit `anon` to SELECT on `charities` and `charity_events` and INSERT on `contact_messages`, so the (default)-role policies are reachable by `anon` only on those tables. `draws` SELECT is granted to `authenticated` only.

## 3c. Triggers

| trigger | table | timing | event | function |
|---|---|---|---|---|
| profiles_guard_role_trigger | public.profiles | BEFORE | UPDATE, FOR EACH ROW | public.profiles_guard_role() |
| on_auth_user_created | auth.users | AFTER | INSERT, FOR EACH ROW | public.handle_new_user() |
| scores_enforce_latest_five_trigger | public.scores | AFTER | INSERT OR UPDATE OF user_id, played_on, FOR EACH ROW (was AFTER INSERT only until 20261008160000) | public.scores_enforce_latest_five() |
| scores_reject_outside_latest_five_trigger | public.scores | BEFORE | INSERT OR UPDATE OF user_id, played_on, FOR EACH ROW | public.scores_reject_outside_latest_five() |
| winners_guard_member_update_trigger | public.winners | BEFORE | UPDATE, FOR EACH ROW | public.winners_guard_member_update() |

No `updated_at` maintenance triggers exist; the app sets `updated_at` in each write.

All five trigger functions are **SECURITY DEFINER** with `SET search_path = public`. Full bodies, verbatim:

`supabase/migrations/20261007120000_initial_schema.sql` lines 49–62:

```sql
-- Prevent subscribers from escalating their own role.
CREATE OR REPLACE FUNCTION public.profiles_guard_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change profile roles';
  END IF;
  RETURN NEW;
END;
$$;
```

`handle_new_user()` — final version (20261007130000). The original in initial_schema (lines 65–77) only inserted the `profiles` row.

`supabase/migrations/20261007130000_signup_charity_metadata.sql` lines 1–31:

```sql
-- On signup, create user_charity from auth.users.raw_user_meta_data (email-confirm flow).

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  charity_uuid uuid;
  pct numeric;
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'subscriber')
  ON CONFLICT (id) DO NOTHING;

  charity_uuid := NULLIF(NEW.raw_user_meta_data ->> 'charity_id', '')::uuid;
  pct := COALESCE((NEW.raw_user_meta_data ->> 'charity_percentage')::numeric, 10);

  IF charity_uuid IS NOT NULL THEN
    INSERT INTO public.user_charity (user_id, charity_id, percentage)
    VALUES (NEW.id, charity_uuid, GREATEST(pct, 10))
    ON CONFLICT (user_id) DO UPDATE
      SET charity_id = EXCLUDED.charity_id,
          percentage = EXCLUDED.percentage,
          updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;
```

`supabase/migrations/20261007120000_initial_schema.sql` lines 212–239:

```sql
-- Keep only the latest five scores per user (by played_on, then created_at).
CREATE OR REPLACE FUNCTION public.scores_enforce_latest_five()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.scores s
  WHERE s.user_id = NEW.user_id
    AND s.id NOT IN (
      SELECT id
      FROM public.scores
      WHERE user_id = NEW.user_id
      ORDER BY played_on DESC, created_at DESC
      LIMIT 5
    );
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.scores_enforce_latest_five() IS
  'After insert, deletes older rows so each user retains at most five scores (newest played_on first).';

CREATE TRIGGER scores_enforce_latest_five_trigger
  AFTER INSERT ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.scores_enforce_latest_five();
```

`supabase/migrations/20261008160000_scores_reject_outside_latest_five.sql` lines 1–61:

```sql
-- Scores: reject writes that the latest-five retention would immediately undo.
--
-- scores_enforce_latest_five() (AFTER INSERT) deletes everything outside a
-- user's five newest played_on dates. With five scores on file, inserting an
-- OLDER date succeeded and then deleted the row just inserted: a silent
-- success with nothing saved. This BEFORE trigger raises instead, so the
-- retention rule stays but never discards the row being written.
--
-- Error contract: SQLSTATE 'DH001' (mapped in lib/scores/errors.ts). Kept
-- distinct from 23505 (scores_one_per_user_per_day, duplicate date).

CREATE OR REPLACE FUNCTION public.scores_reject_outside_latest_five()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cutoff date;
BEGIN
  -- Serialise writes per user: without this, two concurrent inserts can both
  -- pass the check and one's AFTER trim deletes the other's row.
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.user_id::text, 0));

  -- Fifth-newest of the user's OTHER rows (the row being edited never counts
  -- against itself, so ordinary edits of a five-score history always pass).
  SELECT s.played_on INTO cutoff
  FROM public.scores s
  WHERE s.user_id = NEW.user_id
    AND s.id IS DISTINCT FROM NEW.id
  ORDER BY s.played_on DESC, s.created_at DESC
  OFFSET 4
  LIMIT 1;

  IF cutoff IS NOT NULL AND NEW.played_on < cutoff THEN
    RAISE EXCEPTION 'Score date % is older than the latest five scores (oldest kept %).',
      NEW.played_on, cutoff
      USING ERRCODE = 'DH001',
            HINT = 'Delete an older score first, or pick a more recent date.';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.scores_reject_outside_latest_five() IS
  'Before insert/update: raises DH001 when played_on would fall outside the user''s latest five, instead of letting the retention trim delete the new row.';

DROP TRIGGER IF EXISTS scores_reject_outside_latest_five_trigger ON public.scores;
CREATE TRIGGER scores_reject_outside_latest_five_trigger
  BEFORE INSERT OR UPDATE OF user_id, played_on ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.scores_reject_outside_latest_five();

-- Retention trim also runs when an update moves a row to another user or date
-- (a no-op for normal edits, which never change the row count).
DROP TRIGGER IF EXISTS scores_enforce_latest_five_trigger ON public.scores;
CREATE TRIGGER scores_enforce_latest_five_trigger
  AFTER INSERT OR UPDATE OF user_id, played_on ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION public.scores_enforce_latest_five();
```

`supabase/migrations/20261007140000_winner_proof_storage.sql` lines 70–117:

```sql
-- ---------------------------------------------------------------------------
-- Winners: members may only upload proof; verification/payment = admin only
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.winners_guard_member_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.user_id = auth.uid() THEN
    IF NEW.verification IS DISTINCT FROM OLD.verification
      OR NEW.payment IS DISTINCT FROM OLD.payment
      OR NEW.prize_amount IS DISTINCT FROM OLD.prize_amount
      OR NEW.tier IS DISTINCT FROM OLD.tier
      OR NEW.draw_id IS DISTINCT FROM OLD.draw_id
      OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Only admins can change verification or payment fields';
    END IF;

    IF NEW.proof_url IS DISTINCT FROM OLD.proof_url THEN
      IF OLD.verification = 'approved' THEN
        RAISE EXCEPTION 'Cannot replace proof after approval';
      END IF;
      IF OLD.verification NOT IN ('pending', 'rejected') THEN
        RAISE EXCEPTION 'Proof cannot be updated in the current state';
      END IF;
      -- Re-submit after rejection returns to pending review.
      IF OLD.verification = 'rejected' THEN
        NEW.verification := 'pending';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS winners_guard_member_update_trigger ON public.winners;

CREATE TRIGGER winners_guard_member_update_trigger
  BEFORE UPDATE ON public.winners
  FOR EACH ROW
  EXECUTE FUNCTION public.winners_guard_member_update();
```

[UNVERIFIED — not executed against a database] Both `profiles_guard_role()` and `winners_guard_member_update()` call `is_admin()`, which reads `auth.uid()`. A service-role request carries no user, so `is_admin()` is false there. For `profiles_guard_role` this means a service-role UPDATE that changes `role` raises 'Only admins can change profile roles'. `scripts/seed.ts:224` says the same ("upserting admin hits profiles_guard_role") and works around it with delete + insert. `updateAdminProfileAction` (`lib/admin/users-actions.ts:54-62`) changes `role` through the service-role client, so a role change from the admin Users panel would hit this exception. For `winners_guard_member_update`, a service-role UPDATE passes, because `OLD.user_id = auth.uid()` is NULL, not true.

## 3d. SQL functions

| function | SECURITY | language / volatility | EXECUTE granted to |
|---|---|---|---|
| is_admin() | **DEFINER** | sql STABLE | default (PUBLIC) |
| profiles_guard_role() | **DEFINER** | plpgsql trigger | trigger |
| handle_new_user() | **DEFINER** | plpgsql trigger | trigger |
| scores_enforce_latest_five() | **DEFINER** | plpgsql trigger | trigger |
| scores_reject_outside_latest_five() | **DEFINER** | plpgsql trigger | trigger |
| winners_guard_member_update() | **DEFINER** | plpgsql trigger | trigger |
| has_active_subscription(uid uuid) | **DEFINER** | sql STABLE | default (PUBLIC) |
| admin_list_users(...) | **DEFINER** | sql STABLE | service_role only (REVOKE from PUBLIC, anon, authenticated) |
| admin_list_winners(...) | **DEFINER** (was INVOKER in 20261009120000) | sql STABLE | authenticated, service_role (REVOKE from PUBLIC, anon); filters on `public.is_admin()` internally |
| platform_totals() | **DEFINER** | sql STABLE | service_role only |
| admin_member_labels(p_user_ids uuid[]) | **DEFINER** | sql STABLE | service_role only |
| admin_charity_breakdown() | **DEFINER** | sql STABLE | service_role only |

**NOT FOUND:** no SQL "sync" or "publish" helpers exist. `sync_draw_entries(draw_id)` and `publish_draw(draw_id)` are only proposed in `DECISIONS.md` ("Migration path"); draw sync and publish run in TypeScript (`lib/draw/sync-entry.ts`, `lib/draw/admin-actions.ts`).

Trigger function bodies are in 3c. The rest, verbatim:

`supabase/migrations/20261007120000_initial_schema.sql` lines 30–47:

```sql
-- Returns true when the current JWT user is an admin (used in RLS policies).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'Security definer helper for RLS: true when auth.uid() has profiles.role = admin.';
```

`has_active_subscription` — **final** version (20261009160000):

`supabase/migrations/20261009160000_subscription_renewal_grace.sql` lines 1–47:

```sql
-- has_active_subscription: an 'active' row lapses 3 days after renewal_date.
--
-- Previously 'active' without cancel_at_period_end granted access forever, so
-- a renewal webhook that never arrived (or any mock-mode subscription) kept
-- access open indefinitely. Razorpay's subscription.charged moves renewal_date
-- forward each cycle; the 3-day grace covers a late webhook. A null
-- renewal_date (e.g. an admin-created row) still grants access.
--
-- Mirrors subscriptionGrantsAccess / RENEWAL_GRACE_DAYS in
-- lib/subscription/grants.ts — change both together.

CREATE OR REPLACE FUNCTION public.has_active_subscription(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT CASE
        WHEN s.status = 'active'
          AND NOT COALESCE(s.cancel_at_period_end, false)
          AND (s.renewal_date IS NULL OR s.renewal_date >= CURRENT_DATE - 3)
          THEN true
        WHEN s.status = 'active'
          AND COALESCE(s.cancel_at_period_end, false)
          AND s.renewal_date IS NOT NULL
          AND s.renewal_date >= CURRENT_DATE
          THEN true
        WHEN s.status = 'cancelled'
          AND s.renewal_date IS NOT NULL
          AND s.renewal_date >= CURRENT_DATE
          THEN true
        ELSE false
      END
      FROM public.subscriptions s
      WHERE s.user_id = uid
      ORDER BY s.created_at DESC
      LIMIT 1
    ),
    false
  );
$$;

COMMENT ON FUNCTION public.has_active_subscription(uuid) IS
  'True when the latest subscription grants product access: active (until 3 days past renewal_date), or cancel-at-period-end / cancelled until renewal_date.';
```

Earlier versions, both superseded. First (20261007170000) — `active` → true; `cancelled` with `renewal_date >= CURRENT_DATE` → true:

`supabase/migrations/20261007170000_has_active_subscription_rls.sql` lines 3–27:

```sql
CREATE OR REPLACE FUNCTION public.has_active_subscription(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT CASE
        WHEN s.status = 'active' THEN true
        WHEN s.status = 'cancelled'
          AND s.renewal_date IS NOT NULL
          AND s.renewal_date >= CURRENT_DATE
          THEN true
        ELSE false
      END
      FROM public.subscriptions s
      WHERE s.user_id = uid
      ORDER BY s.created_at DESC
      LIMIT 1
    ),
    false
  );
$$;
```

Second (20261008130000) — adds `cancel_at_period_end`; `active` without the flag is true with no date limit:

`supabase/migrations/20261008130000_subscription_cancel_at_period_end.sql` lines 9–40:

```sql
CREATE OR REPLACE FUNCTION public.has_active_subscription(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT CASE
        WHEN s.status = 'active'
          AND NOT COALESCE(s.cancel_at_period_end, false)
          THEN true
        WHEN s.status = 'active'
          AND COALESCE(s.cancel_at_period_end, false)
          AND s.renewal_date IS NOT NULL
          AND s.renewal_date >= CURRENT_DATE
          THEN true
        WHEN s.status = 'cancelled'
          AND s.renewal_date IS NOT NULL
          AND s.renewal_date >= CURRENT_DATE
          THEN true
        ELSE false
      END
      FROM public.subscriptions s
      WHERE s.user_id = uid
      ORDER BY s.created_at DESC
      LIMIT 1
    ),
    false
  );
$$;
```

`admin_list_users`:

`supabase/migrations/20261009120000_admin_pagination_and_indexes.sql` lines 27–131:

```sql
-- ---------------------------------------------------------------------------
-- admin_list_users: one page of the admin Users table
-- ---------------------------------------------------------------------------
-- Emails live in auth.users, which PostgREST cannot join, so search, filter,
-- sort and paging all happen here. Returns {"total": n, "rows": [...]}.
-- Service role only: it reads auth.users and bypasses RLS.

CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search text DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_access text DEFAULT NULL,
  p_sort text DEFAULT 'joined',
  p_dir text DEFAULT 'desc',
  p_limit integer DEFAULT 25,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH pattern AS (
    SELECT CASE
      WHEN NULLIF(btrim(p_search), '') IS NULL THEN NULL
      ELSE '%' || replace(replace(replace(btrim(p_search), '\', '\\'), '%', '\%'), '_', '\_') || '%'
    END AS value
  ),
  members AS (
    SELECT
      p.id,
      u.email::text AS email,
      p.display_name,
      p.role,
      p.created_at,
      s.plan,
      s.status,
      s.renewal_date,
      COALESCE(s.cancel_at_period_end, false) AS cancel_at_period_end,
      public.has_active_subscription(p.id) AS has_access,
      (SELECT count(*)::int FROM public.scores sc WHERE sc.user_id = p.id) AS score_count
    FROM public.profiles p
    CROSS JOIN pattern
    LEFT JOIN auth.users u ON u.id = p.id
    LEFT JOIN LATERAL (
      SELECT sub.plan, sub.status, sub.renewal_date, sub.cancel_at_period_end
      FROM public.subscriptions sub
      WHERE sub.user_id = p.id
      ORDER BY sub.created_at DESC
      LIMIT 1
    ) s ON true
    WHERE (p_role IS NULL OR p.role = p_role)
      AND (
        pattern.value IS NULL
        OR u.email ILIKE pattern.value
        OR p.display_name ILIKE pattern.value
      )
  ),
  filtered AS (
    SELECT *
    FROM members
    WHERE p_access IS NULL OR has_access = (p_access = 'active')
  ),
  page AS (
    SELECT
      f.*,
      row_number() OVER (
        ORDER BY
          CASE WHEN p_sort = 'email' AND p_dir = 'asc' THEN lower(f.email) END ASC NULLS LAST,
          CASE WHEN p_sort = 'email' AND p_dir = 'desc' THEN lower(f.email) END DESC NULLS LAST,
          CASE WHEN p_sort = 'name' AND p_dir = 'asc' THEN lower(f.display_name) END ASC NULLS LAST,
          CASE WHEN p_sort = 'name' AND p_dir = 'desc' THEN lower(f.display_name) END DESC NULLS LAST,
          CASE WHEN p_sort = 'role' AND p_dir = 'asc' THEN f.role END ASC,
          CASE WHEN p_sort = 'role' AND p_dir = 'desc' THEN f.role END DESC,
          CASE WHEN p_sort = 'access' AND p_dir = 'asc' THEN f.has_access END ASC,
          CASE WHEN p_sort = 'access' AND p_dir = 'desc' THEN f.has_access END DESC,
          CASE WHEN p_sort = 'plan' AND p_dir = 'asc' THEN f.plan END ASC NULLS LAST,
          CASE WHEN p_sort = 'plan' AND p_dir = 'desc' THEN f.plan END DESC NULLS LAST,
          CASE WHEN p_sort = 'scores' AND p_dir = 'asc' THEN f.score_count END ASC,
          CASE WHEN p_sort = 'scores' AND p_dir = 'desc' THEN f.score_count END DESC,
          CASE WHEN p_sort = 'joined' AND p_dir = 'asc' THEN f.created_at END ASC,
          f.created_at DESC,
          f.id
      ) AS ord
    FROM filtered f
    ORDER BY ord
    LIMIT LEAST(GREATEST(p_limit, 1), 100)
    OFFSET GREATEST(p_offset, 0)
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM filtered),
    'rows', COALESCE(
      (SELECT jsonb_agg(to_jsonb(page) - 'ord' ORDER BY ord) FROM page),
      '[]'::jsonb
    )
  );
$$;

COMMENT ON FUNCTION public.admin_list_users(text, text, text, text, text, integer, integer) IS
  'Admin Users table: one page of members with email, latest subscription, access and score count. Service role only.';

REVOKE ALL ON FUNCTION public.admin_list_users(text, text, text, text, text, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, text, text, text, text, integer, integer)
  TO service_role;
```

`admin_list_winners` — **final** version (20261009140000). The superseded version (20261009120000, lines 139–225) is identical in shape but `SECURITY INVOKER`, has no `public.is_admin()` filter, does not join `profiles`/`auth.users` (no member_name/member_email), searches only `user_id::text` and `month::text`, and sorts 'member' by `f.user_id::text`.

`supabase/migrations/20261009140000_admin_winner_member_labels.sql` lines 1–136:

```sql
-- Admin winners table and draw preview: show who won, not a UUID prefix.
--
-- Emails live in auth.users, which the admin's own session cannot read, so
-- admin_list_winners becomes SECURITY DEFINER. That bypasses RLS, so the
-- function now checks is_admin() itself and returns nothing to anyone else.
-- Search also matches name and email, and the 'member' sort orders by the
-- name shown (display name, then email) instead of the hidden user id.

CREATE OR REPLACE FUNCTION public.admin_list_winners(
  p_search text DEFAULT NULL,
  p_verification text DEFAULT NULL,
  p_payment text DEFAULT NULL,
  p_sort text DEFAULT 'created',
  p_dir text DEFAULT 'desc',
  p_limit integer DEFAULT 25,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH pattern AS (
    SELECT CASE
      WHEN NULLIF(btrim(p_search), '') IS NULL THEN NULL
      ELSE '%' || replace(replace(replace(btrim(p_search), '\', '\\'), '%', '\%'), '_', '\_') || '%'
    END AS value
  ),
  filtered AS (
    SELECT
      w.id,
      w.draw_id,
      w.user_id,
      w.tier,
      w.prize_amount,
      w.proof_url,
      w.verification,
      w.payment,
      w.created_at,
      w.updated_at,
      d.month AS draw_month,
      p.display_name AS member_name,
      u.email::text AS member_email
    FROM public.winners w
    CROSS JOIN pattern
    LEFT JOIN public.draws d ON d.id = w.draw_id
    LEFT JOIN public.profiles p ON p.id = w.user_id
    LEFT JOIN auth.users u ON u.id = w.user_id
    WHERE public.is_admin()
      AND (p_verification IS NULL OR w.verification = p_verification)
      AND (p_payment IS NULL OR w.payment = p_payment)
      AND (
        pattern.value IS NULL
        OR w.user_id::text ILIKE pattern.value
        OR d.month::text ILIKE pattern.value
        OR p.display_name ILIKE pattern.value
        OR u.email ILIKE pattern.value
      )
  ),
  page AS (
    SELECT
      f.*,
      row_number() OVER (
        ORDER BY
          CASE WHEN p_sort = 'draw' AND p_dir = 'asc' THEN f.draw_month END ASC NULLS LAST,
          CASE WHEN p_sort = 'draw' AND p_dir = 'desc' THEN f.draw_month END DESC NULLS LAST,
          CASE WHEN p_sort = 'tier' AND p_dir = 'asc' THEN f.tier END ASC,
          CASE WHEN p_sort = 'tier' AND p_dir = 'desc' THEN f.tier END DESC,
          CASE WHEN p_sort = 'amount' AND p_dir = 'asc' THEN f.prize_amount END ASC,
          CASE WHEN p_sort = 'amount' AND p_dir = 'desc' THEN f.prize_amount END DESC,
          CASE WHEN p_sort = 'member' AND p_dir = 'asc'
            THEN lower(COALESCE(f.member_name, f.member_email)) END ASC NULLS LAST,
          CASE WHEN p_sort = 'member' AND p_dir = 'desc'
            THEN lower(COALESCE(f.member_name, f.member_email)) END DESC NULLS LAST,
          CASE WHEN p_sort = 'verification' AND p_dir = 'asc' THEN f.verification END ASC,
          CASE WHEN p_sort = 'verification' AND p_dir = 'desc' THEN f.verification END DESC,
          CASE WHEN p_sort = 'payment' AND p_dir = 'asc' THEN f.payment END ASC,
          CASE WHEN p_sort = 'payment' AND p_dir = 'desc' THEN f.payment END DESC,
          CASE WHEN p_sort = 'created' AND p_dir = 'asc' THEN f.created_at END ASC,
          f.created_at DESC,
          f.id
      ) AS ord
    FROM filtered f
    ORDER BY ord
    LIMIT LEAST(GREATEST(p_limit, 1), 100)
    OFFSET GREATEST(p_offset, 0)
  )
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM filtered),
    'rows', COALESCE(
      (SELECT jsonb_agg(to_jsonb(page) - 'ord' ORDER BY ord) FROM page),
      '[]'::jsonb
    )
  );
$$;

COMMENT ON FUNCTION public.admin_list_winners(text, text, text, text, text, integer, integer) IS
  'Admin Winners table: one page of winners with draw month, member name and email. Admins only (checked inside; reads auth.users).';

REVOKE ALL ON FUNCTION public.admin_list_winners(text, text, text, text, text, integer, integer)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_winners(text, text, text, text, text, integer, integer)
  TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- admin_member_labels: display name + email for a set of user ids
-- ---------------------------------------------------------------------------
-- Used by the draw simulation preview. Ids travel in the request body, so a
-- long winner list can't overflow the URL the way an .in() filter would.

CREATE OR REPLACE FUNCTION public.admin_member_labels(p_user_ids uuid[])
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(jsonb_build_object(
      'id', p.id,
      'display_name', p.display_name,
      'email', u.email::text
    )),
    '[]'::jsonb
  )
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE p.id = ANY (p_user_ids);
$$;

COMMENT ON FUNCTION public.admin_member_labels(uuid[]) IS
  'Display name and email for the given user ids (draw preview). Service role only.';

REVOKE ALL ON FUNCTION public.admin_member_labels(uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_member_labels(uuid[]) TO service_role;
```

`platform_totals`:

`supabase/migrations/20261009120000_admin_pagination_and_indexes.sql` lines 227–262:

```sql
-- ---------------------------------------------------------------------------
-- platform_totals: sums for admin reports and the homepage
-- ---------------------------------------------------------------------------
-- Replaces reading whole tables into Node to add them up, which also broke
-- silently past the API's per-request row limit.

CREATE OR REPLACE FUNCTION public.platform_totals()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'donation_total_paise', (
      SELECT COALESCE(sum(amount_cents), 0)
      FROM public.donations
      WHERE status = 'succeeded' AND currency = 'inr'
    ),
    'charity_percentage_sum', (
      SELECT COALESCE(sum(percentage), 0) FROM public.user_charity
    ),
    'prize_paid', (
      SELECT COALESCE(sum(prize_amount), 0) FROM public.winners WHERE payment = 'paid'
    ),
    'prize_pending', (
      SELECT COALESCE(sum(prize_amount), 0) FROM public.winners WHERE payment <> 'paid'
    )
  );
$$;

COMMENT ON FUNCTION public.platform_totals() IS
  'Donation, charity-commitment and prize sums for reports and homepage stats. Service role only.';

REVOKE ALL ON FUNCTION public.platform_totals() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.platform_totals() TO service_role;
```

`admin_charity_breakdown`:

`supabase/migrations/20261009150000_admin_charity_breakdown.sql` lines 1–55:

```sql
-- admin_charity_breakdown: per-charity figures for the admin Reports page.
--
-- Two numbers per charity that must not be added together:
--   * active_percentage_sum: sum of charity percentages over members whose
--     subscription currently grants access (has_active_subscription). The app
--     multiplies by the monthly fee to get a per-month commitment. Lapsed and
--     never-paid members are excluded: they aren't paying anything in.
--   * donation_paise: cumulative succeeded INR one-off donations.
-- One row per charity, including charities with no supporters or donations.
-- Service role only.

CREATE OR REPLACE FUNCTION public.admin_charity_breakdown()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'charity_id', c.id,
        'name', c.name,
        'slug', c.slug,
        'active_supporters', COALESCE(sup.active_supporters, 0),
        'active_percentage_sum', COALESCE(sup.active_percentage_sum, 0),
        'donation_paise', COALESCE(don.donation_paise, 0)
      )
      ORDER BY c.name
    ),
    '[]'::jsonb
  )
  FROM public.charities c
  LEFT JOIN (
    SELECT
      uc.charity_id,
      count(*)::int AS active_supporters,
      sum(uc.percentage) AS active_percentage_sum
    FROM public.user_charity uc
    WHERE public.has_active_subscription(uc.user_id)
    GROUP BY uc.charity_id
  ) sup ON sup.charity_id = c.id
  LEFT JOIN (
    SELECT d.charity_id, sum(d.amount_cents)::bigint AS donation_paise
    FROM public.donations d
    WHERE d.status = 'succeeded' AND d.currency = 'inr'
    GROUP BY d.charity_id
  ) don ON don.charity_id = c.id;
$$;

COMMENT ON FUNCTION public.admin_charity_breakdown() IS
  'Per-charity active-subscriber commitment (percentage sum) and cumulative INR donations for admin reports. Service role only.';

REVOKE ALL ON FUNCTION public.admin_charity_breakdown() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_charity_breakdown() TO service_role;
```

## 3e. Migration changelog

1. `20261007120000_initial_schema.sql` — profiles, subscriptions, charities, charity_events, user_charity, donations, scores, draws, draw_entries, winners; is_admin(), role guard trigger, signup profile trigger, AFTER INSERT latest-five trim; RLS on all tables; grants.
2. `20261007130000_signup_charity_metadata.sql` — handle_new_user() also creates user_charity from signup metadata (percentage floored at 10).
3. `20261007140000_winner_proof_storage.sql` — private `winner-proofs` bucket, storage RLS by owner folder, winners_guard_member_update trigger.
4. `20261007150000_stripe_webhook_events.sql` — stripe_webhook_events idempotency table (service role only).
5. `20261007160000_contact_and_deletion_requests.sql` — contact_messages and account_deletion_requests with RLS.
6. `20261007170000_has_active_subscription_rls.sql` — has_active_subscription(uid); scores and draw_entries insert/update policies require an active subscription.
7. `20261007180000_subscription_past_due_status.sql` — adds 'past_due' to subscriptions_status_check.
8. `20261008120000_charity_category.sql` — charities.category + partial index.
9. `20261008130000_subscription_cancel_at_period_end.sql` — subscriptions.cancel_at_period_end; has_active_subscription honours it.
10. `20261008140000_rename_stripe_webhook_events.sql` — rename to payment_webhook_events; stripe_* columns → external_* / payment_intent_id; unique constraint renamed.
11. `20261008150000_donations_currency_inr.sql` — donations.currency default 'inr' (legacy 'gbp' rows left as is).
12. `20261008160000_scores_reject_outside_latest_five.sql` — BEFORE trigger raising DH001 with per-user advisory lock; trim trigger also fires on UPDATE OF user_id, played_on.
13. `20261009120000_admin_pagination_and_indexes.sql` — subscriptions (user_id, created_at DESC) index (drops user_id index), user_charity(charity_id) and contact_messages indexes; admin_list_users, admin_list_winners (INVOKER), platform_totals.
14. `20261009130000_donations_insert_pending_only.sql` — members may insert donations only with status 'pending'.
15. `20261009140000_admin_winner_member_labels.sql` — admin_list_winners becomes DEFINER with an is_admin() filter and member name/email; admin_member_labels(uuid[]).
16. `20261009150000_admin_charity_breakdown.sql` — admin_charity_breakdown() per-charity active % sum and INR donations.
17. `20261009160000_subscription_renewal_grace.sql` — has_active_subscription: an 'active' row lapses 3 days after renewal_date (NULL renewal_date still grants access).

=== SECTION 4: SERVER ACTIONS INVENTORY ===

15 files contain `"use server"`, all under `lib/` (none in `app/`). The 7 files named `actions.ts` are among them; the other 8 are `*-actions.ts`. "service role" = writes via `createAdminClient()` (bypasses RLS). "session" = writes via the user's cookie client (RLS applies).

| file | function | writes | auth guard | Zod schema |
|---|---|---|---|---|
| lib/admin/charities-actions.ts | saveCharityAction | charities insert/update (service role) | requireAdmin | charityFormSchema |
| lib/admin/charities-actions.ts | deleteCharityAction | charities delete (service role) | requireAdmin | charityDeleteSchema |
| lib/admin/users-actions.ts | fetchAdminUserScoresAction | none (reads scores, service role) | requireAdmin | **NONE** (only `if (!userId)`) |
| lib/admin/users-actions.ts | updateAdminProfileAction | profiles display_name, role (service role) | requireAdmin | adminProfileSchema |
| lib/admin/users-actions.ts | updateAdminSubscriptionAction | subscriptions update or insert (service role) | requireAdmin | adminSubscriptionSchema |
| lib/admin/users-actions.ts | saveAdminScoreAction | scores insert/update (service role) | requireAdmin | adminScoreSchema |
| lib/admin/users-actions.ts | deleteAdminScoreAction | scores delete (service role) | requireAdmin | adminScoreDeleteSchema |
| lib/auth/actions.ts | signInAction | auth session cookies | NONE (public by design) | signInSchema |
| lib/auth/actions.ts | signUpAction | auth.users via `auth.signUp` (trigger creates profiles + user_charity); user_charity upsert (session) when a session comes back | NONE (public by design) | signUpSchema |
| lib/auth/actions.ts | signOutAction | auth sign-out | NONE | NONE (no input) |
| lib/auth/password-actions.ts | forgotPasswordAction | sends reset email | NONE (public by design) | forgotPasswordSchema |
| lib/auth/password-actions.ts | resetPasswordAction | auth.updateUser password | **NONE** (no requireUser; depends on the recovery-link session cookie) | resetPasswordSchema |
| lib/auth/password-actions.ts | changePasswordAction | auth.updateUser password | requireUser | changePasswordSchema |
| lib/charity/actions.ts | updateCharityPercentageAction | user_charity.percentage (session) | requireUser | charityPercentageSchema |
| lib/contact/actions.ts | submitContactMessageAction | contact_messages insert (session/anon) | NONE (public by design) | contactSchema (defined inline) |
| lib/contact/admin-actions.ts | markContactMessageResolvedAction | contact_messages.resolved (service role) | requireAdmin | **NONE** (`messageId: string` used as is) |
| lib/draw/admin-actions.ts | runSimulationAction | draw_entries upsert/delete via sync; draws status/mode/winning_numbers (service role) | requireAdmin | **NONE** (`{drawId, mode}` is TS-typed only) |
| lib/draw/admin-actions.ts | createDraftDrawAction | draws insert (service role) | requireAdmin | drawCreateSchema |
| lib/draw/admin-actions.ts | publishDrawAction | draw_entries sync; winners delete + insert; draws status; next month's draw update or insert (service role) | requireAdmin | **NONE** (`{drawId}` TS-typed only) |
| lib/payments/actions.ts | createSubscriptionCheckoutAction | Razorpay subscription (external API); in mock mode, subscriptions upsert as active (service role) | requireUser | checkoutPlanSchema |
| lib/payments/actions.ts | cancelSubscriptionAction | Razorpay cancel; subscriptions.cancel_at_period_end (service role) | requireUser | NONE (no input) |
| lib/payments/actions.ts | resumeSubscriptionAction | Razorpay resume; subscriptions.cancel_at_period_end (service role) | requireUser | NONE (no input) |
| lib/payments/donation-actions.ts | createDonationCheckoutAction | donations insert 'pending' (session); in mock mode donations → 'succeeded' (service role); Razorpay order (external) | requireUser | donationCheckoutSchema |
| lib/profile/actions.ts | updateDisplayNameAction | profiles.display_name (session) | requireUser | displayNameSchema |
| lib/profile/actions.ts | updateProfileCharityAction | user_charity upsert (session) | requireUser | profileCharitySchema |
| lib/profile/deletion-actions.ts | requestAccountDeletionAction | account_deletion_requests upsert (session) | requireUser | NONE (no input) |
| lib/scores/actions.ts | saveScoreAction | scores insert/update (session); draw_entries via syncUserDrawEntryForCurrentMonth (service role) | requireActiveSubscription | scoreFormSchema |
| lib/scores/actions.ts | deleteScoreAction | scores delete (session); draw_entries sync (service role) | requireActiveSubscription | scoreIdSchema |
| lib/winners/actions.ts | uploadWinnerProofAction | storage upload/remove in winner-proofs; winners.proof_url (session) | requireUser | winnerIdSchema (+ manual size/MIME checks) |
| lib/winners/actions.ts | getWinnerProofSignedUrlAction | none (signed URL) | inline `auth.getUser()` check, not requireUser | winnerIdSchema |
| lib/winners/admin-actions.ts | approveWinnerAction | winners.verification = 'approved' (admin's session, RLS) | requireAdmin (inside getWinnerForAdmin) | winnerIdSchema |
| lib/winners/admin-actions.ts | rejectWinnerAction | winners.verification = 'rejected' (admin's session) | requireAdmin | winnerIdSchema |
| lib/winners/admin-actions.ts | markWinnerPaidAction | winners.payment = 'paid' (admin's session) | requireAdmin | winnerIdSchema |

**Flagged write paths**
- No guard: `resetPasswordAction` (lib/auth/password-actions.ts:60). It relies on Supabase's own session check in `auth.updateUser`. The public-by-design actions (sign in/up, forgot password, contact form) are listed above and not counted as gaps.
- No Zod validation on writes: `runSimulationAction` and `publishDrawAction` (lib/draw/admin-actions.ts:288, 311), `markContactMessageResolvedAction` (lib/contact/admin-actions.ts:11). All three are behind `requireAdmin`. For `runSimulationAction`, any `mode` other than `"algorithmic"` runs the random generator (lib/draw/simulate.ts:25-28) and is then written to `draws.mode`, where `draws_mode_check` rejects values outside ('random','algorithmic').
- Mock mode: with `PAYMENT_PROVIDER=mock`, any logged-in user calling `createSubscriptionCheckoutAction` gets an active subscription row with no payment (lib/payments/mock-provider.ts:17-37). This is by design for demos.
- Not server actions, but write: `app/api/payments/webhook/route.ts` (POST, service role) and `app/auth/callback/route.ts` (GET, `exchangeCodeForSession` sets auth cookies).

=== SECTION 5: SERVICE-ROLE USAGE ===

The key is read in one place, `lib/supabase/admin.ts:7` (`createAdminClient`), and in `scripts/seed.ts:746` (CLI only). `lib/config/env.ts:5`, `lib/home/stats.ts:35` and `lib/winners/public-queries.ts:14` only check that it is set.

**Client reachability.** A script traced every `"use client"` file's import graph (97 files). No client file reaches `lib/supabase/admin.ts` except through a `"use server"` module. Next.js replaces those with RPC references in the client bundle (examples: `components/admin/admin-draws-panel.tsx → lib/draw/admin-actions.ts`, `components/scores/scores-panel.tsx → lib/scores/actions.ts → lib/draw/sync-entry.ts`, `components/charity/donation-form.tsx → lib/payments/donation-actions.ts`). The repo does not use the `server-only` package anywhere, so nothing fails the build if a client file imports one of these modules directly. The env var has no `NEXT_PUBLIC_` prefix.

| # | file : line | function | why it appears to need elevated rights | caller / reachable from client? |
|---|---|---|---|---|
| 1 | lib/payments/webhook-handler.ts:133 | handlePaymentWebhook | inserts into `payment_webhook_events` (RLS on, no policies); no user session in a webhook | webhook route only; no |
| 2 | lib/payments/webhook-handler.ts:116 | processRazorpayEvent (`payment.captured`) | donations UPDATE is admin-only under RLS | webhook route only; no |
| 3 | lib/payments/subscription-store.ts:22, 64, 88, 105 | upsertSubscriptionRow, updateSubscriptionStatusByExternalId, markSubscriptionCancelAtPeriodEnd, clearSubscriptionCancelAtPeriodEnd | subscriptions INSERT/UPDATE are admin-only under RLS | webhook handler, mock provider, razorpay provider cancel/resume; client only via `lib/payments/actions.ts` ("use server") |
| 4 | lib/payments/donation-actions.ts:34 | markDonationSucceeded (mock mode) | members may not set status 'succeeded' (20261009130000) | via "use server" only |
| 5 | lib/draw/sync-entry.ts:119 | syncUserDrawEntryForCurrentMonth | draft/simulated draws are hidden from members by `draws_select_published_or_admin`; comment at lines 112-114 says so | via `lib/scores/actions.ts` ("use server") |
| 6 | lib/draw/admin-actions.ts:76, 147, 167 | runSimulation, createDraftDraw, publishDraw | reads every member's subscriptions/scores, writes draws/winners. [UNVERIFIED rationale] An admin session would pass `is_admin()` policies too; the code does not say why service role is used here | via "use server" + requireAdmin |
| 7 | lib/admin/charities-actions.ts:41, 80 | saveCharity, deleteCharity | charities writes (admin-only policies would also allow an admin session) | via "use server" + requireAdmin |
| 8 | lib/admin/users-actions.ts:54, 80, 126, 195 | updateAdminProfile, updateAdminSubscription, saveAdminScore, deleteAdminScore | writes other users' rows; see 3c note on profiles_guard_role | via "use server" + requireAdmin |
| 9 | lib/contact/admin-actions.ts:17 | markContactMessageResolvedAction | contact_messages update | via "use server" + requireAdmin |
| 10 | lib/admin/queries.ts:82-83 (`admin()`) | listAdminUsersPage (rpc admin_list_users), listAdminUserScores, listAdminDraws, getDrawSimulationPreview, listAdminCharities, getAdminReports (rpc admin_charity_breakdown, platform_totals) | `admin_list_users`, `admin_charity_breakdown`, `platform_totals` are EXECUTE-granted to service_role only; admin_list_users reads auth.users | admin pages (server components, each calls requireAdmin); no |
| 11 | lib/admin/overview.ts:27, 92 | getAdminOverviewStats, getAdminRecentActivity | cross-user counts | app/(app)/admin/page.tsx; no |
| 12 | lib/contact/admin-queries.ts:28, 77 | listContactMessagesAdminPage, countUnreadContactMessages | contact_messages reads | admin pages / overview; no |
| 13 | lib/admin/member-labels.ts:21 | loadMemberLabels (receives client) | `admin_member_labels` is service_role only and reads auth.users | called with the service-role client from runSimulation (`withMemberLabels(admin, …)`); no |
| 14 | lib/dashboard/queries.ts:102 | getDashboardParticipation | member dashboard shows the upcoming draft draw's month/status, hidden by RLS; selects only `month, status` (comment lines 99-100) | app/(app)/dashboard/page.tsx; no |
| 15 | lib/home/stats.ts:37 | getHomeStats | public homepage totals: platform_totals (service-role only), all user_charity and subscriptions rows | marketing pages (no login); no |
| 16 | lib/winners/public-queries.ts:19 | listPublicWinners | public winners page; winners/profiles RLS is own-row only. Names are masked with maskWinnerName | app/(marketing)/winners/page.tsx (no login); no |
| 17 | scripts/seed.ts:746 | (seed main) | creates auth users, profiles, draws | CLI; no |

=== SECTION 6: TESTS ===

Vitest, `environment: "node"`, `include: ["**/*.test.ts"]`. Ran `npx vitest run` on 2026-10-11: **22 files, 92 tests, all passed.** (`DECISIONS.md` line 83 says "89 tests in 22 files".)

| test file | tests | covers |
|---|---|---|
| lib/admin/pagination.test.ts | 12 | admin table URL state: page parsing, filters/sort allow-list, search cap, offsets, search-term quoting |
| lib/auth/safe-redirect.test.ts | 4 | open-redirect sanitising (protocol-relative, absolute, backslash/encoded bypasses) |
| lib/charity/contribution.test.ts | 4 | 10% floor, amount from fee × %, clamping, rounding |
| lib/draw/db.test.ts | 2 | latest subscription row per user; lapsed-latest excludes the user |
| lib/draw/match.test.ts | 2 | greedy one-to-one matching; tiers only for 3/4/5 |
| lib/draw/pools.test.ts | 6 | 40/35/25 split, carryover to tier 5 only, jackpot rollover, equal split |
| lib/draw/publish-outcome.test.ts | 4 | publish uses stored numbers, never regenerates; throws if not 5 numbers |
| lib/draw/random.test.ts | 4 | random: range and seeded determinism; algorithmic: favours frequent scores, falls back when empty |
| lib/draw/simulate.test.ts | 6 | end-to-end simulate/preview, tier 3/4/5 amounts, duplicate winning numbers |
| lib/draw/sync-entry.test.ts | 1 | `currentDrawMonthIso` only |
| lib/impact.test.ts | 3 | meals-impact copy math |
| lib/payments/map-razorpay-status.test.ts | 4 | active, halted→lapsed, cancelled with future end, pending→past_due |
| lib/payments/mock-provider.test.ts | 2 | mock activation with 1- and 12-month renewal (store mocked) |
| lib/payments/razorpay-provider.test.ts | 4 | yearly plan id, total_count cap 100, plan period mismatch, plan lookup failure |
| lib/payments/razorpay-signature.test.ts | 1 | a valid HMAC signature is accepted |
| lib/payments/subscription-cancel.test.ts | 2 | mock cancel/resume call the store |
| lib/payments/webhook-idempotency.test.ts | 2 | handler runs once per event id; row released when handler throws |
| lib/scores/errors.test.ts | 2 | 23505 vs DH001 mapping |
| lib/scores/rolling.test.ts | 11 | sort, keep five, same-day replace, findRetentionCutoff (older-than-five rejected, edits allowed) |
| lib/subscription/access.test.ts | 8 | subscriptionGrantsAccess incl. 3-day grace and cancel-at-period-end; access label |
| lib/supabase/fetch-all.test.ts | 4 | batched reads past the 1,000-row cap |
| lib/validations/score.test.ts | 4 | 1–45 range, ISO date, no future dates |

**Section 2 code with NO test coverage**
- `app/api/payments/webhook/route.ts` — none.
- `lib/payments/webhook-handler.ts` — none (event routing, status updates, donation completion, event-id fallback).
- `lib/payments/razorpay-provider.ts` `verifyWebhook` — only the valid-signature path. Missing header, invalid signature and length-mismatch cases are untested. `webhookEventId` fallback is untested.
- `lib/payments/subscription-store.ts` — mocked in tests, never tested itself.
- `lib/payments/razorpay-client.ts` — none.
- `lib/draw/rng.ts` — no direct tests; `createSeededRng` is used as a test helper and `randomInt` is exercised only indirectly.
- `lib/auth/session.ts` (`requireUser`, `requireAdmin`) and `requireActiveSubscription` / `getSubscriptionAccess` in `lib/subscription/access.ts` — none (only the pure `subscriptionGrantsAccess`).
- `middleware.ts`, `lib/supabase/middleware.ts` — none.
- Supabase client factories (`client.ts`, `server.ts`, `admin.ts`) — none.
- All SQL: RLS policies, the five triggers, `has_active_subscription` and the admin functions — none. `DECISIONS.md:83` confirms there is no database test harness.
- Outside Section 2, also untested: `syncUserDrawEntry` / `syncAllDrawEntriesForDraw` (lib/draw/sync-entry.ts), the `runSimulation` / `publishDraw` orchestration (lib/draw/admin-actions.ts; only the pure `computePublishDrawOutcome` is tested), and every server action.

Covered: random.ts, algorithmic.ts, match.ts, pools.ts, rolling.ts, grants.ts, contribution.ts, webhook-idempotency.ts, mock-provider.ts (partly).

=== SECTION 7: DOCS AND GAPS ===

## 7.1 DECISIONS.md (full)

~~~~markdown
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

**Testing.** Vitest unit tests cover the pure logic where a mistake costs money or trust: draw generation, matching, prize pools and carryover, publish outcome, the latest-five rule, score validation, subscription access, Razorpay status mapping and signatures, webhook idempotency, redirect sanitising, admin table URL state and batched reads. 89 tests in 22 files, all passing as of 9 October 2026. Not covered by automated tests: RLS policies and triggers (there's no database test harness in the repo; the admin list functions were checked once against all migrations in an in-memory Postgres) and end-to-end browser flows. These were checked by hand against the seeded accounts in the README.

### Scalability (our §14)

The PRD gives no target load. We sized the admin pages for 10,000 members and assessed the draw engine at 100,000 subscribers. Each area below says what we found, what we changed (migration `20261009120000_admin_pagination_and_indexes.sql`), and what is documented but not yet built.

**The limit that mattered most: 1,000 rows per request.** Supabase's API returns at most the project's "Max rows" setting (1,000 by default) per request, and it drops the rest **silently**. Every list, report and draw read that fetched a whole table was therefore *wrong*, not merely slow, once a table passed 1,000 rows. The worst case was the draw engine. With more than 1,000 entrants, simulate and publish loaded only the first 1,000 entries and subscription rows, so some members could never win and the prize pool was undercounted. This failure arrives at 1,000 members, long before 100,000, so we fixed it rather than only documenting it:
- Draw loaders (`loadDrawEntries`, `loadSubscriptionAccessRows`, `loadActiveSubscriberScores` in `lib/draw/db.ts`) now read in batches through `fetchAllRows` (`lib/supabase/fetch-all.ts`). It keeps requesting until a batch comes back empty, so it stays correct even if "Max rows" is set lower.
- The admin overview's active-subscriber count uses the same batched loader.
- Report and homepage sums come from one SQL function, `platform_totals()`, instead of reading every donation, winner and charity row into Node.
- Entry counts per draw and supporter counts per charity use PostgREST embedded counts (`draw_entries(count)`, `user_charity(count)`) instead of reading every row.

#### Indexes

| Index asked about | Status |
|---|---|
| `scores (user_id, played_on)` | Present, as `scores_user_id_played_on_idx (user_id, played_on DESC)`. Serves the dashboard and the latest-five triggers. |
| `draw_entries (draw_id)` | Present. Also the leading column of the unique `(draw_id, user_id)`, so the separate index is redundant. Left in place because it is harmless. |
| `draw_entries (user_id)` | Present. |
| `winners (draw_id)` | Present. Also redundant with the unique `(draw_id, user_id, tier)`. |
| `subscriptions (user_id)` | Present. **Replaced** with `(user_id, created_at DESC)`, which matches how every "latest subscription" lookup reads, including `has_active_subscription()`. |

**Added:**
- `user_charity (charity_id)`: a foreign key that had no index, so supporter counts and `ON DELETE RESTRICT` checks scanned the table.
- `contact_messages (created_at DESC)`, plus a partial index on unresolved messages for the filter and the unread badge.

**Full scans on tables that grow per member.**
- Fixed: the Users page read all of `profiles`, `subscriptions`, `scores` and up to 2,000 auth emails per view (see Pagination). The draws, charities and reports pages are fixed as described above.
- By design: the draw engine needs every entry, so it scans; see *Draw engine at scale*. `admin_list_users` still evaluates every member that matches the filters so it can sort them, but it returns 25 rows. That is about 20,000 index probes at 10,000 members, roughly tens of milliseconds.
- Accepted: text search uses `ILIKE '%term%'`, which a B-tree index can't serve, so it scans `contact_messages` or members. That is fine at these sizes. A `pg_trgm` GIN index is the fix if search slows down.
- Still open:
  - The public winners page loads every winner of every published draw, and then looks up profiles with an `.in()` list.
  - Homepage stats now read every `user_charity` and `subscriptions` row on each visit (batched, so correct). Both should become cached or SQL-aggregated before traffic grows.

#### Pagination

The Users, Winners and Messages admin pages are paginated on the server at **25 rows per page**. Search, filters, sort and page number live in the URL (`?q=&role=&sort=email&dir=asc&page=3`). That means a view can be shared, the back button works, and a page number past the end redirects to the last page. Search waits for a 300 ms pause in typing before it queries.
- **Users:** the `admin_list_users()` SQL function. It has to be SQL because emails live in `auth.users`, which PostgREST can't join. The function is service-role only.
- **Winners:** the `admin_list_winners()` SQL function. Sorting by draw month and searching by member ID need SQL. It runs under the caller's RLS, so it still works with an admin session alone. A Payment filter (Unpaid / Paid) was added beside Verification.
- **Messages:** a plain PostgREST query using `range()` and `count: "exact"`.

Before this change, search, filters and sort ran in the browser over whatever had been loaded. With pagination that would have searched only the visible 25 rows, so all three now run on the server. The SQL functions were checked against every migration in a real Postgres instance: paging, the total past the last page, literal `%` and `_` in search, sort order with blanks last, and that members and anonymous callers are refused.

#### Draw engine at scale

At 100,000 subscribers the in-memory matching itself is not the problem. It handles 100,000 entries of five numbers each in milliseconds and a few MB. The problems are round trips, timeouts and atomicity:
- **Entry sync** (`syncAllDrawEntriesForDraw`) makes three sequential database calls per active subscriber before each simulation. At 20–50 ms a call, that is about 1–4 hours at 100,000 members. It already exceeds a typical 60–300 s serverless timeout at a few thousand members. **This is the first thing to break.**
- **Reads** are now complete but batched: about 100 requests for entries, 100 or more for subscription history, and up to 500 for scores. That adds roughly 15–35 s per simulate, and the admin Draws page repeats the reads for its preview.
- **The algorithmic draw** transfers every score (up to 500,000 rows) just to build a 45-bucket frequency table.
- **Publish isn't atomic.** It deletes winners, inserts winners, marks the draw published and rolls the carryover forward as separate requests. A failure partway through leaves a half-published draw.

*Migration path* (SQL, not batching, because memory isn't the constraint):
1. **First, cheap:** replace the per-member sync with one statement, `sync_draw_entries(draw_id)`, an `INSERT … SELECT` of each active member's latest five scores `ON CONFLICT DO UPDATE`. Replace the algorithmic draw's score read with `SELECT score, count(*) … GROUP BY score` (45 rows). Matching can stay in tested TypeScript, reading entries in batches.
2. **Then:** move matching and publishing into one transactional `publish_draw(draw_id)`. Our greedy one-to-one match count equals the multiset intersection, `Σ over values of LEAST(count in entry, count in winning numbers)`, which is a straightforward `unnest … GROUP BY`. Tiering, the equal split, inserting winners and the carryover follow in the same transaction. The current TypeScript (`lib/draw/match.ts`, `pools.ts`) stays as the test oracle: run both on fixtures and compare.

Chunked batch processing in Node would only cut memory use, which isn't the bottleneck, and would still leave publish non-atomic.

#### RLS performance

- **`has_active_subscription(uid)`** is `LANGUAGE sql STABLE SECURITY DEFINER`.
  - Usage: it appears only in the INSERT and UPDATE policies on `scores` and `draw_entries`, always as `has_active_subscription(auth.uid())`. It is in no SELECT policy, so it never runs per row on reads. Members write one row at a time, so it costs one index lookup per write, now a single probe on the new `(user_id, created_at DESC)` index.
  - Caching: none. `STABLE` lets the planner assume the result is constant within a statement, but Postgres doesn't memoize function results, and `SECURITY DEFINER` SQL functions are never inlined.
  - Fix if needed: wrapping it as `(select public.has_active_subscription(auth.uid()))` turns it into an init-plan, evaluated once per statement. This matters only for bulk writes, which members don't do.
  - New use: `admin_list_users()` calls it once per member in order to filter and sort by access. See Indexes for the cost.
- **The real per-row function is `is_admin()`**, which every SELECT policy calls as `user_id = auth.uid() OR public.is_admin()`. When an admin reads through their session, it runs for every row scanned. Most admin reads use the service role, which bypasses RLS. The Winners page doesn't, but `winners` and `draws` are small. *Recommended (not done):* one migration rewriting the policies to `(select auth.uid())` and `(select public.is_admin())`, as Supabase advises.

#### Extensibility

All three changes below touch more than two files. Plans and prize tiers are hard-coded as literal unions and named fields rather than driven by one config.

- **A third plan tier (e.g. quarterly): about 12 files.**
  - Database: a `subscriptions_plan_check` migration.
  - Types and validation: `SubscriptionPlan` (`lib/subscription/types.ts`), `checkoutPlanSchema` (`lib/validations/subscription.ts`) and `adminSubscriptionSchema` (`lib/validations/admin.ts`).
  - Payments: the Razorpay plan-ID env lookup (`lib/payments/env.ts`), billing cycle and period mapping (`razorpay-provider.ts`), mock renewal months (`mock-provider.ts`).
  - Pricing: `lib/subscription/fees.ts` and `lib/payments/prices.ts`.
  - UI: plan pickers in `subscribe-plan-checkout.tsx`, `editorial-pricing.tsx` and `admin-users-panel.tsx`.
  - Docs: `.env.example` and the README.
  - *Better:* one `PLANS` record (id, months, env key for the Razorpay plan, fee) that the type, schemas, providers and UI all read from.
- **A new draw mode: 4 files.**
  - A `draws_mode_check` migration.
  - The `DrawMode` type and dispatch in `lib/draw/simulate.ts`.
  - A new generator module beside `random.ts` and `algorithmic.ts`.
  - The mode picker in `admin-draws-panel.tsx`.
  - *Better:* a generator registry keyed by mode, so the type and the picker derive from it. That would leave the migration plus the new module.
- **A new prize tier (e.g. 2-match): about 10 files.**
  - Database: a `winners_tier_check` migration.
  - Draw engine: `TIER_PERCENTAGES` (`lib/draw/constants.ts`, rebalanced to total 100%), `tierFromMatchCount` (`match.ts`), the named `tier5Pool`/`tier4Pool`/`tier3Pool` fields (`types.ts`) and the per-tier code in `pools.ts`.
  - Winners: the `3 | 4 | 5` union (`lib/winners/types.ts`).
  - Admin: the draw preview mapping (`lib/admin/queries.ts`) and the pool tiles (`admin-draws-panel.tsx`).
  - Public: the pool calculator and the How it works copy.
  - *Better:* make pools a `Record<PrizeTier, number>` built from `TIER_PERCENTAGES`. A new tier would then be the constant plus the migration.
- **Already one place each:**
  - Payment providers: the `PaymentProvider` interface plus provider-neutral `external_*` columns.
  - Charity categories: `lib/charity/categories.ts`.
  - Money formatting: `lib/money.ts`.
  - The fee and pool percentage: environment variables.

**Out of scope by design:** multiple currencies, multiple regions, scheduled draws (see *Draws are admin-triggered by design*) and email notifications (see below).

## Known limitations (scoped out)

- **Email notifications.** Only Supabase Auth emails (confirmation, password reset) are sent. Draw results and winner status are in-app only. *Would need:* a provider such as Resend, plus triggers on publish and on `winners` status changes.
- **Account deletion execution.** `account_deletion_requests` records `pending | reviewed | cancelled`. Nothing deletes the account. *Would need:* an admin action that calls the service-role `auth.admin.deleteUser` after resolving unpaid `winners` rows.
- **Charity events admin.** `charity_events` is read on public charity pages (`lib/charity/queries.ts`) but has no admin create/edit UI. *Would need:* CRUD in `admin-charities-panel` and admin RLS write policies.
- **Charity payout ledger.** Contributions are calculated and displayed but never disbursed or reconciled. *Would need:* a ledger table populated from Razorpay webhooks.
- **Revenue-backed prize pool.** See above. *Would need:* summing captured Razorpay payments for the month, minus charity commitments.
~~~~

## 7.2 README.md (full)

This is the working-tree version, which has uncommitted changes against HEAD. Demo-account passwords in the table are replaced with `<redacted>`.

~~~~markdown
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
| Admin | `admin@digital-heroes.test` | `<redacted>` | Published draw, winners queue in every state, draft ready to simulate, non-zero reports |
| Subscriber | `subscriber@digital-heroes.test` | `<redacted>` | Five scores at the rolling limit, entered in this month's draft, an approved and paid jackpot win, a ₹500 donation |
| No subscription | `nosub@digital-heroes.test` | `<redacted>` | Inactive dashboard, subscribe CTA, gated scores |
| Winner — proof to review | `winner.pending@digital-heroes.test` | `<redacted>` | Tier-4 prize, proof uploaded, pending review |
| Winner — awaiting proof | `winner.noproof@digital-heroes.test` | `<redacted>` | Tier-3 prize, the member upload flow |
| Winner — proof rejected | `winner.rejected@digital-heroes.test` | `<redacted>` | Tier-3 prize, the re-upload path |

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
~~~~

## 7.3 Original task / assignment / brief

**NOT FOUND.** No `TASK.md`, `ASSIGNMENT.md`, `BRIEF.md`, `requirements.*`, PDF or DOCX exists in the repo root, and there is no `/docs` directory. `PROGRESS.md:4` says: "No standalone PRD file in repo." `DECISIONS.md:67` refers to an "issued PDF" whose §13–§14 page was missing; that PDF is not in the repository.

## 7.4 TODO / FIXME / HACK comments

**NOT FOUND.** Searched `TODO|FIXME|HACK|XXX` in `app/ components/ lib/ hooks/ scripts/ supabase/ middleware.ts` and the top-level `.md` files: no matches.

=== SECTION 8: DISCREPANCIES ===

**1. "Every write is a Server Action; the browser never writes to the DB directly." — PARTLY TRUE**
- True for app code: the browser client factory `lib/supabase/client.ts:6` is never imported anywhere in `app/`, `components/`, `lib/` or `hooks/`. No client component calls `fetch` to the app or `.from(...)`. All DB writes found are in `"use server"` files (Section 4).
- Exceptions: the webhook route handler writes with the service role (`app/api/payments/webhook/route.ts:13` → `lib/payments/webhook-handler.ts:116-123`, `lib/payments/subscription-store.ts`). Signup inserts `profiles` and `user_charity` through the `on_auth_user_created` trigger (`20261007130000_signup_charity_metadata.sql:13-27`).
- Not enforced: the browser holds the anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) and the user's session cookie, so a user can call PostgREST directly. RLS then allows direct writes to their own `profiles`, `user_charity`, `scores` (with active sub), `draw_entries` (with active sub), `winners` (proof only, by trigger), pending `donations`, `account_deletion_requests` and `contact_messages` (Section 3b). "Never writes directly" describes how the app is built, not what is possible.

**2. "The only API route is the Razorpay webhook." — PARTLY TRUE**
- It is the only route under `app/api/` (`app/api/payments/webhook/route.ts`, POST).
- There is a second route handler: `app/auth/callback/route.ts:7` (`GET`), which exchanges email-confirmation / password-reset codes for a session.

**3. "RLS is the real security boundary" (RLS would still block a malicious request if requireX() guards were removed). — PARTLY TRUE**
- Holds for paths that use the session client:
  - scores: `saveScoreAction` / `deleteScoreAction` use the user's client (`lib/scores/actions.ts:110-116, 137-145, 192-196`); `scores_insert/update_own_or_admin` require `has_active_subscription(auth.uid())` (20261007170000:34-60).
  - winner verification and payment: `approveWinnerAction` and the others use the admin's session (`lib/winners/admin-actions.ts:12, 43-49`). Without `requireAdmin` a member could only update their own row, and `winners_guard_member_update` blocks changes to verification and payment (20261007140000:84-92).
  - profile and charity: `lib/profile/actions.ts:31-37, 83-91` and `lib/charity/actions.ts:41-47` are own-row only.
- Does NOT hold for any path using `createAdminClient()`, which bypasses RLS. If `requireAdmin()` were removed, nothing in the database would stop these, and server actions can be called by anyone who has the action ID:
  - `saveCharityAction` / `deleteCharityAction` (lib/admin/charities-actions.ts:41, 80)
  - `updateAdminProfileAction` (role/display_name), `updateAdminSubscriptionAction` (grant any user an active subscription), `saveAdminScoreAction`, `deleteAdminScoreAction` (lib/admin/users-actions.ts:54, 80, 126, 195)
  - `runSimulationAction`, `createDraftDrawAction`, `publishDrawAction` (lib/draw/admin-actions.ts:76, 147, 167)
  - `markContactMessageResolvedAction` (lib/contact/admin-actions.ts:17)
  - admin reads in `lib/admin/queries.ts:82-83` (incl. emails from auth.users via admin_list_users)
- Exception inside the DB: `profiles_guard_role` would still block a service-role role change, because `is_admin()` is false without a JWT (see 3c, [UNVERIFIED]). That also blocks the legitimate admin path.
- The webhook relies on HMAC verification, not RLS.

**4. "A backdated score older than all 5 on file is rejected by a BEFORE trigger with error DH001." — CONFIRMED**
- `scores_reject_outside_latest_five_trigger` is `BEFORE INSERT OR UPDATE OF user_id, played_on` (`20261008160000_scores_reject_outside_latest_five.sql:49-53`). The function raises `USING ERRCODE = 'DH001'` when `NEW.played_on < cutoff`, where cutoff is the 5th-newest of the user's other rows (lines 27-40).
- It takes a per-user `pg_advisory_xact_lock` first (line 23).
- A date equal to the cutoff is not rejected by this trigger; it falls to the unique constraint (23505) if that date already exists.
- It also applies to service-role writes (admin path).
- The app pre-checks the same rule (`lib/scores/rolling.ts:51-62` via `lib/scores/actions.ts:104-107`) and maps DH001 in `lib/scores/errors.ts:8`.

**5. "Scores are drawn 1–45 with replacement, so duplicates are possible." — CONFIRMED**
- Random mode: five independent `randomInt(STABLEFORD_MIN, STABLEFORD_MAX)` calls, comment "Duplicates are allowed" (`lib/draw/random.ts:8-17`; constants 1 and 45 at `lib/draw/constants.ts:2-3`).
- Algorithmic mode also samples with replacement, five independent `pickWeightedScore` calls (`lib/draw/algorithmic.ts:58-61`). Only values that appear in subscribers' scores can come up, unless there are no scores (fallback to random, line 53-55).
- RNG is `Math.random` (`lib/draw/rng.ts:4-6`), not a cryptographic source.
- Matching handles duplicates one-to-one (`lib/draw/match.ts:11-22`); test at `lib/draw/simulate.test.ts:127`.

**6. "Prize splits are computed in paise with remainder distributed, so totals reconcile exactly." — PARTLY TRUE**
- Within a tier, true: `splitPoolAmongWinners` converts the tier pool to integer paise, floors the equal share and gives the leftover paise one each to the first winners (`lib/draw/pools.ts:55-69`). Example: 87.50 / 3 → 29.17, 29.17, 29.16, total 8750 paise.
- Tier pools are computed in floating-point rupees and rounded independently (`roundMoney`, `lib/draw/pools.ts:9-11, 28-36`). So `tier5Pool + tier4Pool + tier3Pool` is not guaranteed to equal `totalPool`. A brute-force check of the exact formula found mismatches of ±1 paisa for non-whole-rupee pools, e.g. totalPool 0.21 → 0.08 + 0.07 + 0.05 = 0.20, and totalPool 0.14 → 0.15. With whole-rupee pools (integer fee × subscribers × 100%) no mismatch was found up to ₹20,00,000. A non-integer `DRAW_PRIZE_POOL_PERCENTAGE` or fee can produce paise pools.
- Unclaimed tier-4 and tier-3 pools are not carried over or recorded anywhere. Only the tier-5 pool rolls over (`lib/draw/pools.ts:97-98`). Paid-out totals therefore do not reconcile to `totalPool` in months without 4- or 3-match winners.
- Stored amounts are rupees in `numeric(12,2)` (`winners.prize_amount`, `draws.jackpot_carryover`), not paise (`DECISIONS.md:51` says the same).

**7. "HMAC signature verification runs BEFORE the idempotency insert." — CONFIRMED**
- `route.ts:12` calls `provider.verifyWebhook(rawBody, signature)`, which throws on a missing header or bad HMAC (`lib/payments/razorpay-provider.ts:134-141`). Only then does `route.ts:13` call `handlePaymentWebhook`, which does the insert (`lib/payments/webhook-idempotency.ts:16-19`).
- HMAC-SHA256 over the raw body text, compared with `timingSafeEqual`; a length mismatch is caught and returns false (`razorpay-provider.ts:71-85`).
- In mock mode `verifyWebhook` always throws (`lib/payments/mock-provider.ts:39-41`).
- [UNVERIFIED — depends on Razorpay's payload format, not checked against Razorpay docs in this audit] The event id comes from `body.id`, falling back to `` `${event}:${subscription id ?? payment id ?? created_at}` `` (`razorpay-provider.ts:87-94`). The route reads only `x-razorpay-signature` (`route.ts:8`), not an event-id header. If Razorpay's body has no top-level `id`, every monthly `subscription.charged` for the same subscription gets the same fallback id. Every renewal after the first would then be skipped as `"duplicate"`, `renewal_date` would stop moving, and access would lapse 3 days later (grants.ts:23-36).

**8. "If the webhook handler fails, the idempotency row is released." — CONFIRMED (with caveats)**
- `runWithWebhookIdempotency` catches a handler error, deletes the `payment_webhook_events` row and rethrows (`lib/payments/webhook-idempotency.ts:28-43`). The route then returns HTTP 400 (`route.ts:15-19`). Test: `lib/payments/webhook-idempotency.test.ts:52`.
- Caveat: if the delete itself fails, the row stays and a combined error is thrown (lines 37-41), so a retry is treated as a duplicate.
- Caveat: the handler is not transactional. Writes made before the failure are not rolled back.
- Caveat: events the handler ignores (unknown type, missing entity, missing donation_id) count as "processed" (`webhook-handler.ts:54-57, 112-115`).
- Caveat: a concurrent second delivery during processing gets 23505 → "duplicate" → HTTP 200.

**9. "The charity percentage is clamped to 10–100%." — PARTLY TRUE**
- App input is validated, not clamped. Zod rejects values outside 10–100 in `charityPercentageSchema` (`lib/validations/charity.ts:5-10`), `profileCharitySchema` (`lib/validations/profile.ts:13-19`) and `signUpSchema` (`lib/validations/auth.ts:18-21`).
- Clamping exists only in `normalizeCharityPercentage` (`lib/charity/contribution.ts:12-17`). Its only non-test caller is the display card `components/dashboard/dashboard-charity-card.tsx:61`.
- Database: `user_charity_percentage_min CHECK (percentage >= 10)` with no upper bound (`20261007120000_initial_schema.sql:163-164`). Column `numeric(5,2)` allows up to 999.99.
- `handle_new_user()` applies `GREATEST(pct, 10)` with no upper limit (`20261007130000_signup_charity_metadata.sql:18-22`).
- Signup metadata or a direct PostgREST update of one's own `user_charity` row (RLS `user_charity_update_own_or_admin`) can store more than 100.

**10. "Publishing is not atomic and can leave a half-published draw." — CONFIRMED**
- `publishDraw` (`lib/draw/admin-actions.ts:164-283`) runs these as separate requests with no transaction:
  1. entry sync
  2. `winners` delete (line 215, error not checked)
  3. `winners` insert (218-232)
  4. `draws` status → published (234-244)
  5. carryover update or insert on next month (249-273, errors not checked)
- `DECISIONS.md:132` states the same.
- Retrying after a failure before step 4 is possible (status is still 'simulated'; winners are deleted and re-inserted). A failure after step 4 loses the carryover, because the draw can no longer be re-published.
- There is no lock against two concurrent publishes: the status check (179) and the update (234) are separate.
