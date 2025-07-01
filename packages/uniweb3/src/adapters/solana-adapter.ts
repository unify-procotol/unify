import { BaseAdapter, type FindOneArgs } from "@unilab/core";
import type { WalletEntity } from "../entities/wallet";
import { SolanaHandler } from "../handlers/solana";

const handler = new SolanaHandler();

export class SolanaAdapter extends BaseAdapter<WalletEntity> {
  static readonly adapterName = "SolanaAdapter";

  async findOne(args: FindOneArgs<WalletEntity>): Promise<WalletEntity | null> {
    const { address } = args.where;

    if (!address) {
      throw {
        status: 400,
        message: "Invalid arguments",
      };
    }
    const balance = await handler.getBalance(address);
    return {
      address: address,
      balance: balance.toString(),
      network: "solana",
      token: {
        symbol: handler.symbol,
        decimals: 9,
      },
    };
  }
}
