import type Stripe from "stripe";

/** Stripe SDK v23 typings omit some fields; read from webhook payloads safely. */
type SubscriptionPayload = {
  id: string;
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null;
  status: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  metadata?: Record<string, string>;
  items?: { data?: Array<{ price?: { id?: string } | string }> };
};

type InvoicePayload = {
  subscription?: string | Stripe.Subscription | null;
};

export function asSubscriptionPayload(
  subscription: Stripe.Subscription,
): SubscriptionPayload {
  return subscription as unknown as SubscriptionPayload;
}

export function asInvoicePayload(invoice: Stripe.Invoice): InvoicePayload {
  return invoice as unknown as InvoicePayload;
}

export function subscriptionPeriodEnd(subscription: Stripe.Subscription): number {
  const payload = asSubscriptionPayload(subscription);
  if (typeof payload.current_period_end === "number") {
    return payload.current_period_end;
  }
  throw new Error("Stripe subscription missing current_period_end");
}

export function invoiceSubscriptionId(
  invoice: Stripe.Invoice,
): string | null {
  const payload = asInvoicePayload(invoice);
  const sub = payload.subscription;
  if (!sub) {
    return null;
  }
  if (typeof sub === "string") {
    return sub;
  }
  return sub.id;
}
