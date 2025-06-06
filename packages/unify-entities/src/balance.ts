import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ethers } from "ethers";

// 网络处理器接口
interface NetworkHandler {
  getBalance(address: string): Promise<number>;
  symbol: string;
}

// Solana 处理器
class SolanaHandler implements NetworkHandler {
  public symbol = "SOL";
  private connection: Connection;

  constructor() {
    this.connection = new Connection("https://api.mainnet-beta.solana.com");
  }

  async getBalance(address: string): Promise<number> {
    const publicKey = new PublicKey(address);
    const balanceInLamports = await this.connection.getBalance(publicKey);
    return balanceInLamports / LAMPORTS_PER_SOL;
  }
}

// EVM 兼容网络处理器基类
class EVMHandler implements NetworkHandler {
  public symbol: string;
  private provider: ethers.JsonRpcProvider;

  constructor(rpcUrl: string, symbol: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.symbol = symbol;
  }

  async getBalance(address: string): Promise<number> {
    const balanceInWei = await this.provider.getBalance(address);
    return parseFloat(ethers.formatEther(balanceInWei));
  }
}

// 网络配置
const NETWORK_CONFIG = {
  solana: () => new SolanaHandler(),
  ethereum: () => new EVMHandler("https://ethereum-rpc.publicnode.com", "ETH"),
  iotex: () => new EVMHandler("https://babel-api.mainnet.iotex.io", "IOTX"),
  // 可以轻松添加更多网络
  // polygon: () => new EVMHandler("https://polygon-rpc.com", "MATIC"),
  // bsc: () => new EVMHandler("https://bsc-dataseed.binance.org", "BNB"),
} as const;

type SupportedNetwork = keyof typeof NETWORK_CONFIG;

// 网络处理器工厂
class NetworkHandlerFactory {
  static create(network: string): NetworkHandler {
    const normalizedNetwork = network.toLowerCase() as SupportedNetwork;

    if (!NETWORK_CONFIG[normalizedNetwork]) {
      throw new Error(
        `Unsupported network: ${network}. Supported networks: ${Object.keys(
          NETWORK_CONFIG
        ).join(", ")}`
      );
    }

    return NETWORK_CONFIG[normalizedNetwork]();
  }

  static getSupportedNetworks(): string[] {
    return Object.keys(NETWORK_CONFIG);
  }
}

export const BalanceEntity = {
  findOne: async (args?: { id: string; network: SupportedNetwork }) => {
    const { id: address, network } = args || {};

    // 输入验证
    if (!address) {
      throw {
        status: 400,
        message: "Address is required",
      };
    }

    if (!network) {
      throw {
        status: 400,
        message: `Network is required. Supported networks: ${NetworkHandlerFactory.getSupportedNetworks().join(
          ", "
        )}`,
      };
    }

    try {
      // 创建网络处理器
      const handler = NetworkHandlerFactory.create(network);

      // 获取余额
      const balance = await handler.getBalance(address);

      return {
        balance,
        symbol: handler.symbol,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        `Error fetching balance for ${address} on ${network}:`,
        error
      );

      // 如果是我们自定义的错误，直接抛出
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }

      throw {
        status: 500,
        message: `Failed to fetch balance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  },
};
