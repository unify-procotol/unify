"use client";

import Link from "next/link";
import Image from "next/image";
import { Bot, CheckSquare, Wallet, Cpu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const examples = [
    {
      title: "URPC + UniWeb3 Plugin",
      description:
        "Next.js application example using URPC and UniWeb3 for wallet operations",
      icon: <Wallet className="h-8 w-8 text-blue-500" />,
      href: "/uniweb3",
      features: [
        "Wallet Connection",
        "EVM Support",
        "Solana Support",
        "Balance Query",
      ],
      color:
        "bg-blue-50/50 hover:bg-blue-50/80 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
    },
    {
      title: "Todo App Demo",
      description: "Todo application example built with UniRender and URPC",
      icon: <CheckSquare className="h-8 w-8 text-green-500" />,
      href: "/todo-app-demo",
      features: [
        "Multiple Layouts",
        "Editable Table",
        "Responsive Design",
        "Real-time Updates",
      ],
      color:
        "bg-green-50/50 hover:bg-green-50/80 dark:bg-green-900/20 dark:hover:bg-green-900/30",
    },
    {
      title: "URPC + Mastra Plugin",
      description:
        "Intelligent data operations assistant based on URPC + Mastra Plugin",
      icon: <Bot className="h-8 w-8 text-purple-500" />,
      href: "/mastra-plugin",
      features: [
        "AI Powered",
        "Natural Language",
        "Direct Operations",
        "Real-time Feedback",
      ],
      color:
        "bg-purple-50/50 hover:bg-purple-50/80 dark:bg-purple-900/20 dark:hover:bg-purple-900/30",
    },
    {
      title: "IoT Device Demo",
      description: "IoT application example built with URPC + Mastra Plugin",
      icon: <Cpu className="h-8 w-8 text-orange-500" />,
      href: "/iot",
      features: [
        "IoT Devices",
        "AI Powered",
        "Natural Language",
        "Direct Operations",
      ],
      color:
        "bg-orange-50/50 hover:bg-orange-50/80 dark:bg-orange-900/20 dark:hover:bg-orange-900/30",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md shadow-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Image
                src="/logo_64x64.svg"
                alt="URPC Playground"
                width={32}
                height={32}
              />
              <h1 className="ml-3 text-xl font-bold text-foreground">
                URPC Playground
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showcase various URPC framework features
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose an Example to Get Started
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            These examples demonstrate URPC framework applications in different
            scenarios, including wallet operations, data management, and AI
            assistant features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examples.map((example, index) => (
            <Link
              key={index}
              href={example.href}
              className={`group block p-6 rounded-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 backdrop-blur-sm ${example.color}`}
            >
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-gradient-background/50 group-hover:bg-gradient-background/80 transition-colors">
                  {example.icon}
                </div>
                <h3 className="ml-3 text-xl font-semibold text-foreground">
                  {example.title}
                </h3>
              </div>

              <p className="text-muted-foreground mb-4 leading-relaxed">
                {example.description}
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">
                  Key Features:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {example.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-primary/60 rounded-full mr-2 group-hover:bg-primary transition-colors"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">
                Click to explore →
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="border-t border-border/50 pt-8">
            <p className="text-muted-foreground">Built with ❤️ by Uni-Labs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
