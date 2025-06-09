import { Plugin } from "../types";
import { BalanceEntity } from "../entities/balance";
import { createEVMHandler } from "../handlers/evm";

// 创建多个EVM网络的处理器
const evmNetworkHandlers = {
  ethereum: createEVMHandler("ethereum"),
  iotex: createEVMHandler("iotex"),
  polygon: createEVMHandler("polygon"),
  bsc: createEVMHandler("bsc"),
};

// 创建支持多网络的EVM余额实体
class EVMBalanceEntity extends BalanceEntity {
  async findOne(args?: any): Promise<any> {
    const { network } = args || {};

    if (!network) {
      throw {
        status: 400,
        message: "Network is required for EVM plugin",
      };
    }

    // 根据网络选择对应的处理器
    const handler =
      evmNetworkHandlers[network as keyof typeof evmNetworkHandlers];
    if (!handler) {
      throw {
        status: 400,
        message: `Unsupported EVM network: ${network}. Supported networks: ${Object.keys(
          evmNetworkHandlers
        ).join(", ")}`,
      };
    }

    // 临时替换网络处理器
    const originalHandler = (this as any).networkHandler;
    (this as any).networkHandler = handler;

    try {
      return await super.findOne(args);
    } finally {
      // 恢复原始处理器
      (this as any).networkHandler = originalHandler;
    }
  }
}

// 创建EVM插件
export const EVMPlugin: Plugin = {
  id: "evm_plugin",
  entities: {
    balance: new EVMBalanceEntity(evmNetworkHandlers.ethereum), // 默认使用以太坊
  },
};
