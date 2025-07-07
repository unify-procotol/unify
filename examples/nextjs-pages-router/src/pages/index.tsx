import { repo, URPC } from "@unilab/urpc-client";
import { WalletEntity } from "@unilab/uniweb3/entities";
import { useEffect, useState } from "react";

URPC.init({
  baseUrl: "http://localhost:3000/api",
  timeout: 10000,
});

interface WalletData {
  address: string;
  network?: string;
  balance?: string;
  [key: string]: any;
}

export default function Home() {
  const [evmBalanceData, setEvmBalanceData] = useState<WalletData | null>(null);
  const [solanaBalanceData, setSolanaBalanceData] = useState<WalletData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletData = async (
      source: "evm" | "solana",
      address: string,
      network?: string
    ) => {
      try {
        const data = await repo<WalletEntity>({
          entity: "wallet",
          source,
        }).findOne({
          where: { address, ...(network && { network }) },
        });
        return data;
      } catch (error) {
        console.error(`${source.toUpperCase()} balance fetch error:`, error);
        throw error;
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [evmData, solanaData] = await Promise.all([
          fetchWalletData(
            "evm",
            "0x8E76cAEbaca6c0e390F825fa44Dfd1fCb74B9C36",
            "ethereum"
          ),
          fetchWalletData("solana", "11111111111111111111111111111112"),
        ]);

        setEvmBalanceData(evmData);
        setSolanaBalanceData(solanaData);
      } catch (error) {
        setError("Failed to fetch wallet data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string | number | undefined) => {
    if (!balance) return "0.00";
    const numBalance =
      typeof balance === "string" ? parseFloat(balance) : balance;
    return numBalance.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const WalletCard = ({
    title,
    data,
    icon,
    gradientFrom,
    gradientTo,
  }: {
    title: string;
    data: WalletData | null;
    icon: string;
    gradientFrom: string;
    gradientTo: string;
  }) => (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 shadow-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} transition-all duration-300 hover:scale-105 hover:shadow-3xl`}
    >
      <div className="absolute -top-4 -right-4 opacity-20">
        <div className="text-6xl">{icon}</div>
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          {title}
        </h3>

        {data ? (
          <div className="space-y-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-white/80 mb-1">Address</p>
              <p className="text-white font-mono text-lg">
                {formatAddress(data.address)}
              </p>
            </div>

            {data.network && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-white/80 mb-1">Network</p>
                <p className="text-white font-semibold capitalize">
                  {data.network}
                </p>
              </div>
            )}

            {data.balance && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-white/80 mb-1">Balance</p>
                <p className="text-white font-bold text-xl">
                  {formatBalance(data.balance)}
                </p>
              </div>
            )}

            <details className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <summary className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors">
                Raw Data
              </summary>
              <pre className="text-xs text-white/90 mt-2 overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <p className="text-white/80">No data available</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-xl md:text-2xl font-bold text-white my-4">
            URPC Demo with Next.js Pages Router
          </h1>
        </header>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-white ml-4 text-lg">Loading wallet data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-lg p-4 mb-8 text-center">
            <p className="text-red-200 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <WalletCard
              title="Ethereum Wallet"
              data={evmBalanceData}
              icon="⟠"
              gradientFrom="from-blue-600"
              gradientTo="to-purple-600"
            />

            <WalletCard
              title="Solana Wallet"
              data={solanaBalanceData}
              icon="◎"
              gradientFrom="from-purple-600"
              gradientTo="to-pink-600"
            />
          </div>
        )}

        {!loading && (
          <div className="mt-12 text-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              🔄 Refresh Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
