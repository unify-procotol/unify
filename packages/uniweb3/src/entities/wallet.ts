import type { BaseEntity } from "@unify/core";

export interface WalletEntity extends BaseEntity {
  address: string;
  balance: string;
  network: string;
  token?: {
    symbol: string;
    decimals: number;
  };
}
