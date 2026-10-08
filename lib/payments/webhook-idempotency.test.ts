import { describe, expect, it, vi } from "vitest";

import { runWithWebhookIdempotency } from "@/lib/payments/webhook-idempotency";

function mockAdmin() {
  const inserted: { event_id: string }[] = [];
  return {
    inserted,
    from(table: string) {
      if (table !== "payment_webhook_events") {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        insert(row: { event_id: string; type: string }) {
          if (inserted.some((r) => r.event_id === row.event_id)) {
            return Promise.resolve({
              error: { code: "23505", message: "duplicate" },
            });
          }
          inserted.push({ event_id: row.event_id });
          return Promise.resolve({ error: null });
        },
        delete() {
          return {
            eq(_col: string, eventId: string) {
              const idx = inserted.findIndex((r) => r.event_id === eventId);
              if (idx >= 0) {
                inserted.splice(idx, 1);
              }
              return Promise.resolve({ error: null });
            },
          };
        },
      };
    },
  };
}

describe("runWithWebhookIdempotency", () => {
  it("runs handler once per event id", async () => {
    const admin = mockAdmin();
    const handler = vi.fn().mockResolvedValue(undefined);
    const event = { id: "evt_1", type: "subscription.activated" };

    await runWithWebhookIdempotency(admin as never, event, handler);
    const again = await runWithWebhookIdempotency(admin as never, event, handler);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(again).toBe("duplicate");
  });

  it("releases lock when handler throws", async () => {
    const admin = mockAdmin();
    const event = { id: "evt_2", type: "payment.failed" };
    const failing = vi.fn().mockRejectedValue(new Error("boom"));
    const succeeding = vi.fn().mockResolvedValue(undefined);

    await expect(
      runWithWebhookIdempotency(admin as never, event, failing),
    ).rejects.toThrow("boom");

    const result = await runWithWebhookIdempotency(
      admin as never,
      event,
      succeeding,
    );
    expect(result).toBe("processed");
    expect(succeeding).toHaveBeenCalledTimes(1);
  });
});
