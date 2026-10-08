import { describe, expect, it } from "vitest";

import {
  activeSubscriberUserIdsFromRows,
  latestSubscriptionRowPerUser,
} from "@/lib/draw/db";

describe("latestSubscriptionRowPerUser", () => {
  it("keeps the newest created_at row per user_id", () => {
    const rows = [
      {
        user_id: "user-a",
        status: "active" as const,
        renewal_date: null,
        created_at: "2026-01-01T00:00:00.000Z",
      },
      {
        user_id: "user-a",
        status: "lapsed" as const,
        renewal_date: null,
        created_at: "2026-02-01T00:00:00.000Z",
      },
    ];

    const latest = latestSubscriptionRowPerUser(rows);
    expect(latest).toHaveLength(1);
    expect(latest[0]?.status).toBe("lapsed");
  });
});

describe("activeSubscriberUserIdsFromRows", () => {
  it("excludes a user when their latest row is lapsed even if an older row was active", () => {
    const userId = "11111111-1111-1111-1111-111111111111";
    const active = activeSubscriberUserIdsFromRows(
      [
        {
          user_id: userId,
          status: "active",
          renewal_date: null,
          created_at: "2026-01-01T00:00:00.000Z",
        },
        {
          user_id: userId,
          status: "lapsed",
          renewal_date: null,
          created_at: "2026-03-01T00:00:00.000Z",
        },
      ],
      new Date("2026-10-01T12:00:00.000Z"),
    );

    expect(active.has(userId)).toBe(false);
  });
});
