import { Logging } from "@unilab/core/middleware";
import { AppUnify } from "@unilab/unify-next/app-router";
import { WalletPlugin } from "@unilab/uniweb3";

export const api = AppUnify.init({
  plugins: [WalletPlugin],
  middleware: [Logging()],
});