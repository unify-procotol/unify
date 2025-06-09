import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { NetworkHandler } from "../types";

export class SolanaHandler implements NetworkHandler {
  public symbol = "SOL";
  private connection: Connection;

  constructor() {
    this.connection = new Connection("https://api.mainnet-beta.solana.com");
  }

  async getBalance(address: string): Promise<number> {
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
}
