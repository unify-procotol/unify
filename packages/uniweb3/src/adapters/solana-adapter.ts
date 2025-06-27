import type {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
} from "@unilab/core";
import type { WalletEntity } from "../entities/wallet";
import { SolanaHandler } from "../handlers/solana";

const handler = new SolanaHandler();

export class SolanaAdapter implements DataSourceAdapter<WalletEntity> {
  static readonly adapterName = "SolanaAdapter";

  async findMany(args: FindManyArgs<WalletEntity>): Promise<WalletEntity[]> {
    const { limit, offset, where, order_by } = args;
    return [];
  }

  async findOne(args: FindOneArgs<WalletEntity>): Promise<WalletEntity | null> {
    const { address } = args.where;
    
    // 提取实际的字符串值（处理 QueryOperators）
    const addressValue = typeof address === 'string' ? address : address?.$eq;
    
    if (!addressValue) {
      throw {
        status: 400,
        message: "Invalid arguments",
      };
    }
    const balance = await handler.getBalance(addressValue);
    return {
      address: addressValue,
      balance: balance.toString(),
      network: "solana",
      token: {
        symbol: handler.symbol,
        decimals: 9,
      },
    };
  }

  async create(args: CreationArgs<WalletEntity>): Promise<WalletEntity> {
    const { address, balance, network } = args.data;
    if (!address || !balance || !network) {
      throw {
        status: 400,
        message: "Invalid arguments",
      };
    }
    return {
      address: address,
      balance: balance,
      network: network,
    };
  }

  async update(args: UpdateArgs<WalletEntity>): Promise<WalletEntity> {
    const { address, balance, network } = args.data;
    if (!address || !balance || !network) {
      throw {
        status: 400,
        message: "Invalid arguments",
      };
    }
    return {
      address: address,
      balance: balance,
      network: network,
    };
  }

  async delete(args: DeletionArgs<WalletEntity>): Promise<boolean> {
    return true;
  }
}
