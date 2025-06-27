import { repo, UnifyClient } from "@unilab/unify-client";
import { WalletEntity } from "@unilab/uniweb3/entities";
import { useEffect, useState } from "react";

UnifyClient.init({
  baseUrl: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    Authorization: "Bearer your-token-here",
  },
});

export default function Home() {
  const [evmBalanceData, setEvmBalanceData] = useState<any>(null);
  const [solanaBalanceData, setSolanaBalanceData] = useState<any>(null);

  useEffect(() => {
    const fetchEvmBalance = async () => {
      try {
        const data = await repo<WalletEntity>("wallet", "evm").findOne({
          where: {
            address: "0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB",
            network: "iotex",
          },
        });
        if (data) {
          setEvmBalanceData(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchSolanaBalance = async () => {
      try {
        const data = await repo<WalletEntity>("wallet", "solana").findOne({
          where: {
            address: "11111111111111111111111111111112",
          },
        });
        if (data) {
          setSolanaBalanceData(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchEvmBalance();
    fetchSolanaBalance();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-10">
      {evmBalanceData && <p>{JSON.stringify(evmBalanceData, null, 2)}</p>}
      {solanaBalanceData && <p>{JSON.stringify(solanaBalanceData, null, 2)}</p>}
    </div>
  );
}
