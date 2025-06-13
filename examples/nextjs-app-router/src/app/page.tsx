"use client";

import { useEffect, useState } from "react";
import { createClient } from "@unify-api/client";
import { EVMPlugin, SolanaPlugin } from "@unify-api/plugins/uniweb3";

export default function Home() {
  const [evmBalanceData, setEvmBalanceData] = useState<any>(null);
  const [solanaBalanceData, setSolanaBalanceData] = useState<any>(null);

  useEffect(() => {
    const client = createClient(
      {
        EVMPlugin,
        SolanaPlugin,
      },
      {
        baseURL: "http://localhost:3000/api",
      }
    );

    const fetchEvmBalance = async () => {
      try {
        const res = await client.EVMPlugin.balance.findOne({
          where: {
            address: "0x4f00D43b5aF0a0aAd62E9075D1bFa86a89CDb9aB",
            network: "iotex",
          },
        });
        if (res.data) {
          setEvmBalanceData(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchSolanaBalance = async () => {
      try {
        const res = await client.SolanaPlugin.balance.findOne({
          where: {
            address: "11111111111111111111111111111112",
          },
        });
        if (res.data) {
          setSolanaBalanceData(res.data);
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
