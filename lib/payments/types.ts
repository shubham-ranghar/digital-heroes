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
