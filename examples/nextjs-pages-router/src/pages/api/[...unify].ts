import { PagesUnify } from "@unilab/unify-next/pages-router";
import { WalletPlugin } from "@unilab/uniweb3";
import { Logging } from "@unilab/core/middleware";

const handler = PagesUnify.init({
  plugins: [WalletPlugin],
  middleware: [Logging()],
});

export default handler;
