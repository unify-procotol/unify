import { BaseAdapter, type FindOneArgs } from "@unilab/urpc-core";
import type { WalletEntity } from "../entities/wallet";
import { createEVMHandler, EVMHandler, EVMNetwork } from "../handlers/evm";

const evmHandlers: Record<EVMNetwork, EVMHandler> = {
  ethereum: createEVMHandler("ethereum"),
  iotex: createEVMHandler("iotex"),
  polygon: createEVMHandler("polygon"),
  bsc: createEVMHandler("bsc"),
};

export class EVMAdapter extends BaseAdapter<WalletEntity> {
  static readonly adapterName = "EVMAdapter";

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
}
