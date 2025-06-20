import { Unify } from "@unify/server";
import { SolanaAdapter, EVMAdapter } from "@unify/uniweb3";

const app = Unify.register([
  { source: "solana", adapter: new SolanaAdapter() },
  { source: "evm", adapter: new EVMAdapter() },
]);

console.log("🚀 Starting Unify server on port 3000");
console.log("📊 Available endpoints:");
console.log(
  '  GET  /wallet/find_one?source=solana&where={"address":"wallet_address"} - Get Solana wallet balance'
);
console.log(
  '  GET  /wallet/find_one?source=evm&where={"address":"wallet_address","network":"ethereum"} - Get EVM wallet balance'
);

export default {
  port: 3000,
  fetch: app.fetch,
};
