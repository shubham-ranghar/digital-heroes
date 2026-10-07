import { z } from "zod";

import { todayIsoDate } from "@/lib/scores/dates";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const scoreValueSchema = z.coerce
  .number()
  .int("Score must be a whole number")
  .min(1, "Minimum Stableford score is 1")
  .max(45, "Maximum Stableford score is 45");

export const playedOnSchema = z
  .string()
  .trim()
  .regex(isoDateRegex, "Enter a valid date");

export const scoreFormSchema = z
  .object({
    scoreId: z
      .string()
      .uuid("Invalid score reference")
      .optional()
      .nullable()
      .transform((value) => value ?? undefined),
    score: scoreValueSchema,
    playedOn: playedOnSchema,
  })
  .superRefine((data, ctx) => {
    if (data.playedOn > todayIsoDate()) {
      ctx.addIssue({
        code: "custom",
        message: "Date cannot be in the future",
        path: ["playedOn"],
      });
    }
  });

export const scoreIdSchema = z.object({
  scoreId: z.string().uuid("Invalid score reference"),
});

export type ScoreFormInput = z.infer<typeof scoreFormSchema>;
