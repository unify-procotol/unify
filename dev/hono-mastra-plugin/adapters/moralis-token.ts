import {
  BaseAdapter,
  ErrorCodes,
  FindOneArgs,
  URPCError,
} from "@unilab/urpc-core";
import { TokenEntity } from "../entities/token";
import Moralis from "moralis";

export class MoralisTokenAdapter extends BaseAdapter<TokenEntity> {
  
  async findOne(args: FindOneArgs<TokenEntity>): Promise<TokenEntity | null> {
    const { address } = args.where;

    if (!address) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "Address is required");
    }

    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY!,
    });

    const response = await Moralis.EvmApi.token.getTokenPrice({
      include: "percent_change",
      address: address,
    });

    const data = response.raw;

    return {
      name: data.tokenName || "",
      address: data.tokenAddress || "",
      symbol: data.tokenSymbol || "",
      decimals: data.tokenDecimals || "",
      usdPrice: data.usdPrice || 0,
      "24hrPercentChange": data["24hrPercentChange"],
      exchangeAddress: data.exchangeAddress,
    };
  }
}
