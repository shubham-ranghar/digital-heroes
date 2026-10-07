import { z } from "zod";

/** One-off donation amount in major units (e.g. pounds). */
export const donationAmountSchema = z.coerce
  .number()
  .min(1, "Minimum donation is £1")
  .max(10_000, "Maximum donation is £10,000");

export const donationCheckoutSchema = z.object({
  charityId: z.string().uuid("Invalid charity"),
  amount: donationAmountSchema,
});

export type DonationCheckoutInput = z.infer<typeof donationCheckoutSchema>;
