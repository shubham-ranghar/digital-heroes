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
        updated_at: new Date().toISOString(),
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
