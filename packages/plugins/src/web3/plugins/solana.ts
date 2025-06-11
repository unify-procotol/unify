import { SourceConfig } from "unify-api";
import { os } from "@orpc/server";
import {
  SolanaBalanceInputSchema,
  BalanceOutputSchema,
} from "../schema/balance";
import { SolanaHandler } from "../handlers/solana";

export const SolanaPlugin: SourceConfig = {
  id: "solana_plugin",
  entities: {
    balance: {
      findOne: os
        .input(SolanaBalanceInputSchema)
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
