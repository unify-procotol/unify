import { Logging } from "@unilab/urpc-core/middleware";
import { URPC } from "@unilab/urpc-next/app-router";
import { WalletPlugin } from "@unilab/uniweb3";

export const api = URPC.init({
  plugins: [WalletPlugin],
  middlewares: [Logging()],
});