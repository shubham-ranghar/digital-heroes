import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  markSubscriptionCancelAtPeriodEnd,
  clearSubscriptionCancelAtPeriodEnd,
} = vi.hoisted(() => ({
  markSubscriptionCancelAtPeriodEnd: vi.fn(),
  clearSubscriptionCancelAtPeriodEnd: vi.fn(),
}));

vi.mock("@/lib/payments/subscription-store", () => ({
  markSubscriptionCancelAtPeriodEnd,
  clearSubscriptionCancelAtPeriodEnd,
}));

import { mockProvider } from "@/lib/payments/mock-provider";

describe("mockProvider billing lifecycle", () => {
  beforeEach(() => {
    markSubscriptionCancelAtPeriodEnd.mockReset();
    clearSubscriptionCancelAtPeriodEnd.mockReset();
  });

  it("cancel sets cancel_at_period_end via store", async () => {
    await mockProvider.cancelSubscription("mock_sub_user_monthly");
    expect(markSubscriptionCancelAtPeriodEnd).toHaveBeenCalledWith(
      "mock_sub_user_monthly",
    );
  });

  it("resume clears cancel_at_period_end via store", async () => {
    await mockProvider.resumeSubscription("mock_sub_user_monthly");
    expect(clearSubscriptionCancelAtPeriodEnd).toHaveBeenCalledWith(
      "mock_sub_user_monthly",
    );
  });
});
