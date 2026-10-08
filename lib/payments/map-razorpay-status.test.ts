import { describe, expect, it } from "vitest";

import { mapRazorpaySubscriptionStatus } from "@/lib/payments/map-razorpay-status";

describe("mapRazorpaySubscriptionStatus", () => {
  it("maps active subscription to active", () => {
    expect(
      mapRazorpaySubscriptionStatus({ id: "sub_1", status: "active" }),
    ).toBe("active");
  });

  it("maps halted to lapsed", () => {
    expect(
      mapRazorpaySubscriptionStatus({ id: "sub_1", status: "halted" }),
    ).toBe("lapsed");
  });

  it("maps cancelled with future period end to cancelled", () => {
    const future = Math.floor(Date.now() / 1000) + 86_400;
    expect(
      mapRazorpaySubscriptionStatus({
        id: "sub_1",
        status: "cancelled",
        current_end: future,
      }),
    ).toBe("cancelled");
  });

  it("maps pending to past_due", () => {
    expect(
      mapRazorpaySubscriptionStatus({ id: "sub_1", status: "pending" }),
    ).toBe("past_due");
  });
});
