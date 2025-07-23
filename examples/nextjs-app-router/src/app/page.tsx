"use client";

import { repo, URPC } from "@unilab/urpc";
import { WalletEntity } from "@unilab/uniweb3/entities";
import { useEffect, useState } from "react";

URPC.init({
  baseUrl: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    Authorization: "Bearer your-token-here",
  },
});

export default function Home() {
  const [evmBalanceData, setEvmBalanceData] = useState<WalletEntity | null>(
    null
  );
  const [solanaBalanceData, setSolanaBalanceData] =
    useState<WalletEntity | null>(null);

  useEffect(() => {
    const fetchEvmBalance = async () => {
      try {
        const data = await repo<WalletEntity>({
          entity: "wallet",
          source: "evm",
        }).findOne({
          where: {
            address: "0x8E76cAEbaca6c0e390F825fa44Dfd1fCb74B9C36",
            chainId: 1,
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
        const data = await repo<WalletEntity>({
          entity: "wallet",
          source: "solana",
        }).findOne({
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
