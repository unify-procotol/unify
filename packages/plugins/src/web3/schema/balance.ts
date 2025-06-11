import { z } from "zod";

export const BalanceInputSchema = z.object({
  where: z.object({
    address: z.string(),
    network: z.string().optional(),
  }),
});

export const BalanceOutputSchema = z.object({
  balance: z.number(),
  symbol: z.string(),
  timestamp: z.string(),
});
