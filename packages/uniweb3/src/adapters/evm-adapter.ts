import { BaseAdapter, type FindOneArgs } from "@unilab/urpc-core";
import { createPublicClient, http, formatEther, Chain } from "viem";
import type { WalletEntity } from "../entities/wallet";
import { getChain } from "../utils";

export class EVMAdapter extends BaseAdapter<WalletEntity> {
  static displayName = "EVMAdapter";

  private async getBalanceByChain(
    address: string,
    chain: Chain
  ): Promise<number> {
    try {
      const client = createPublicClient({
        chain,
        transport: http(),
      });

      const balanceInWei = await client.getBalance({
        address: address as `0x${string}`,
      });

      return parseFloat(formatEther(balanceInWei));
    } catch (error) {
      throw new Error(
        `Failed to get EVM balance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async getBalanceByRpcUrl(
    address: string,
    rpcUrl: string
  ): Promise<{
    balance: number;
    chainId: number;
  }> {
    try {
      const client = createPublicClient({
        transport: http(rpcUrl),
      });

      const balanceInWei = await client.getBalance({
        address: address as `0x${string}`,
      });

      const balance = parseFloat(formatEther(balanceInWei));

      const chainId = await client.getChainId();

      return {
        balance,
        chainId,
      };
    } catch (error) {
      throw new Error(
        `Failed to get EVM balance: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async findOne(args: FindOneArgs<WalletEntity>): Promise<WalletEntity | null> {
    const { address, chainId, rpcUrl } = args.where;

    if (!address && !chainId && !rpcUrl) {
      throw {
        status: 400,
        message: "Invalid arguments",
      };
    }

    if (address && chainId) {
      const chain = getChain(chainId);
      if (!chain) {
        throw {
          status: 400,
          message: `Unsupported chainId: ${chainId} }`,
        };
      }

      const balance = await this.getBalanceByChain(address, chain);

      return {
        address: address,
        balance: balance.toString(),
        chainId: chain.id,
        rpcUrl: chain.rpcUrls.default.http[0],
        source: "evm",
        token: {
          symbol: chain.nativeCurrency.symbol,
          decimals: chain.nativeCurrency.decimals,
        },
      };
    }

    if (address && rpcUrl) {
      const { balance, chainId } = await this.getBalanceByRpcUrl(
        address,
        rpcUrl
      );
      const chain = getChain(chainId);
      if (!chain) {
        throw {
          status: 400,
          message: `Unsupported chainId: ${chainId} }`,
        };
      }
      return {
        address,
        rpcUrl,
        chainId,
        balance: balance.toString(),
        source: "evm",
        token: {
          symbol: chain.nativeCurrency.symbol,
          decimals: chain.nativeCurrency.decimals,
        },
      };
    }

    return null;
  }
}
