import { z } from "zod";

import { formatCurrency } from "@/lib/money";

/** One-off donation amount in major units (rupees). */
export const donationAmountSchema = z.coerce
  .number()
  .min(1, `Minimum donation is ${formatCurrency(1)}`)
  .max(10_000, `Maximum donation is ${formatCurrency(10_000)}`);

export const donationCheckoutSchema = z.object({
  charityId: z.string().uuid("Invalid charity"),
  amount: donationAmountSchema,
});

export type DonationCheckoutInput = z.infer<typeof donationCheckoutSchema>;
