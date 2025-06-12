import { createClient } from "@unify-api/client";
import { EVMPlugin, SolanaPlugin } from "@unify-api/plugins/web3";

const evmClient = createClient(EVMPlugin, {
  baseURL: "http://localhost:3000",
});

const solanaClient = createClient(SolanaPlugin, {
  baseURL: "http://localhost:3000",
});

const client = createClient(
  {
    EVMPlugin,
    SolanaPlugin,
  },
  {
    baseURL: "http://localhost:3000",
  }
);

async function demo() {
  try {
    const evmRes = await evmClient.balance.findOne({
      where: {
        address: "0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB",
        network: "iotex",
      },
    });
    console.log("evmRes:", evmRes.data);

    const solanaRes = await solanaClient.balance.findOne({
      where: {
        address: "11111111111111111111111111111112",
      },
    });
    console.log("solanaRes:", solanaRes.data);

    // const evmRes = await client.EVMPlugin.balance.findOne({
    //   where: {
    //     address: "0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB",
    //     network: "iotex",
    //   },
    // });
    // console.log("evmRes:", evmRes.data);

    // const solanaRes = await client.SolanaPlugin.balance.findOne({
    //   where: {
    //     address: "11111111111111111111111111111112",
    //   },
    // });

    console.log("solanaRes:", solanaRes.data);
  } catch (error) {
    console.log("❌ 错误:", error.message);
  }
}

demo();
