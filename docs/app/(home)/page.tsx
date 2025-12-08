"use client";

import Link from "next/link";
import { ArrowRight, Zap, Check } from "lucide-react";
import { useState } from "react";
import CodeHighlighter from "./components/code-highlighter";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background text-foreground selection:bg-blue-500/20">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <section className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm shadow-sm transition-transform hover:scale-105 cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Entity-First Abstraction Protocol
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/70">
                URPC
              </h1>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground/90 leading-tight">
                Solve Data Heterogeneity with <br className="hidden sm:block" />
                <span>Entity-First Abstraction</span>
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              A protocol focused on entity-first abstraction, aimed at resolving
              same-domain, cross-source complexity. Kill switch-case hell in
              multi-protocol apps with unified entity models.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
              <Link
                href="/docs/urpc/basic-usage"
                className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] px-8 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-500 hover:bg-[position:right_center] hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:scale-110" />
              </Link>
            </div>
          </div>

          {/* Right Content - Code Example */}
          <div className="w-full relative lg:h-[600px] flex items-center justify-center min-w-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-transparent blur-3xl rounded-full opacity-40"></div>
            <CodeExample />
          </div>
        </div>
      </section>
    </div>
  );
}

function CodeExample() {
  const [activeTab, setActiveTab] = useState<"server" | "client">("server");

  const serverCode = `// preview code
URPC.init({
  plugins: [
    AIPlugin,
    S3Plugin,
    IoTPlugin,
    Web3Plugin,
    PaymentPlugin,
    SupabasePlugin,
  ],
  middlewares:[
    tracing(),
    cache({ bentocache }),
    logging(),
    auth({ getUser: async (c: Context) => { ... }}),
  ],
  globalAdapters: [
    MockAdapter,
    SqlAdapter,
    MQTTAdapter,
    MongoAdapter,
    KafkaAdapter,
    RabbitMQAdapter,
  ]
});
`;

  const clientCode = `URPC.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

// Traditional entity operations
const user = await repo<UserEntity>({
  entity: "user",
  source: "mock",
}).findOne({
  where: {
    id: "1",
  },
});

// AI-powered natural language queries
const aiResult = await repo<ChatEntity>({
  entity: "chat",
  source: "mastra",
}).call({
  input: "Find all users",
  model: "google/gemini-2.0-flash-001",
});
`;

  return (
    <div className="relative w-full max-w-[600px] mx-auto perspective-1000">
      {/* Background glow for better integration */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-[2rem] blur-2xl opacity-50 dark:opacity-20 hidden sm:block" />

      <div className="relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-md shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all hover:shadow-[0_0_50px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_50px_-10px_rgba(255,255,255,0.05)]">
        {/* Window Controls & Tabs */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#27C93F] shadow-sm"></div>
          </div>

          <div className="flex p-0.5 bg-black/5 dark:bg-white/5 rounded-lg backdrop-blur-md overflow-x-auto scrollbar-none">
            {["server", "client"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "server" | "client")}
                className={`relative px-3 py-1 text-xs font-medium rounded-md transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-white dark:bg-white/10 text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5 cursor-pointer"
                }`}
              >
                {tab}.ts
              </button>
            ))}
          </div>
        </div>

        {/* Code Area */}
        <div className="relative group">
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <div className="text-xs text-muted-foreground/70 font-mono tracking-wider">
              TypeScript
            </div>
          </div>

          {activeTab === "server" && (
            <CodeHighlighter
              code={serverCode}
              language="typescript"
              classNames={{
                code: "text-sm leading-relaxed !bg-transparent font-medium",
                pre: "!bg-transparent !m-0 !p-6",
              }}
            />
          )}

          {activeTab === "client" && (
            <CodeHighlighter
              code={clientCode}
              language="typescript"
              classNames={{
                code: "text-sm leading-relaxed !bg-transparent font-medium",
                pre: "!bg-transparent !m-0 !p-6",
              }}
            />
          )}

          {/* Bottom gradient fade for seamless integration */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
