import { Plugin } from "@unilab/core";
import { WalletEntity } from "../entities/wallet";
import { SolanaAdapter } from "../adapters/solana-adapter";
import { EVMAdapter } from "../adapters/evm-adapter";

export const WalletPlugin: Plugin = {
  entities: [WalletEntity],
  adapters: [
    {
      source: "solana",
      entityName: "WalletEntity",
      adapter: new SolanaAdapter(),
    },
    { source: "evm", entityName: "WalletEntity", adapter: new EVMAdapter() },
  ],
};
