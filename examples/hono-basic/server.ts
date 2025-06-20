import { Unify } from "@unify/server";
import { SolanaAdapter, EVMAdapter } from "@unify/uniweb3";

// 使用静态方法注册多个 Adapter
const server = Unify.register([
  { source: "solana", adapter: new SolanaAdapter() },
  { source: "evm", adapter: new EVMAdapter() },
]);

console.log("🚀 Starting Unify server on port 3001");
console.log("📊 Available endpoints:");
console.log("  GET  /health - Health check");
console.log(
  '  GET  /wallet/find_one?source=solana&where={"address":"wallet_address"} - Get Solana wallet balance'
);
console.log(
  '  GET  /wallet/find_one?source=evm&where={"address":"wallet_address","network":"ethereum"} - Get EVM wallet balance'
);

export default {
  port: 3001,
  fetch: server.fetch,
};
