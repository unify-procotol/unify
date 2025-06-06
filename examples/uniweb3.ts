import { createSource } from "unify-server";
import { BalanceEntity } from "unify-entities";

const source = createSource();

// BalanceEntity.findOne({
//   id: "0x1234567890123456789012345678901234567890",
//   network: "solana",
// });

// curl -X GET 'http://localhost:3000/uniweb3/balance/0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB?network=iotex'
// curl -X GET 'http://localhost:3000/uniweb3/balance/11111111111111111111111111111112?network=solana'

source.register({
  id: "uniweb3",
  entities: {
    balance: BalanceEntity,
  },
});

const app = source.getApp();

console.log("🚀 Server is starting on port 3000...");
console.log(
  app.routes.map((route) => `- ${route.method} ${route.path}`).join("\n")
);

export default {
  port: 3000,
  fetch: app.fetch,
};
