import { z } from "zod";

export const EVMBalanceInputSchema = z.object({
  where: z.object({
    address: z.string(),
    network: z.string(),
  }),
});

export const SolanaBalanceInputSchema = z.object({
  where: z.object({
    address: z.string(),
  }),
});

export const BalanceOutputSchema = z.object({
  balance: z.number(),
  symbol: z.string(),
  timestamp: z.string(),
});
