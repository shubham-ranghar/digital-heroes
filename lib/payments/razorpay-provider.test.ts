import { beforeEach, describe, expect, it, vi } from "vitest";

const { razorpayFetch } = vi.hoisted(() => ({
  razorpayFetch: vi.fn(),
}));

vi.mock("@/lib/payments/razorpay-client", () => ({
  razorpayFetch,
}));

vi.mock("@/lib/payments/env", () => ({
  getRazorpayKeyId: () => "rzp_test_key",
  getRazorpayWebhookSecret: () => "whsec_test",
  razorpayPlanIdForPlan: (plan: "monthly" | "yearly") =>
    plan === "yearly" ? "plan_yearly_test" : "plan_monthly_test",
}));

import { razorpayProvider } from "@/lib/payments/razorpay-provider";

describe("razorpayProvider.createSubscription", () => {
  beforeEach(() => {
    razorpayFetch.mockReset();
    razorpayFetch.mockResolvedValue({ id: "sub_test_yearly", status: "created" });
  });

  it("creates a yearly Razorpay subscription with the yearly plan id", async () => {
    const result = await razorpayProvider.createSubscription({
      userId: "user-1",
      email: "member@example.com",
      plan: "yearly",
    });

    expect(razorpayFetch).toHaveBeenCalledWith("/subscriptions", {
      body: {
        plan_id: "plan_yearly_test",
        total_count: 10,
        customer_notify: 1,
        notes: { user_id: "user-1", plan: "yearly" },
      },
    });
    expect(result.mode).toBe("razorpay");
    if (result.mode === "razorpay") {
      expect(result.checkout.subscriptionId).toBe("sub_test_yearly");
      expect(result.checkout.description).toBe("Yearly membership");
    }
  });

  it("caps monthly total_count at Razorpay's 100-cycle limit", async () => {
    razorpayFetch.mockImplementation(async (path: string) => {
      if (path.startsWith("/plans/")) {
        return { id: "plan_monthly_test", period: "monthly", interval: 1 };
      }
      return { id: "sub_test_monthly", status: "created" };
    });

    await razorpayProvider.createSubscription({
      userId: "user-1",
      email: "member@example.com",
      plan: "monthly",
    });

    expect(razorpayFetch).toHaveBeenCalledWith("/subscriptions", {
      body: {
        plan_id: "plan_monthly_test",
        total_count: 100,
        customer_notify: 1,
        notes: { user_id: "user-1", plan: "monthly" },
      },
    });
  });

  it("rejects a plan whose Razorpay period doesn't match the app plan", async () => {
    razorpayFetch.mockImplementation(async (path: string) => {
      if (path.startsWith("/plans/")) {
        return { id: "plan_yearly_test", period: "weekly", interval: 1 };
      }
      return { id: "sub_x", status: "created" };
    });

    await expect(
      razorpayProvider.createSubscription({
        userId: "user-1",
        email: "member@example.com",
        plan: "yearly",
      }),
    ).rejects.toThrow(/bills per "weekly"/);
    expect(razorpayFetch).not.toHaveBeenCalledWith("/subscriptions", expect.anything());
  });

  it("still creates the subscription when the plan lookup fails", async () => {
    razorpayFetch.mockImplementation(async (path: string) => {
      if (path.startsWith("/plans/")) {
        throw new Error("network down");
      }
      return { id: "sub_test_yearly", status: "created" };
    });

    const result = await razorpayProvider.createSubscription({
      userId: "user-1",
      email: "member@example.com",
      plan: "yearly",
    });
    expect(result.mode).toBe("razorpay");
  });
});
