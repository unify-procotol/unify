import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Inter } from "next/font/google";
import React from "react";
import SearchDialog from './(home)/components/search';

const inter = Inter({
  subsets: ["latin"],
});

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          search={{
            // enabled: false,
            SearchDialog
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
