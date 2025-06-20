import type {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
} from "@unify/core";
import type { WalletEntity } from "../entities/wallet";
import { createEVMHandler, EVMHandler, EVMNetwork } from "../handlers/evm";

const evmHandlers: Record<EVMNetwork, EVMHandler> = {
  ethereum: createEVMHandler("ethereum"),
  iotex: createEVMHandler("iotex"),
  polygon: createEVMHandler("polygon"),
  bsc: createEVMHandler("bsc"),
};

export class EVMAdapter implements DataSourceAdapter<WalletEntity> {
  async findMany(args: FindManyArgs<WalletEntity>): Promise<WalletEntity[]> {
    return [];
  }

  async findOne(args: FindOneArgs<WalletEntity>): Promise<WalletEntity | null> {
    const { address, network } = args.where;
    if (!address || !network) {
      throw {
        status: 400,
        message: "Invalid arguments",
      };
    }

    const handler = evmHandlers[network as EVMNetwork];
    if (!handler) {
      throw {
        status: 400,
        message: `Unsupported network: ${network}. Supported networks: ${Object.keys(
          evmHandlers
        ).join(", ")}`,
      };
    }
    const balance = await handler.getBalance(address);
    return {
      address: address,
      balance: balance.toString(),
      network: network,
      token: {
        symbol: handler.symbol,
        decimals: 18,
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
    return false;
  }
}
