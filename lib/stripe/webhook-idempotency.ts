import type { SupabaseClient } from "@supabase/supabase-js";

export type WebhookIdempotencyResult = "processed" | "duplicate";

const TABLE = "stripe_webhook_events";

/**
 * Inserts the Stripe event id before handling. On duplicate (23505), skips processing.
 * On handler failure after insert, deletes the row so Stripe can retry.
 */
export async function runWithWebhookIdempotency(
  admin: SupabaseClient,
  event: { id: string; type: string },
  handle: () => Promise<void>,
): Promise<WebhookIdempotencyResult> {
  const { error: insertError } = await admin.from(TABLE).insert({
    event_id: event.id,
    type: event.type,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return "duplicate";
    }
    throw new Error(insertError.message);
  }

  try {
    await handle();
    return "processed";
  } catch (error) {
    const { error: deleteError } = await admin
      .from(TABLE)
      .delete()
      .eq("event_id", event.id);

    if (deleteError) {
      throw new Error(
        `${error instanceof Error ? error.message : "Webhook handler failed"}; failed to release idempotency lock: ${deleteError.message}`,
      );
    }

    throw error;
  }
}
