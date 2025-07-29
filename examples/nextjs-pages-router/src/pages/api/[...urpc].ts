import { URPC } from "@unilab/urpc-next/pages-router";
import { WalletPlugin } from "@unilab/uniweb3";
import { logging } from "@unilab/urpc-core/middleware";

const handler = URPC.init({
  plugins: [WalletPlugin],
  middlewares: [logging()],
});

export default handler;
