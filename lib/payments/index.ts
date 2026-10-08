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

export * from "@/lib/payments/env";
export * from "@/lib/payments/types";
