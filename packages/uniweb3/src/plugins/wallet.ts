import { Plugin } from "@unilab/core";
import { WalletEntity } from "../entities/wallet";
import { SolanaAdapter } from "../adapters/solana-adapter";
import { EVMAdapter } from "../adapters/evm-adapter";

export const WalletPlugin: Plugin = {
  entities: [WalletEntity],
  adapters: [
    {
      source: "solana",
      entity: "WalletEntity",
      adapter: new SolanaAdapter(),
    },
    { source: "evm", entity: "WalletEntity", adapter: new EVMAdapter() },
  ],
};
