import { getPaymentProviderName } from "@/lib/payments/env";
import { mockProvider } from "@/lib/payments/mock-provider";
import { razorpayProvider } from "@/lib/payments/razorpay-provider";
import type { PaymentProvider } from "@/lib/payments/types";

export function getPaymentProvider(): PaymentProvider {
  const name = getPaymentProviderName();
  if (name === "mock") {
    return mockProvider;
  }
  return razorpayProvider;
}

/**
 * Provider that owns an existing subscription. Rows created under the mock
 * provider keep their `mock_sub_` id after switching to Razorpay, and Razorpay
 * 404s on them, so route by id rather than by the current PAYMENT_PROVIDER.
 */
export function getPaymentProviderForSubscription(
  externalSubscriptionId: string,
): PaymentProvider {
  if (externalSubscriptionId.startsWith("mock_sub_")) {
    return mockProvider;
  }
  return getPaymentProvider();
}

export * from "@/lib/payments/env";
export * from "@/lib/payments/types";
