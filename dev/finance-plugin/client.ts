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


const company = await repo<CompanyEntity>({
  entity: "company",
}).findCompanies({
  where: {
    name: "Apple",
  },
});
console.log("company=>", company);