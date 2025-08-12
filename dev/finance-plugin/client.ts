import { repo, URPC } from "@unilab/urpc";
import { CompanyEntity, StockEntity } from "@unilab/finance/entities";

URPC.init({
  baseUrl: "https://p01--qsdata-server--p82yxqzl6dpk.code.run/",
  timeout: 10000,
});

const stock = await repo<StockEntity>({
  entity: "StockEntity",
  source: "yahoo",
}).findMany({
  where: {
    ticker: "TSLA",
  },
});
console.log("stock=>", stock);

// const stock = await repo<StockEntity>({
//   entity: "stock",
// }).findMany({
//   where: {
//     ticker: "TSLA",
//   },
//   limit: 10,
// });
// console.log("stock=>", stock);

// const company = await repo<CompanyEntity>({
//   entity: "company",
// }).findMany({
//   where: {
//     name: "Apple",
//   },
// });
// console.log("company=>", company);
