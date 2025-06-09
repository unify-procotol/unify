import {
  Entity,
  BalanceQueryArgs,
  BalanceResponse,
  NetworkHandler,
} from "../types";

export class BalanceEntity implements Entity {
  constructor(private networkHandler: NetworkHandler) {}

  async findOne(args?: BalanceQueryArgs): Promise<BalanceResponse> {
    const { id: address, network } = args || {};

    // 输入验证
    if (!address) {
      throw {
        status: 400,
        message: "Address is required",
      };
    }

    try {
      // 获取余额
      const balance = await this.networkHandler.getBalance(address);

      return {
        balance,
        symbol: this.networkHandler.symbol,
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
  }
}
