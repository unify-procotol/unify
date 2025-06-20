import { Repo, UnifyClient } from "@unify/client";
import { WalletEntity } from "@unify/uniweb3";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const fetchEvmBalance = async () => {
  try {
    const data = await Repo<WalletEntity>("wallet", "evm").findOne({
      where: {
        address: "0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB",
        network: "iotex",
      },
    });
    console.log("fetchEvmBalance===>", data);
  } catch (error) {
    console.error(error);
  }
};

const fetchSolanaBalance = async () => {
  try {
    const data = await Repo<WalletEntity>("wallet", "solana").findOne({
      where: {
        address: "11111111111111111111111111111112",
      },
    });
    console.log("fetchSolanaBalance===>", data);
  } catch (error) {
    console.error(error);
  }
};

fetchEvmBalance();
fetchSolanaBalance();
