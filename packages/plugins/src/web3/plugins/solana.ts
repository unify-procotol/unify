import { Plugin } from "../types";
import { BalanceEntity } from "../entities/balance";
import { SolanaHandler } from "../handlers/solana";

// 创建Solana插件
export const SolanaPlugin: Plugin = {
  id: "solana_plugin",
  entities: {
    balance: new BalanceEntity(new SolanaHandler()),
  },
};
