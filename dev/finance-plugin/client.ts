import { repo, URPC } from "@unilab/urpc";
import { CurrencyEntity } from "@unilab/finance/entities";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const currency = await repo<CurrencyEntity>({
  entity: "currency",
}).findOne({
  where: {
    function: "TIME_SERIES_DAILY",
    symbol: "IBM",
  },
});
console.log("currency=>", currency);
