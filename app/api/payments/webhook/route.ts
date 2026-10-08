import { NextResponse } from "next/server";

import { getPaymentProvider } from "@/lib/payments";
import { handlePaymentWebhook } from "@/lib/payments/webhook-handler";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  try {
    const provider = getPaymentProvider();
    const verified = provider.verifyWebhook(rawBody, signature);
    await handlePaymentWebhook(verified);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Webhook processing failed";
    console.error("[payments webhook]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
