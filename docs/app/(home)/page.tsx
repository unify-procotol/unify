"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { useState } from "react";
import CodeHighlighter from "./components/code-highlighter";

export default function HomePage() {
  return (
    <>
      {/* Full Screen Grid Background */}
      <div className="bg-grid bg-fullscreen"></div>

      <div className="flex flex-1 flex-col relative min-h-screen">
        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-24 overflow-hidden min-h-screen flex items-center">
          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left relative">
                {/* Content background decoration */}
                <div className="absolute -inset-4 bg-gradient-to-r from-gray-200/20 to-gray-300/20 dark:from-gray-800/20 dark:to-gray-900/20 rounded-2xl opacity-60 blur-sm"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100/90 to-gray-200/90 dark:from-gray-800/80 dark:to-gray-900/80 rounded-full text-sm font-medium text-blue-600 dark:text-blue-400 mb-8 shadow-sm border border-gray-300/50 dark:border-gray-700/50 backdrop-blur-sm">
                    <Zap className="w-4 h-4" />
                    Entity-First Abstraction Protocol
                  </div>

                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent mb-6 leading-tight">
                    URPC
                  </h1>

                  <div className="relative">
                    <p className="text-xl md:text-2xl lg:text-3xl text-gray-800 dark:text-gray-200 mb-6 leading-relaxed font-medium">
                      Solve Data Heterogeneity with Entity-First Abstraction
                    </p>
                    <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 rounded-full opacity-30"></div>
                  </div>

                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 relative">
                    A protocol focused on entity-first abstraction, aimed at
                    resolving same-domain, cross-source complexity. Kill
                    switch-case hell in multi-protocol apps with unified entity
                    models.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link
                      href="/docs/basic-usage"
                      className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden border border-gray-300/50 dark:border-gray-600/50 hover:border-gray-400/50 dark:hover:border-gray-500/50"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      <span className="relative z-10">Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Content - Code Example */}
              <div className="lg:pl-8">
                <CodeExample />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function CodeExample() {
  const [activeTab, setActiveTab] = useState<"server" | "client">("server");

  const serverCode = `import { URPC } from "@unilab/urpc-hono";
import { WalletPlugin } from "@unilab/uniweb3";
import { Logging } from "@unilab/urpc-core/middleware";

const app = URPC.init({
  plugins: [WalletPlugin],
  middleware: [Logging()],
});

export default {
  port: 3000,
  fetch: app.fetch,
};`;

  const clientCode = `import { repo, URPC } from "@unilab/urpc-client";
import { WalletEntity } from "@unilab/uniweb3/entities";

URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const evmBalanceRes = await repo<WalletEntity>({
  entity "wallet",
  source: "evm",
}).findOne({
  where: {
    address: "0x...",
    network: "ethereum",
  },
});

const solanaBalanceRes = await repo<WalletEntity>({
  entity "wallet",
  source: "solana",
}).findOne({
  where: {
    address: "11111111111111111111111111111112",
  },
});`;

  return (
    <div className="w-full max-w-2xl mx-auto lg:mx-0 relative">
      {/* Background decoration for code block */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-2xl transform scale-105"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/90 to-gray-200/90 dark:from-gray-800/90 dark:to-gray-900/90 rounded-2xl"></div>

      <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl overflow-hidden shadow-2xl border border-gray-300/50 dark:border-gray-600/50 relative z-10">
        {/* Tab Header */}
        <div className="flex items-center justify-between border-b border-gray-300/70 dark:border-gray-700/70 bg-gradient-to-r from-gray-100/70 to-gray-100/50 dark:from-gray-800/70 dark:to-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-6 py-4">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-sm"></div>
          </div>

          <div className="flex rounded-lg overflow-hidden mr-4 border border-gray-400/50 dark:border-gray-600/50">
            <button
              onClick={() => setActiveTab("server")}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "server"
                  ? "text-green-600 dark:text-green-400 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 shadow-inner"
                  : "cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gradient-to-r hover:from-gray-200/50 hover:to-gray-300/50 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50"
              }`}
            >
              server.ts
            </button>
            <button
              onClick={() => setActiveTab("client")}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "client"
                  ? "text-green-600 dark:text-green-400 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 shadow-inner"
                  : "cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gradient-to-r hover:from-gray-200/50 hover:to-gray-300/50 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50"
              }`}
            >
              client.ts
            </button>
          </div>
        </div>

        {activeTab === "server" && (
          <CodeHighlighter
            code={serverCode}
            language="typescript"
            classNames={{
              code: "h-[300px]",
            }}
          />
        )}

        {activeTab === "client" && (
          <CodeHighlighter
            code={clientCode}
            language="typescript"
            classNames={{
              code: "h-[550px]",
            }}
          />
        )}
      </div>
    </div>
  );
}
