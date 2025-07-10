import { BaseAdapter, type FindOneArgs } from "@unilab/urpc-core";
import { PairEntity } from "../entities/pair";

interface TokenInfo {
  id: string;
  symbol: string;
  address: string;
  decimals: number;
  name: string;
  current_price: number;
}

interface MimoTradeRequest {
  chainId: number;
  protocols: string;
  token0: {
    address: string;
    decimals: number;
  };
  token1: {
    address: string;
    decimals: number;
  };
  recipient: string;
  amount: string;
  slippage: {
    numerator: number;
    denominator: number;
  };
  tradeType: string;
}

interface MimoTradeResponse {
  route: Array<{
    tokenPath: Array<{
      chainId: number;
      decimals: number;
      symbol: string;
      name: string;
      address: string;
    }>;
    protocol: string;
  }>;
  quote: {
    numerator: string;
  };
  trade: {
    priceImpact: string;
  };
}

export class MimoAdapter extends BaseAdapter<PairEntity> {
  static readonly adapterName = "MimoAdapter";
  private tokenListCache: TokenInfo[] | null = null;
  private readonly IOTEX_TOKEN_LIST_URL =
    "https://api.iopay.me/api/rest/token_list/iotex";
  private readonly MIMO_TRADE_API = "https://swap-api.mimo.exchange/api/trade";
  private readonly DEFAULT_RECIPIENT =
    "0x610CBDa6f0037B4141A5B949f56479106BeCb1E9";

  async findOne(args: FindOneArgs<PairEntity>): Promise<PairEntity | null> {
    try {
      const pairString = args.where.pair?.toLowerCase() || "";
      const [token0Symbol, token1Symbol] = pairString.split("/");

      if (!token0Symbol || !token1Symbol) {
        throw new Error(
          `Invalid pair format: ${pairString}. Expected format: 'token0/token1'`
        );
      }

      console.log(
        `🔍 Searching for pair: ${token0Symbol.toUpperCase()}/${token1Symbol.toUpperCase()}`
      );

      // Get token information
      const tokenList = await this.getTokenList();
      const token0Info = this.findTokenBySymbol(tokenList, token0Symbol);
      const token1Info = this.findTokenBySymbol(tokenList, token1Symbol);

      if (!token0Info || !token1Info) {
        console.error(
          `❌ Token not found. Token0: ${token0Info ? "✅" : "❌"}, Token1: ${
            token1Info ? "✅" : "❌"
          }`
        );
        return null;
      }

      console.log(
        `📍 Found tokens - ${token0Info.symbol}: ${token0Info.address}, ${token1Info.symbol}: ${token1Info.address}`
      );

      // Build trade request
      const tradeRequest: MimoTradeRequest = {
        chainId: 4689,
        protocols: "v2,v3,mixed",
        token0: {
          address:
            token0Symbol.toUpperCase() === "IOTX" ? "IOTX" : token0Info.address,
          decimals: token0Info.decimals,
        },
        token1: {
          address: token1Info.address,
          decimals: token1Info.decimals,
        },
        recipient: this.DEFAULT_RECIPIENT,
        amount: "1000000000000000000", // 1 token in wei
        slippage: {
          numerator: 50,
          denominator: 10000,
        },
        tradeType: "EXACT_INPUT",
      };

      console.log(
        `📡 Calling Mimo API with request:`,
        JSON.stringify(tradeRequest, null, 2)
      );

      // Call Mimo API
      const response = await fetch(this.MIMO_TRADE_API, {
        method: "POST",
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7",
          "cache-control": "no-cache",
          "content-type": "application/json",
          origin: "https://mimo.exchange",
          pragma: "no-cache",
          referer: "https://mimo.exchange/",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: JSON.stringify(tradeRequest),
      });

      if (!response.ok) {
        throw new Error(
          `Mimo API error: ${response.status} ${response.statusText}`
        );
      }

      const tradeData: MimoTradeResponse = await response.json();
      console.log(
        `✅ Received Mimo response:`,
        JSON.stringify(tradeData, null, 2)
      );

      // Calculate price
      const quote = parseFloat(tradeData.quote.numerator);
      const inputAmount = 1; // 1 token
      const price = quote / Math.pow(10, token1Info.decimals) / inputAmount;

      // Build return object
      const pairEntity = {
        pair: `${token0Symbol.toUpperCase()}/${token1Symbol.toUpperCase()}`,
        token0Symbol: token0Info.symbol,
        token1Symbol: token1Info.symbol,
        token0Address: token0Info.address,
        token1Address: token1Info.address,
        price: price.toString(),
        priceImpact: tradeData.trade.priceImpact,
        quote: tradeData.quote.numerator,
        route: tradeData.route,
        chainId: 4689,
        timestamp: new Date().toISOString(),
      };

      console.log(
        `💰 Final price: 1 ${token0Info.symbol} = ${price.toFixed(6)} ${
          token1Info.symbol
        }`
      );
      console.log(pairEntity);
      return pairEntity;
    } catch (error) {
      console.error("❌ Error in MimoAdapter.findOne:", error);
      // Simplified error handling, similar to post.ts approach
      return null;
    }
  }

  private async getTokenList(): Promise<TokenInfo[]> {
    if (this.tokenListCache) {
      return this.tokenListCache;
    }

    try {
      console.log(`📥 Fetching token list from: ${this.IOTEX_TOKEN_LIST_URL}`);
      const response = await fetch(this.IOTEX_TOKEN_LIST_URL);

      if (!response.ok) {
        throw new Error(`Failed to fetch token list: ${response.status}`);
      }

      const data = await response.json();
      const tokenList: TokenInfo[] = data.token_list_v4 || [];
      this.tokenListCache = tokenList;
      console.log(`✅ Loaded ${tokenList.length} tokens from IoTeX`);

      return tokenList;
    } catch (error) {
      console.error("❌ Error fetching token list:", error);
      // Return empty array to avoid throwing error
      return [];
    }
  }

  private findTokenBySymbol(
    tokenList: TokenInfo[],
    symbol: string
  ): TokenInfo | null {
    const upperSymbol = symbol.toUpperCase();

    // Special handling for IOTX
    if (upperSymbol === "IOTX") {
      return {
        id: "native-iotx",
        symbol: "IOTX",
        address: "IOTX",
        decimals: 18,
        name: "IoTeX",
        current_price: 0,
      };
    }

    const token = tokenList.find((t) => t.symbol.toUpperCase() === upperSymbol);
    return token || null;
  }
}
