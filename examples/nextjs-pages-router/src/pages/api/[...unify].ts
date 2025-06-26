import { Unify, createPagesHandler } from "@unilab/unify-next";
import { WalletPlugin } from "@unilab/uniweb3";
import type { PageConfig } from "next";

export const config: PageConfig = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

// Initialize Unify with plugins
Unify.init({
  plugins: [WalletPlugin],
});

// Create and export the handler
export default createPagesHandler();
