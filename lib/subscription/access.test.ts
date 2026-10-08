import { describe, expect, it } from "vitest";

import {
  getSubscriptionAccessLabel,
  subscriptionGrantsAccess,
} from "@/lib/subscription/grants";

const periodEnd = "2026-12-31";

describe("subscriptionGrantsAccess", () => {
  it("grants access for active subscription without cancel flag", () => {
    expect(
      subscriptionGrantsAccess(
        {
          status: "active",
          renewal_date: periodEnd,
          cancel_at_period_end: false,
        },
        new Date("2026-06-01"),
      ),
    ).toBe(true);
  });

  it("grants access when cancel_at_period_end is set before renewal_date", () => {
    expect(
      subscriptionGrantsAccess(
        {
          status: "active",
          renewal_date: periodEnd,
          cancel_at_period_end: true,
        },
        new Date("2026-12-31"),
      ),
    ).toBe(true);
  });

  it("revokes access after renewal_date when cancel_at_period_end is set", () => {
    expect(
      subscriptionGrantsAccess(
        {
          status: "active",
          renewal_date: periodEnd,
          cancel_at_period_end: true,
        },
        new Date("2027-01-01"),
      ),
    ).toBe(false);
  });

  it("supports legacy cancelled rows until renewal_date", () => {
    expect(
      subscriptionGrantsAccess(
        {
          status: "cancelled",
          renewal_date: periodEnd,
          cancel_at_period_end: false,
        },
        new Date("2026-12-15"),
      ),
    ).toBe(true);
  });
});

describe("getSubscriptionAccessLabel", () => {
  it("shows cancels-on copy when scheduled to cancel", () => {
    const label = getSubscriptionAccessLabel(
      {
        status: "active",
        renewal_date: "2026-07-15",
        cancel_at_period_end: true,
      },
      true,
    );
    expect(label.tone).toBe("cancelling");
    expect(label.label).toContain("Active, cancels on");
    expect(label.label).toContain("15");
  });
});
