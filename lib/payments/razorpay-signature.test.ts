import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { razorpayProvider } from "@/lib/payments/razorpay-provider";

describe("razorpayProvider.verifyWebhook", () => {
  it("accepts a valid HMAC signature", () => {
    const secret = "whsec_test";
    const body = JSON.stringify({
      id: "evt_test",
      event: "subscription.activated",
      payload: { subscription: { entity: { id: "sub_test" } } },
    });
    const signature = createHmac("sha256", secret).update(body).digest("hex");

    process.env.RAZORPAY_WEBHOOK_SECRET = secret;

    const verified = razorpayProvider.verifyWebhook(body, signature);
    expect(verified.eventType).toBe("subscription.activated");
    expect(verified.eventId).toBe("evt_test");
  });
});
