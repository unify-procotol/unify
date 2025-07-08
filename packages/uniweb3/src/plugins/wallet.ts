import { Plugin } from "@unilab/urpc-core";
import { TokenEntity, WalletEntity } from "../entities/wallet";
import { SolanaAdapter } from "../adapters/solana-adapter";
import { EVMAdapter } from "../adapters/evm-adapter";

export const WalletPlugin: Plugin = {
  entities: [WalletEntity, TokenEntity],
  adapters: [
    {
      source: "solana",
      entity: "WalletEntity",
      adapter: new SolanaAdapter(),
    },
    { source: "evm", entity: "WalletEntity", adapter: new EVMAdapter() },
  ],
};
