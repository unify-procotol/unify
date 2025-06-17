import { ethers } from "ethers";
import { NetworkHandler } from "./base";

export class EVMHandler implements NetworkHandler {
  public symbol: string;
  private provider: ethers.JsonRpcProvider;

  constructor(rpcUrl: string, symbol: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.symbol = symbol;
  }

  async getBalance(address: string): Promise<number> {
    try {
      const balanceInWei = await this.provider.getBalance(address);
      return parseFloat(ethers.formatEther(balanceInWei));
    } catch (error) {
      throw new Error(
        `Failed to get EVM balance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

export const EVM_CHAIN_CONFIG = {
  1: () => new EVMHandler("https://ethereum-rpc.publicnode.com", "ETH"),
  4689: () => new EVMHandler("https://babel-api.mainnet.iotex.io", "IOTX"),
  137: () => new EVMHandler("https://polygon-rpc.com", "MATIC"),
  56: () => new EVMHandler("https://bsc-dataseed.binance.org", "BNB"),
} as const;

export type EVMChainId = keyof typeof EVM_CHAIN_CONFIG;

export function createEVMHandler(chainId: EVMChainId) {
  if (!EVM_CHAIN_CONFIG[chainId]) {
    throw new Error(
      `Unsupported EVM chain: ${chainId}. Supported chains: ${Object.keys(
        EVM_CHAIN_CONFIG
      ).join(", ")}`
    );
  }

  return EVM_CHAIN_CONFIG[chainId]();
}
