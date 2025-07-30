import { Plugin } from "@unilab/urpc-core";
import { CurrencyEntity } from "./entities";
import { AlphaVantageAdapter } from "./adapters/alpha-vantage";
import { FinanceOptions } from "./utils/type";

export const FinancePlugin = (options: FinanceOptions): Plugin => {
  return {
    entities: [CurrencyEntity],
    adapters: [
      {
        source: "alpha-vantage",
        entity: "CurrencyEntity",
        adapter: new AlphaVantageAdapter(options),
      },
    ],
  };
};
