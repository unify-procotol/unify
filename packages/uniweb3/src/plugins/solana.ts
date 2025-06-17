import { os } from "@orpc/server";
import { BalanceInputSchema, BalanceOutputSchema } from "../schema/balance";
import { SolanaHandler } from "../handlers/solana";

export const SolanaPlugin = {
  id: "solana_plugin",
  entities: {
    balance: {
      findOne: os
        .input(BalanceInputSchema)
        .output(BalanceOutputSchema)
        .handler(async ({ input }) => {
          const { where } = input;
          const handler = new SolanaHandler();
          const balance = await handler.getBalance(where.address);
          return {
            balance,
            symbol: handler.symbol,
            timestamp: new Date().toISOString(),
          };
        }),
    },
  },
};
