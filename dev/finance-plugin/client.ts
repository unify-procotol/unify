import { repo, URPC } from "@unilab/urpc";
import { StockEntity } from "@unilab/finance/entities";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const stock = await repo<StockEntity>({
  entity: "stock",
}).findOne({
  where: {
    ticker: "TSLA",
  },
});
console.log("stock=>", stock);
