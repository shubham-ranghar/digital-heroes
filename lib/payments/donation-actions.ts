"use server";

import type { ZodError } from "zod";

import { requireUser } from "@/lib/auth/session";
import { getPaymentProviderName, hasRazorpayEnv } from "@/lib/payments/env";
import { razorpayFetch } from "@/lib/payments/razorpay-client";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { donationCheckoutSchema } from "@/lib/validations/donation";

export type DonationActionResult =
  | { ok: true; mode: "razorpay"; checkout: { keyId: string; orderId: string; amount: number; currency: string; name: string; description: string } }
  | { ok: true; mode: "mock"; redirectUrl: string }
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

async function markDonationSucceeded(donationId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("donations")
    .update({ status: "succeeded" })
    .eq("id", donationId);
  if (error) {
    throw new Error(error.message);
  }
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

  const amountPaise = Math.round(amount * 100);

  const { data: donation, error: insertError } = await supabase
    .from("donations")
    .insert({
      user_id: user.id,
      charity_id: charityId,
      amount_cents: amountPaise,
      currency: "inr",
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

  if (getPaymentProviderName() === "mock") {
    await markDonationSucceeded(donation.id);
    return {
      ok: true,
      mode: "mock",
      redirectUrl: `${getSiteUrl()}/charities/${charity.slug}?donation=success`,
    };
  }

  if (!hasRazorpayEnv()) {
    return { ok: false, message: "Payments are not configured." };
  }

  let order: { id: string };
  try {
    order = await razorpayFetch<{ id: string }>("/orders", {
      body: {
        amount: amountPaise,
        currency: "INR",
        notes: {
          kind: "donation",
          donation_id: donation.id,
          charity_id: charityId,
          user_id: user.id,
        },
      },
    });
  } catch (error) {
    console.error("Payment provider error while creating donation order:", error);
    return {
      ok: false,
      message: "We could not start the donation right now. Please try again in a moment.",
    };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    return { ok: false, message: "Missing RAZORPAY_KEY_ID" };
  }

  return {
    ok: true,
    mode: "razorpay",
    checkout: {
      keyId,
      orderId: order.id,
      amount: amountPaise,
      currency: "INR",
      name: "digital.HEROES",
      description: `Donation to ${charity.name}`,
    },
  };
}
