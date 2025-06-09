import { createSource } from "unify-api";
import { SolanaPlugin, EVMPlugin } from "@unify-api/plugins/web3";

const source = createSource();

// source.register(EVMPlugin);
// source.register(SolanaPlugin);
source.register([EVMPlugin, SolanaPlugin]);

const app = source.getApp();

console.log("🚀 Server is starting on port 3000...");
console.log(
  app.routes.map((route) => `- ${route.method} ${route.path}`).join("\n")
);

export default {
  port: 3000,
  fetch: app.fetch,
};

// curl -X GET 'http://localhost:3000/balance/0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB?network=iotex&sourceId=evm_plugin'
// curl -X GET 'http://localhost:3000/balance/11111111111111111111111111111112?sourceId=solana_plugin'
