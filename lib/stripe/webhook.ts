import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe/server";
import { runWithWebhookIdempotency } from "@/lib/stripe/webhook-idempotency";
import { createAdminClient } from "@/lib/supabase/admin";
import { invoiceSubscriptionId } from "@/lib/stripe/stripe-objects";
import {
  markSubscriptionLapsedByStripeId,
  renewalDateFromUnix,
  syncFromStripeSubscription,
  upsertSubscriptionRow,
  planFromStripeSubscription,
} from "@/lib/stripe/sync";
import { subscriptionPeriodEnd } from "@/lib/stripe/stripe-objects";
import {
  markDonationFailed,
  markDonationSucceeded,
  paymentIntentIdFromSession,
} from "@/lib/stripe/donations";

async function resolveUserIdFromSession(
  session: Stripe.Checkout.Session,
): Promise<string | null> {
  if (session.metadata?.user_id) {
    return session.metadata.user_id;
  }
  if (session.client_reference_id) {
    return session.client_reference_id;
  }
  return null;
}

async function processStripeEvent(event: Stripe.Event) {
  const stripe = getStripe();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (
        session.mode === "payment" &&
        session.metadata?.kind === "donation" &&
        session.metadata.donation_id
      ) {
        await markDonationSucceeded(
          session.metadata.donation_id,
          paymentIntentIdFromSession(session),
        );
        return;
      }

      if (session.mode !== "subscription" || !session.subscription) {
        return;
      }

      const userId = await resolveUserIdFromSession(session);
      if (!userId) {
        throw new Error("checkout.session.completed missing user_id");
      }

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncFromStripeSubscription(subscription, userId);
      return;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoiceSubscriptionId(invoice);
      if (!subscriptionId) {
        return;
      }
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncFromStripeSubscription(subscription);
      return;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoiceSubscriptionId(invoice);
      if (!subscriptionId) {
        return;
      }
      await markSubscriptionLapsedByStripeId(subscriptionId);
      return;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncFromStripeSubscription(subscription);
      return;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id;
      if (!userId) {
        await markSubscriptionLapsedByStripeId(subscription.id);
        return;
      }
      await upsertSubscriptionRow({
        userId,
        plan: planFromStripeSubscription(subscription),
        status: "lapsed",
        stripeCustomerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id ?? null,
        stripeSubscriptionId: subscription.id,
        renewalDate: renewalDateFromUnix(subscriptionPeriodEnd(subscription)),
      });
      return;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.kind === "donation" && session.metadata.donation_id) {
        await markDonationFailed(session.metadata.donation_id);
      }
      return;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const donationId = intent.metadata?.donation_id;
      if (donationId) {
        await markDonationFailed(donationId);
      }
      return;
    }

    default:
      return;
  }
}

export async function handleStripeEvent(event: Stripe.Event) {
  const admin = createAdminClient();
  return runWithWebhookIdempotency(admin, event, () =>
    processStripeEvent(event),
  );
}
