import { Plugin } from "@unilab/urpc-core";
import { StockEntity } from "./entities/stock";
import { YahooAdapter } from "./adapters/yahoo";
import { SeekingAlphaAdapter } from "./adapters/seeking-alpha";

export const FinancePlugin = (): Plugin => {
  return {
    entities: [StockEntity],
    adapters: [
      {
        source: "yahoo",
        entity: "stock",
        adapter: new YahooAdapter(),
      },
      {
        source: "seeking-alpha",
        entity: "stock",
        adapter: new SeekingAlphaAdapter(),
      },
    ],
  };
};
