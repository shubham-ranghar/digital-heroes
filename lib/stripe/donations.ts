import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";

export async function markDonationSucceeded(
  donationId: string,
  paymentIntentId: string | null,
) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("donations")
    .update({
      status: "succeeded",
      stripe_payment_intent_id: paymentIntentId,
    })
    .eq("id", donationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markDonationFailed(donationId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("donations")
    .update({ status: "failed" })
    .eq("id", donationId);

  if (error) {
    throw new Error(error.message);
  }
}

export function paymentIntentIdFromSession(
  session: Stripe.Checkout.Session,
): string | null {
  const pi = session.payment_intent;
  if (!pi) {
    return null;
  }
  return typeof pi === "string" ? pi : pi.id;
}
