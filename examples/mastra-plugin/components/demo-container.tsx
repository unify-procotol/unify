"use client";

import React from "react";
import { Bot } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@unilab/ukit";

export default function DemoContainer({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-h-screen bg-gradient-background", className)}>
      <div className="bg-card/80 backdrop-blur-md shadow-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center text-muted-foreground hover:text-foreground mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back
              </Link>
              <Bot className="h-8 w-8 text-purple-600" />
              <h1 className="ml-3 text-xl font-bold text-foreground">
                {title}
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
