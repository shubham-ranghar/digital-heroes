import { z } from "zod";

export const checkoutPlanSchema = z.enum(["monthly", "yearly"]);
