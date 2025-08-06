import { Fields } from "@unilab/urpc-core";

export class StockEntity {
  static displayName = "StockEntity";

  @Fields.string({
    description: "The ticker of the stock",
  })
  ticker = "";

  @Fields.number({
    description: "The number of tickers to return",
  })
  size?: number;

  @Fields.string({
    description: "The current price of the stock",
  })
  price = "";

  @Fields.string({
    description: "The open price of the stock",
  })
  open = "";

  @Fields.string({
    description: "The high price of the stock",
  })
  high = "";

  @Fields.string({
    description: "The low price of the stock",
  })
  low = "";

  @Fields.string({
    description: "The last trading time of the stock",
  })
  lastTradingTime = "";

  @Fields.string({
    description: "The previous close price of the stock",
  })
  previousClose = "";

  @Fields.string({
    description: "The market cap of the stock",
  })
  marketCap?: string;
}
