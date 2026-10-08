import { getSiteUrl } from "@/lib/site-url";
import { upsertSubscriptionRow } from "@/lib/payments/subscription-store";
import type {
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  PaymentProvider,
  VerifiedWebhook,
} from "@/lib/payments/types";

function mockSubscriptionId(userId: string, plan: string) {
  return `mock_sub_${userId}_${plan}`;
}

export const mockProvider: PaymentProvider = {
  name: "mock",

  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<CreateSubscriptionResult> {
    const externalId = mockSubscriptionId(input.userId, input.plan);
    const renewal = new Date();
    renewal.setUTCMonth(renewal.getUTCMonth() + (input.plan === "yearly" ? 12 : 1));

    await upsertSubscriptionRow({
      userId: input.userId,
      plan: input.plan,
      status: "active",
      externalCustomerId: `mock_cust_${input.userId}`,
      externalSubscriptionId: externalId,
      renewalDate: renewal.toISOString().slice(0, 10),
    });

    return {
      mode: "mock",
      redirectUrl: `${getSiteUrl()}/dashboard?checkout=success`,
    };
  },

  verifyWebhook(): VerifiedWebhook {
    throw new Error("Mock provider does not accept webhooks");
  },

  async cancelSubscription(externalSubscriptionId: string): Promise<void> {
    const { markSubscriptionCancelAtPeriodEnd } =
      await import("@/lib/payments/subscription-store");
    await markSubscriptionCancelAtPeriodEnd(externalSubscriptionId);
  },

  async resumeSubscription(externalSubscriptionId: string): Promise<void> {
    const { clearSubscriptionCancelAtPeriodEnd } =
      await import("@/lib/payments/subscription-store");
    await clearSubscriptionCancelAtPeriodEnd(externalSubscriptionId);
  },
};
