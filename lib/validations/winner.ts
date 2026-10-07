import { z } from "zod";

export const winnerIdSchema = z.object({
  winnerId: z.string().uuid("Invalid winner reference"),
});
