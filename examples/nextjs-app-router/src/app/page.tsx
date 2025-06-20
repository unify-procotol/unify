"use client";

import { Repo, UnifyClient } from "@unify/client";
import { WalletEntity } from "@unify/uniweb3";
import { useEffect, useState } from "react";

export default function Home() {
  const [evmBalanceData, setEvmBalanceData] = useState<any>(null);
  const [solanaBalanceData, setSolanaBalanceData] = useState<any>(null);

  useEffect(() => {
    UnifyClient.init({
      baseUrl: "http://localhost:3000/api",
      timeout: 10000,
      headers: {
        Authorization: "Bearer your-token-here",
      },
    });

    const fetchEvmBalance = async () => {
      try {
        const data = await Repo<WalletEntity>("wallet", "evm").findOne({
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
        const data = await Repo<WalletEntity>("wallet", "solana").findOne({
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
