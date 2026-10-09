import type { SupabaseClient } from "@supabase/supabase-js";

export type PlatformTotals = {
  /** Succeeded INR donations, in rupees. */
  donationTotalInr: number;
  /** Sum of every member's charity percentage (10 = 10%). */
  charityPercentageSum: number;
  prizePaid: number;
  prizePending: number;
};

/** One-row sums from `platform_totals()`; needs the service-role client. */
export async function loadPlatformTotals(
  client: SupabaseClient,
): Promise<PlatformTotals> {
  const { data, error } = await client.rpc("platform_totals");
  if (error) {
    throw new Error(error.message);
  }

  const totals = (data ?? {}) as Record<string, unknown>;
  return {
    donationTotalInr: Number(totals.donation_total_paise ?? 0) / 100,
    charityPercentageSum: Number(totals.charity_percentage_sum ?? 0),
    prizePaid: Number(totals.prize_paid ?? 0),
    prizePending: Number(totals.prize_pending ?? 0),
  };
}
