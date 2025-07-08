import { URPC } from "@unilab/urpc-next/pages-router";
import { WalletPlugin } from "@unilab/uniweb3";
import { Logging } from "@unilab/urpc-core/middleware";

const handler = URPC.init({
  plugins: [WalletPlugin],
  middlewares: [Logging()],
});

export default handler;
