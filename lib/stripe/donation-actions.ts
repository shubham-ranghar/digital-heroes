"use server";

import type { ZodError } from "zod";

import { requireUser } from "@/lib/auth/session";
import { getSiteUrl } from "@/lib/stripe/env";
import { getStripe } from "@/lib/stripe/server";
import { donationCheckoutSchema } from "@/lib/validations/donation";

export type DonationActionResult =
  | { ok: true; url: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<string, string>>;
    };

function fieldErrorsFromZod(error: ZodError): Partial<Record<string, string>> {
  const flat = error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const result: Partial<Record<string, string>> = {};
  for (const [key, messages] of Object.entries(flat)) {
    if (messages?.[0]) {
      result[key] = messages[0];
    }
  }
  return result;
}

/** Independent one-time donation (not tied to subscription gameplay). */
export async function createDonationCheckoutAction(
  input: unknown,
): Promise<DonationActionResult> {
  const parsed = donationCheckoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the amount and try again.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const { supabase, user } = await requireUser();
  const { charityId, amount } = parsed.data;

  const { data: charity, error: charityError } = await supabase
    .from("charities")
    .select("id, name, slug")
    .eq("id", charityId)
    .maybeSingle();

  if (charityError || !charity) {
    return { ok: false, message: "Charity not found." };
  }

  const amountCents = Math.round(amount * 100);

  const { data: donation, error: insertError } = await supabase
    .from("donations")
    .insert({
      user_id: user.id,
      charity_id: charityId,
      amount_cents: amountCents,
      currency: "gbp",
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !donation) {
    return {
      ok: false,
      message: insertError?.message ?? "Could not start donation.",
    };
  }

  const stripe = getStripe();
  const siteUrl = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    line_items: [
      {
        price_data: {
          currency: "gbp",
          unit_amount: amountCents,
          product_data: {
            name: `Donation to ${charity.name}`,
            description:
              "One-off gift via digital.HEROES — separate from membership gameplay.",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      kind: "donation",
      donation_id: donation.id,
      charity_id: charityId,
      user_id: user.id,
    },
    payment_intent_data: {
      metadata: {
        kind: "donation",
        donation_id: donation.id,
      },
    },
    success_url: `${siteUrl}/charities/${charity.slug}?donation=success`,
    cancel_url: `${siteUrl}/charities/${charity.slug}?donation=cancelled`,
  });

  if (!session.url) {
    return { ok: false, message: "Could not open Stripe Checkout." };
  }

  return { ok: true, url: session.url };
}
