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
    const subscription = await razorpayFetch<RazorpaySubscriptionResponse>(
      "/subscriptions",
      {
        body: {
          plan_id: planId,
          total_count: input.plan === "yearly" ? 10 : 120,
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
