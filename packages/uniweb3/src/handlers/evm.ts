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

export const EVM_NETWORK_CONFIG = {
  ethereum: () => new EVMHandler("https://ethereum-rpc.publicnode.com", "ETH"),
  iotex: () => new EVMHandler("https://babel-api.mainnet.iotex.io", "IOTX"),
  polygon: () => new EVMHandler("https://polygon-rpc.com", "MATIC"),
  bsc: () => new EVMHandler("https://bsc-dataseed.binance.org", "BNB"),
} as const;

export type EVMNetwork = keyof typeof EVM_NETWORK_CONFIG;

export function createEVMHandler(network: string): NetworkHandler {
  const normalizedNetwork = network.toLowerCase() as EVMNetwork;

  if (!EVM_NETWORK_CONFIG[normalizedNetwork]) {
    throw new Error(
      `Unsupported EVM network: ${network}. Supported networks: ${Object.keys(
        EVM_NETWORK_CONFIG
      ).join(", ")}`
    );
  }

  return EVM_NETWORK_CONFIG[normalizedNetwork]();
}
