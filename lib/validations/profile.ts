import { z } from "zod";

import { MIN_CHARITY_PERCENTAGE } from "@/lib/charity/contribution";

export const displayNameSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(80, "Display name is too long"),
});

export const profileCharitySchema = z.object({
  charityId: z.string().uuid("Choose a valid charity"),
  percentage: z.coerce
    .number()
    .min(MIN_CHARITY_PERCENTAGE, `Minimum ${MIN_CHARITY_PERCENTAGE}%`)
    .max(100, "Maximum 100%"),
});
