import {
  BaseAdapter,
  ErrorCodes,
  FindOneArgs,
  URPCError,
} from "@unilab/urpc-core";
import { CurrencyEntity } from "../entities";
import { FinanceOptions } from "../utils/type";

export class AlphaVantageAdapter extends BaseAdapter<CurrencyEntity> {
  static displayName = "AlphaVantageAdapter";

  private alphaVantageApiKey: string;

  constructor(options: FinanceOptions) {
    super();
    this.alphaVantageApiKey = options.alphaVantageApiKey;
  }

  async findOne(
    args: FindOneArgs<CurrencyEntity>
  ): Promise<CurrencyEntity | null> {
    const { function: functionName, symbol } = args.where;

    if (!symbol) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "Symbol is required");
    }

    if (!functionName) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "Function is required");
    }

    const res = await fetch(
      `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&apikey=${this.alphaVantageApiKey}`
    );
    const data = await res.json();
    console.log(data);

    return {
      function: functionName,
      symbol,
      'Time Series (Daily)': data['Time Series (Daily)'],
    };
  }
}
