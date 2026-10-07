import { z } from "zod";

import { MIN_CHARITY_PERCENTAGE } from "@/lib/charity/contribution";

export const charityPercentageSchema = z.object({
  percentage: z.coerce
    .number()
    .min(MIN_CHARITY_PERCENTAGE, `Minimum ${MIN_CHARITY_PERCENTAGE}%`)
    .max(100, "Maximum 100%"),
});
