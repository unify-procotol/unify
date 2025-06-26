"use client";

import Link from "next/link";
import { ArrowRight, Code, Zap, Shield, Globe } from "lucide-react";
import { useState } from "react";
import CodeHighlighter from "./components/code-highlighter";

export default function HomePage() {
  return (
    <>
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(
            circle,
            #00000010 1px,
            transparent 1px
          );
          background-size: 20px 20px;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: #4b5563;
          border-radius: 0.375rem;
        }
        .scrollbar-track-gray-800::-webkit-scrollbar-track {
          background-color: #1f2937;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
      `}</style>
      <div className="flex flex-1 flex-col">
        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-8 shadow-sm">
                  <Zap className="w-4 h-4" />
                  Modern API Development Framework
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 leading-tight">
                  Unify
                </h1>

                <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 dark:text-gray-200 mb-6 leading-relaxed font-medium">
                  Powerful SDK based on Hono
                </p>

                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Seamlessly map entity configurations to REST API endpoints,
                  providing type-safe, high-performance backend solutions for
                  modern applications
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/docs/examples/next"
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/docs/introduction"
                    className="group inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Code className="w-4 h-4" />
                    API Documentation
                  </Link>
                </div>
              </div>

              {/* Right Content - Code Example */}
              <div className="lg:pl-8">
                <CodeExample />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-24 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm font-medium text-purple-700 dark:text-purple-300 mb-6">
                <Shield className="w-4 h-4" />
                Core Features
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">
                Why Choose Unify?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Modern architectural design that makes API development simple,
                efficient, and enjoyable
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-2xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  High Performance
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Built on Hono, providing ultimate runtime performance with
                  minimal resource consumption and lightning-fast response times
                </p>
              </div>

              <div className="group text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-2xl hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Type Safety
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Complete TypeScript support with compile-time error checking
                  to ensure code quality and developer confidence
                </p>
              </div>

              <div className="group text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Flexible Configuration
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Automatically generate REST APIs through simple entity
                  configuration, supporting complex business logic with ease
                </p>
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

  const serverCode = `import { Unify } from "@unilab/unify-hono";
import { SolanaAdapter, EVMAdapter } from "@unilab/uniweb3";

const app = Unify.register([
  { source: "solana", adapter: new SolanaAdapter() },
  { source: "evm", adapter: new EVMAdapter() },
]);

export default {
  port: 3000,
  fetch: app.fetch,
};`;

  const clientCode = `import { repo, UnifyClient } from "@unilab/httply";
import { WalletEntity } from "@unilab/uniweb3/entities";

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const evmBalanceRes = await repo<WalletEntity>("wallet", "evm").findOne({
  where: {
    address: "0x...",
    network: "iotex",
  },
});

const solanaBalanceRes = await repo<WalletEntity>("wallet", "solana").findOne({
  where: {
    address: "11111111111111111111111111111112",
  },
});`;

  return (
    <div className="w-full max-w-2xl mx-auto lg:mx-0">
      <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 backdrop-blur-sm">
        {/* Tab Header */}
        <div className="flex items-center justify-between border-b border-gray-700/70 bg-gray-800/50">
          <div className="flex items-center gap-2 px-6 py-4">
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
          </div>

          <div className="flex rounded-lg overflow-hidden mr-4">
            <button
              onClick={() => setActiveTab("server")}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "server"
                  ? "text-green-400 bg-gray-700 shadow-inner"
                  : "cursor-pointer text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
              }`}
            >
              server.ts
            </button>
            <button
              onClick={() => setActiveTab("client")}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "client"
                  ? "text-green-400 bg-gray-700 shadow-inner"
                  : "cursor-pointer text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
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
              code: "h-[400px]",
            }}
          />
        )}

        {activeTab === "client" && (
          <CodeHighlighter
            code={clientCode}
            language="typescript"
            classNames={{
              code: "h-[400px]",
            }}
          />
        )}
      </div>
    </div>
  );
}
