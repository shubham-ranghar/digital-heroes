import { z } from "zod";

import { scoreFormSchema } from "@/lib/validations/score";

export const adminUserIdSchema = z.object({
  userId: z.string().uuid(),
});

export const adminProfileSchema = z.object({
  userId: z.string().uuid(),
  displayName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("")),
  role: z.enum(["subscriber", "admin"]),
});

export const adminSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  plan: z.enum(["monthly", "yearly"]),
  status: z.enum(["active", "cancelled", "lapsed"]),
  renewalDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
});

export const adminScoreSchema = scoreFormSchema.extend({
  userId: z.string().uuid(),
});

export const adminScoreDeleteSchema = z.object({
  userId: z.string().uuid(),
  scoreId: z.string().uuid(),
});

export const charityFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase slug with hyphens only"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  imageUrls: z.string().optional().or(z.literal("")),
  isFeatured: z.coerce.boolean().optional(),
});

export const charityDeleteSchema = z.object({
  charityId: z.string().uuid(),
});

export const drawCreateSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}-01$/, "Month must be YYYY-MM-01"),
});
