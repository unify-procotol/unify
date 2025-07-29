import { Plugin } from "@unilab/urpc-core";
import { TokenEntity, WalletEntity } from "./entities/wallet";
import { ViemNetworkEntity } from "./entities/viem-network";
import { SolanaAdapter } from "./adapters/solana-adapter";
import { EVMAdapter } from "./adapters/evm-adapter";
import { MemoryAdapter } from "@unilab/urpc-adapters";

export const WalletPlugin: Plugin = {
  entities: [WalletEntity, TokenEntity, ViemNetworkEntity],
  adapters: [
    {
      source: "solana",
      entity: "WalletEntity",
      adapter: new SolanaAdapter(),
    },
    { source: "evm", entity: "WalletEntity", adapter: new EVMAdapter() },
    {
      source: "viem",
      entity: "ViemNetworkEntity",
      adapter: new MemoryAdapter(),
    },
  ],
};
