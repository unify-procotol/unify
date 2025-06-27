import { PairEntity } from "./entities/pair";
import { repo, UnifyClient } from "@unilab/unify-client";

// 初始化 UnifyClient
UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const fetchPair = async () => {
  try {
    console.log("🔍 Fetching price for IOTX/IOUSDT...");
    console.log("⏳ This may take a moment as we're calling external APIs...");
    
    const data = await repo<PairEntity>("PairEntity", "mimo").findOne({
      where: {
        pair: "iotx/iousdt",
      },
    });
    
    if (data) {
      console.log("✅ Trading pair found:");
      console.log(`   💱 Pair: ${data.pair}`);
      console.log(`   💰 Price: 1 ${data.token0Symbol} = ${parseFloat(data.price).toFixed(6)} ${data.token1Symbol}`);
      console.log(`   📊 Price Impact: ${data.priceImpact}%`);
      console.log(`   📈 Quote: ${data.quote}`);
      console.log(`   🛣️ Route: ${data.route.length} step(s)`);
      console.log(`   ⏰ Timestamp: ${new Date(data.timestamp).toLocaleString()}`);
      
      // 显示路由信息
      if (data.route.length > 0) {
        console.log(`   📍 Token Path:`);
        data.route[0].tokenPath.forEach((token: any, index: number) => {
          console.log(`      ${index + 1}. ${token.symbol} (${token.address})`);
        });
      }
      
      console.log("\n🎉 Mimo Trading Pair query completed successfully!");
    } else {
      console.log("❌ No trading pair data found for IOTX/IOUSDT");
    }
  } catch (error) {
    console.error("❌ Error during query:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      
      // 提供一些常见错误的解决建议
      if (error.message.includes("aborted")) {
        console.log("\n💡 Suggestion: The request was aborted, possibly due to timeout.");
        console.log("   • Make sure the server is running: bun run dev");
        console.log("   • The Mimo API call might be taking longer than expected");
        console.log("   • Check server logs for more details");
      } else if (error.message.includes("fetch") || error.message.includes("connection")) {
        console.log("\n💡 Suggestion: Network connectivity issue.");
        console.log("   • Make sure the server is running on http://localhost:3000");
        console.log("   • Check if the server port is accessible");
      }
    }
  }
};

fetchPair(); 