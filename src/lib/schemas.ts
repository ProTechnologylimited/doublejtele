import { z } from "zod";
export const lineSchema = z.object({ productId: z.string(), qty: z.number().int().min(1).max(99) });
export const locSchema = z.object({ state: z.string().max(80).optional(), city: z.string().max(80).optional(), lga: z.string().max(80).optional() });
