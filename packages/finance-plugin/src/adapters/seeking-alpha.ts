import {
  BaseAdapter,
  ErrorCodes,
  FindManyArgs,
  FindOneArgs,
  URPCError,
} from "@unilab/urpc-core";
import { StockEntity } from "../entities/stock";

export class SeekingAlphaAdapter extends BaseAdapter<StockEntity> {
  static displayName = "SeekingAlphaAdapter";

  async findMany(args: FindManyArgs<StockEntity>): Promise<StockEntity[]> {
    const where = args.where;

    if (!where?.ticker) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "ticker is required");
    }

    const ticker =
      typeof where.ticker === "string" ? where.ticker : where.ticker.eq;
    if (!ticker) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "ticker is required");
    }

    if (!process.env.RAPID_API_KEY) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "RAPID_API_KEY is not set");
    }

    const tickers = await fetch(
      `https://seeking-alpha.p.rapidapi.com/v2/auto-complete?query=${ticker}&type=symbols&size=${args.limit}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "seeking-alpha.p.rapidapi.com",
        },
      }
    ).then((res) => res.json());

    const sa_ids = tickers.symbols.map((ticker: any) => ticker.id);
    if (sa_ids.length === 0) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "No tickers found");
    }
    const res = await fetch(
      `https://seeking-alpha.p.rapidapi.com/market/get-realtime-quotes?sa_ids==${sa_ids.join(
        ","
      )}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "seeking-alpha.p.rapidapi.com",
        },
      }
    ).then((res) => res.json());
    if (!res.real_time_quotes || res.real_time_quotes.length === 0) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "No data found");
    }
    const data = res.real_time_quotes.map((quote: any) => ({
      ticker: quote.symbol,
      price: (quote.ext_price || "-").toString(),
      open: (quote.open || "-").toString(),
      high: (quote.high || "-").toString(),
      low: (quote.low || "-").toString(),
      lastTradingTime: (new Date(quote.last_time).getTime() || "-").toString(),
      previousClose: (quote.prev_close || "-").toString(),
      marketCap: "-",
    }));
    return data;
  }
}
