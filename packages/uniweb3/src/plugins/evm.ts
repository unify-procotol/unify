import { os } from "@orpc/server";
import { BalanceInputSchema, BalanceOutputSchema } from "../schema/balance";
import { createEVMHandler, EVMHandler } from "../handlers/evm";

const evmHandlers: Record<number, EVMHandler> = {
  1: createEVMHandler(1),
  4689: createEVMHandler(4689),
  137: createEVMHandler(137),
  56: createEVMHandler(56),
};

export const EVMPlugin = {
  id: "evm_plugin",
  entities: {
    balance: {
      findOne: os
        .input(BalanceInputSchema)
        .output(BalanceOutputSchema)
        .handler(async ({ input }) => {
          const { where } = input;

          // Default to ethereum (chain ID 1) if no chain is specified
          const chainId = where.chain_id || 1;
          const networkName = evmHandlers[chainId];

          if (!networkName) {
            throw {
              status: 400,
              message: `Unsupported chain ID: ${chainId}. Supported chain IDs: ${Object.keys(
                evmHandlers
              ).join(", ")}`,
            };
          }

          const handler = evmHandlers[chainId];
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
