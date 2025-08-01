import {
  BaseAdapter,
  ErrorCodes,
  FindOneArgs,
  URPCError,
} from "@unilab/urpc-core";
import { StockEntity } from "../entities/stock";

export class YahooAdapter extends BaseAdapter<StockEntity> {
  static displayName = "YahooAdapter";

  async findOne(args: FindOneArgs<StockEntity>): Promise<StockEntity | null> {
    const { ticker } = args.where;

    if (!process.env.RAPID_API_KEY) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "RAPID_API_KEY is not set");
    }

    if (!ticker) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "ticker is required");
    }

    const [realTimeQuote, snapshotsQuote] = await Promise.all([
      fetch(
        `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quote?ticker=${ticker}&type=STOCKS`,
        {
          headers: {
            "X-RapidAPI-Key": process.env.RAPID_API_KEY,
            "X-RapidAPI-Host": "yahoo-finance15.p.rapidapi.com",
          },
        }
      ).then((res) => res.json()),
      fetch(
        `https://yahoo-finance15.p.rapidapi.com/api/v1/markets/stock/quotes?ticker=${ticker}`,
        {
          headers: {
            "X-RapidAPI-Key": process.env.RAPID_API_KEY,
            "X-RapidAPI-Host": "yahoo-finance15.p.rapidapi.com",
          },
        }
      ).then((res) => res.json()),
    ]);
    const { primaryData } = realTimeQuote.body;
    if (!primaryData) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "No data found");
    }
    const [data] = snapshotsQuote?.body;
    return {
      ticker,
      price: primaryData.lastSalePrice.toString(),
      open: data.regularMarketOpen.toString(),
      high: data.regularMarketDayHigh.toString(),
      low: data.regularMarketDayLow.toString(),
      lastTradingTime: data?.regularMarketTime,
      previousClose: data?.regularMarketPreviousClose.toString(),
      marketCap: data?.marketCap.toString(),
    };
  }
}
