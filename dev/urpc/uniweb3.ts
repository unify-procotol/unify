import { repo, URPC } from "@unilab/urpc";
import { WalletPlugin } from "@unilab/uniweb3";
import { ViemNetworkEntity, WalletEntity } from "@unilab/uniweb3/entities";
import { formatEther } from "viem";

URPC.init({
  plugins: [WalletPlugin],
  entityConfigs: {
    wallet: {
      defaultSource: "evm",
    },
    viemnetwork: {
      defaultSource: "viem",
    },
  },
});

async function demo() {
  // const data = await repo({
  //   entity: WalletEntity,
  //   source: "evm",
  // }).findOne({
  //   where: {
  //     address: "0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB",
  //     // chainId: 4689,
  //     rpcUrl: "https://babel-api.mainnet.iotex.io"
  //   },
  // });

  const data = await repo({
    entity: WalletEntity,
    source: "solana",
  }).findOne({
    where: {
      address: "11111111111111111111111111111112",
      // rpcUrl: "https://api.mainnet-beta.solana.com"
    },
  });

  console.log("data:", data);
  // const client = data?.client;
  // if (client) {
  //   const blockNumber = await client.getBlockNumber();
  //   console.log("blockNumber:", blockNumber);
  // }

  // const connection = data?.connection;
  // if (connection) {
  //   const blockHeight = await connection.getBlockHeight();
  //   console.log("blockHeight:", blockHeight);
  // }

  // const res = await repo({
  //   entity: ViemNetworkEntity,
  //   source: "viem",
  // }).upsert({
  //   where: {
  //     chainId: 1,
  //   },
  //   create: {
  //     chainId: 1,
  //     name: "Ethereum",
  //     rpcUrl: "https://eth.merkle.io",
  //   },
  //   update: {
  //     name: "Ethereum",
  //     rpcUrl: "https://eth.merkle.io",
  //   },
  // });

  // console.log("res:", res);

  // const balance = await res.client?.getBalance({
  //   address: "0x8E76cAEbaca6c0e390F825fa44Dfd1fCb74B9C36",
  // });

  // const balanceInEth = balance ? formatEther(balance) : "0";
  // console.log("balance:", balanceInEth);
}

demo();
