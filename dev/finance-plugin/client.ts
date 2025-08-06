import { repo, URPC } from "@unilab/urpc";
import { CompanyEntity, StockEntity } from "@unilab/finance/entities";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

// const stock = await repo<StockEntity>({
//   entity: "stock",
// }).findOne({
//   where: {
//     ticker: "TSLA",
//   },
// });
// console.log("stock=>", stock);

// const stock = await repo<StockEntity>({
//   entity: "stock",
// }).findMany({
//   where: {
//     ticker: "TSLA",
//   },
//   limit: 10,
// });
// console.log("stock=>", stock);

const company = await repo<CompanyEntity>({
  entity: "company",
}).findMany({
  where: {
    name: "Apple",
  },
});
console.log("company=>", company);