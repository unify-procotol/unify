import { SourceConfig } from "unify-api";
import { os } from "@orpc/server";
import {
  EVMBalanceInputSchema,
  BalanceOutputSchema,
} from "../schema/balance";
import { createEVMHandler } from "../handlers/evm";

const evmNetworkHandlers = {
  ethereum: createEVMHandler("ethereum"),
  iotex: createEVMHandler("iotex"),
  polygon: createEVMHandler("polygon"),
  bsc: createEVMHandler("bsc"),
};

export const EVMPlugin: SourceConfig = {
  id: "evm_plugin",
  entities: {
    balance: {
      findOne: os
        .input(EVMBalanceInputSchema)
        .output(BalanceOutputSchema)
        .handler(async ({ input }) => {
          const { where } = input;
          const network = where.network as keyof typeof evmNetworkHandlers;
          const handler = evmNetworkHandlers[network];
          if (!handler) {
            throw {
              status: 400,
              message: `Unsupported EVM network: ${network}. Supported networks: ${Object.keys(
                evmNetworkHandlers
              ).join(", ")}`,
            };
          }
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
