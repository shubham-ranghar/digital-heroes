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
