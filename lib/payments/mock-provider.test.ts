import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { upsertSubscriptionRow } = vi.hoisted(() => ({
  upsertSubscriptionRow: vi.fn(),
}));

vi.mock("@/lib/payments/subscription-store", () => ({
  upsertSubscriptionRow,
}));

vi.mock("@/lib/site-url", () => ({
  getSiteUrl: () => "http://localhost:3000",
}));

import { mockProvider } from "@/lib/payments/mock-provider";

describe("mockProvider.createSubscription", () => {
  beforeEach(() => {
    upsertSubscriptionRow.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("activates a yearly plan with a 12-month renewal", async () => {
    const result = await mockProvider.createSubscription({
      userId: "user-yearly",
      email: "yearly@example.com",
      plan: "yearly",
    });

    expect(result).toEqual({
      mode: "mock",
      redirectUrl: "http://localhost:3000/dashboard?checkout=success",
    });
    expect(upsertSubscriptionRow).toHaveBeenCalledOnce();
    expect(upsertSubscriptionRow).toHaveBeenCalledWith({
      userId: "user-yearly",
      plan: "yearly",
      status: "active",
      externalCustomerId: "mock_cust_user-yearly",
      externalSubscriptionId: "mock_sub_user-yearly_yearly",
      renewalDate: "2027-06-15",
    });
  });

  it("activates a monthly plan with a 1-month renewal", async () => {
    await mockProvider.createSubscription({
      userId: "user-monthly",
      plan: "monthly",
    });

    expect(upsertSubscriptionRow).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: "monthly",
        externalSubscriptionId: "mock_sub_user-monthly_monthly",
        renewalDate: "2026-07-15",
      }),
    );
  });
});
