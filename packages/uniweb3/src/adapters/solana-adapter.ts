import { BaseAdapter, type FindOneArgs } from "@unilab/urpc-core";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import type { WalletEntity } from "../entities/wallet";

export class SolanaAdapter extends BaseAdapter<WalletEntity> {
  static displayName = "SolanaAdapter";
  private connection: Connection;
  private rpcUrl: string = "https://api.mainnet-beta.solana.com";

  constructor() {
    super();
    this.connection = new Connection(this.rpcUrl);
  }

  private async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balanceInLamports = await this.connection.getBalance(publicKey);
      return balanceInLamports / LAMPORTS_PER_SOL;
    } catch (error) {
      throw new Error(
        `Failed to get Solana balance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async findOne(args: FindOneArgs<WalletEntity>): Promise<WalletEntity | null> {
    const { address, rpcUrl } = args.where;

    if (!address) {
      throw {
        status: 400,
        message: "Invalid arguments",
      };
    }

    if (rpcUrl) {
      this.rpcUrl = rpcUrl;
      this.connection = new Connection(this.rpcUrl);
    }

    const balance = await this.getBalance(address);
    return {
      address: address,
      balance: balance.toString(),
      rpcUrl: this.rpcUrl,
      chainId: undefined,
      source: "solana",
      token: {
        symbol: "SOL",
        decimals: 9,
      },
    };
  }
}
