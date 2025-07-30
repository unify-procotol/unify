"use client";

import { WalletEntity } from "@unilab/uniweb3/entities";
import { useState } from "react";
import { Wallet, Loader2, Copy, Search, Edit3 } from "lucide-react";
import { initUrpcClient } from "@/lib/urpc-client";
import { repo } from "@unilab/urpc";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import DemoContainer from "@/components/demo-container";
import ChatWidget from "@/components/chat-widget";

initUrpcClient();

export default function NextjsAppRouter() {
  const [evmBalanceData, setEvmBalanceData] = useState<WalletEntity | null>(
    null
  );
  const [solanaBalanceData, setSolanaBalanceData] =
    useState<WalletEntity | null>(null);
  const [evmLoading, setEvmLoading] = useState(false);
  const [solanaLoading, setSolanaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User input states
  const [evmAddress, setEvmAddress] = useState(
    "0x8E76cAEbaca6c0e390F825fa44Dfd1fCb74B9C36"
  );
  const [solanaAddress, setSolanaAddress] = useState(
    "11111111111111111111111111111112"
  );
  const [chainId, setChainId] = useState(1);

  // Query code snippets for display - now dynamic
  const evmQueryCode = `const data = await repo<WalletEntity>({
  entity: "wallet",
  source: "evm",
}).findOne({
  where: {
    address: "${evmAddress}",
    chainId: ${chainId},
  },
});`;

  const solanaQueryCode = `const data = await repo<WalletEntity>({
  entity: "wallet", 
  source: "solana",
}).findOne({
  where: {
    address: "${solanaAddress}",
  },
});`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Fetch EVM balance function
  const fetchEvmBalance = async () => {
    if (!evmAddress.trim()) return;

    try {
      setEvmLoading(true);
      setError(null);
      const data = await repo<WalletEntity>({
        entity: "wallet",
        source: "evm",
      }).findOne({
        where: {
          address: evmAddress,
          chainId: chainId,
        },
      });
      setEvmBalanceData(data);
    } catch (error) {
      console.error("EVM balance fetch error:", error);
      setError("Failed to fetch EVM wallet data");
    } finally {
      setEvmLoading(false);
    }
  };

  // Fetch Solana balance function
  const fetchSolanaBalance = async () => {
    if (!solanaAddress.trim()) return;

    try {
      setSolanaLoading(true);
      setError(null);
      const data = await repo<WalletEntity>({
        entity: "wallet",
        source: "solana",
      }).findOne({
        where: {
          address: solanaAddress,
        },
      });
      setSolanaBalanceData(data);
    } catch (error) {
      console.error("Solana balance fetch error:", error);
      setError("Failed to fetch Solana wallet data");
    } finally {
      setSolanaLoading(false);
    }
  };

  return (
    <>
      <DemoContainer title="URPC + UniWeb3 Plugin Example">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent mb-2">
              Interactive Wallet Balance Query
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enter wallet addresses to query Ethereum and Solana balances using
              URPC and UniWeb3
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 shadow-sm">
              <div className="text-red-600 dark:text-red-400 text-center text-sm font-medium">
                {error}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* EVM Wallet */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-bold text-white">Ethereum</h3>
                    <p className="text-xs text-blue-100">EVM Network</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Input Controls */}
                <div className="mb-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        <Edit3 className="inline h-3 w-3 mr-1" />
                        Wallet Address
                      </label>
                      <input
                        type="text"
                        value={evmAddress}
                        onChange={(e) => setEvmAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter EVM wallet address"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Network
                      </label>
                      <select
                        value={String(chainId)}
                        onChange={(e) => setChainId(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="1">Ethereum</option>
                        <option value="137">Polygon</option>
                        <option value="56">BSC</option>
                        <option value="4689">IoTeX</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={fetchEvmBalance}
                    disabled={evmLoading || !evmAddress.trim()}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                  >
                    {evmLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    ) : (
                      <Search className="h-3 w-3 mr-2" />
                    )}
                    {evmLoading ? "Querying..." : "Query Balance"}
                  </button>
                </div>

                {/* Query Code Display */}
                <div className="mb-4">
                  <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                        Query Code
                      </span>
                      <button
                        onClick={() => copyToClipboard(evmQueryCode)}
                        className="flex items-center px-2 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-300 text-xs transition-colors"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-slate-900 dark:bg-slate-950">
                      <SyntaxHighlighter
                        language="typescript"
                        style={oneDark}
                        customStyle={{
                          margin: 0,
                          padding: "12px",
                          fontSize: "11px",
                          lineHeight: "1.4",
                          background: "transparent",
                          height: "170px",
                          overflow: "auto",
                        }}
                        codeTagProps={{
                          style: {
                            background: "transparent",
                          },
                        }}
                        showLineNumbers={false}
                        showInlineLineNumbers={false}
                        wrapLines={false}
                        wrapLongLines={true}
                      >
                        {evmQueryCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>

                {/* Result Display */}
                {evmLoading ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                      Result
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700 min-h-[160px] flex items-center justify-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Loading EVM data...
                        </span>
                      </div>
                    </div>
                  </div>
                ) : evmBalanceData ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      Result
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700 min-h-[160px]">
                      <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-40 overflow-y-auto">
                        {JSON.stringify(evmBalanceData, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>
                      Result
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700 min-h-[160px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Wallet className="h-6 w-6 text-slate-400" />
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm">
                          No data available
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Solana Wallet */}
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-bold text-white">Solana</h3>
                    <p className="text-xs text-purple-100">Solana Network</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Input Controls */}
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <Edit3 className="inline h-3 w-3 mr-1" />
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={solanaAddress}
                      onChange={(e) => setSolanaAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter Solana wallet address"
                    />
                  </div>
                  <button
                    onClick={fetchSolanaBalance}
                    disabled={solanaLoading || !solanaAddress.trim()}
                    className="w-full flex items-center justify-center px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-medium rounded-md transition-colors disabled:cursor-not-allowed"
                  >
                    {solanaLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    ) : (
                      <Search className="h-3 w-3 mr-2" />
                    )}
                    {solanaLoading ? "Querying..." : "Query Balance"}
                  </button>
                </div>

                {/* Query Code Display */}
                <div className="mb-4">
                  <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">
                        Query Code
                      </span>
                      <button
                        onClick={() => copyToClipboard(solanaQueryCode)}
                        className="flex items-center px-2 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-300 text-xs transition-colors"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                    </div>
                    <div className="bg-slate-900 dark:bg-slate-950">
                      <SyntaxHighlighter
                        language="typescript"
                        style={oneDark}
                        customStyle={{
                          margin: 0,
                          padding: "12px",
                          fontSize: "11px",
                          lineHeight: "1.4",
                          background: "transparent",
                          height: "170px",
                          overflow: "auto",
                        }}
                        codeTagProps={{
                          style: {
                            background: "transparent",
                          },
                        }}
                        showLineNumbers={false}
                        showInlineLineNumbers={false}
                        wrapLines={false}
                        wrapLongLines={true}
                      >
                        {solanaQueryCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>

                {/* Result Display */}
                {solanaLoading ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                      Result
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700 min-h-[160px] flex items-center justify-center">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-500 mr-2" />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Loading Solana data...
                        </span>
                      </div>
                    </div>
                  </div>
                ) : solanaBalanceData ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                      Result
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700 min-h-[160px]">
                      <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-40 overflow-y-auto">
                        {JSON.stringify(solanaBalanceData, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>
                      Result
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 border border-slate-200 dark:border-slate-700 min-h-[160px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Wallet className="h-6 w-6 text-slate-400" />
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm">
                          No data available
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DemoContainer>
      <ChatWidget
        entity="chat"
        source="mastra"
        entities={["WalletEntity"]}
        quickCommands={[
          "Query the balance of chainId 1 wallet address 0x8E76cAEbaca6c0e390F825fa44Dfd1fCb74B9C36",
          "Query the balance of solana wallet address 11111111111111111111111111111112",
        ]}
      />
    </>
  );
}
