import { Plugin } from "@unilab/urpc-core";
import { StockEntity } from "./entities/stock";
import { YahooAdapter } from "./adapters/yahoo";
import { SeekingAlphaAdapter } from "./adapters/seeking-alpha";
import { CompanyEntity } from "./entities/company";
import { CompanyLookupAdapter } from "./adapters/companmy-lookup";

export const FinancePlugin = (): Plugin => {
  return {
    entities: [StockEntity, CompanyEntity],
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
      {
        source: "company-lookup",
        entity: "company",
        adapter: new CompanyLookupAdapter(),
      },
    ],
  };
};
