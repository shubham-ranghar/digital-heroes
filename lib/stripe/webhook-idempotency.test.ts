import { describe, expect, it, vi } from "vitest";

import { runWithWebhookIdempotency } from "@/lib/stripe/webhook-idempotency";

type Row = { event_id: string; type: string };

function createMockAdmin() {
  const rows = new Map<string, Row>();

  const admin = {
    from: (table: string) => {
      if (table !== "stripe_webhook_events") {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        insert: async (payload: Row) => {
          if (rows.has(payload.event_id)) {
            return { error: { code: "23505", message: "duplicate" } };
          }
          rows.set(payload.event_id, payload);
          return { error: null };
        },
        delete: () => ({
          eq: async (_col: string, eventId: string) => {
            rows.delete(eventId);
            return { error: null };
          },
        }),
      };
    },
    _rows: rows,
  };

  return admin as unknown as import("@supabase/supabase-js").SupabaseClient & {
    _rows: Map<string, Row>;
  };
}

describe("runWithWebhookIdempotency", () => {
  it("runs the handler on first delivery", async () => {
    const admin = createMockAdmin();
    const handler = vi.fn(async () => undefined);

    const result = await runWithWebhookIdempotency(
      admin,
      { id: "evt_1", type: "invoice.paid" },
      handler,
    );

    expect(result).toBe("processed");
    expect(handler).toHaveBeenCalledTimes(1);
    expect(admin._rows.has("evt_1")).toBe(true);
  });

  it("skips the handler when the event was already processed", async () => {
    const admin = createMockAdmin();
    const handler = vi.fn(async () => undefined);

    await runWithWebhookIdempotency(
      admin,
      { id: "evt_2", type: "invoice.paid" },
      handler,
    );

    const second = await runWithWebhookIdempotency(
      admin,
      { id: "evt_2", type: "invoice.paid" },
      handler,
    );

    expect(second).toBe("duplicate");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("releases the lock when the handler throws so retries can reprocess", async () => {
    const admin = createMockAdmin();
    const handler = vi
      .fn()
      .mockRejectedValueOnce(new Error("sync failed"))
      .mockResolvedValueOnce(undefined);

    await expect(
      runWithWebhookIdempotency(
        admin,
        { id: "evt_3", type: "checkout.session.completed" },
        handler,
      ),
    ).rejects.toThrow("sync failed");

    expect(admin._rows.has("evt_3")).toBe(false);

    const retry = await runWithWebhookIdempotency(
      admin,
      { id: "evt_3", type: "checkout.session.completed" },
      handler,
    );

    expect(retry).toBe("processed");
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
