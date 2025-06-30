import type {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  UpsertArgs,
} from "@unilab/core";
import type { WalletEntity } from "../entities/wallet";
import { SolanaHandler } from "../handlers/solana";

const handler = new SolanaHandler();

export class SolanaAdapter implements DataSourceAdapter<WalletEntity> {
  static readonly adapterName = "SolanaAdapter";

  async findMany(args: FindManyArgs<WalletEntity>): Promise<WalletEntity[]> {
    return [];
  }

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

  async create(args: CreationArgs<WalletEntity>): Promise<WalletEntity> {
    throw new Error("Not implemented");
  }

  async update(args: UpdateArgs<WalletEntity>): Promise<WalletEntity> {
    throw new Error("Not implemented");
  }

  async upsert(args: UpsertArgs<WalletEntity>): Promise<WalletEntity> {
    throw new Error("Not implemented");
  }

  async delete(args: DeletionArgs<WalletEntity>): Promise<boolean> {
    return true;
  }
}
