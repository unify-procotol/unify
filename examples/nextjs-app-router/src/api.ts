import { Logging } from "@unilab/core/middleware";
import { Unify } from "@unilab/unify-next/app-router";
import { WalletPlugin } from "@unilab/uniweb3";

export const api = Unify.init({
  plugins: [WalletPlugin],
  middleware: [Logging()],
});