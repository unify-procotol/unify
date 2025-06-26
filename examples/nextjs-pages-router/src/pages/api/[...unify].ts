import {
  PagesUnify,
  createPagesHandler,
} from "@unilab/unify-next/pages-router";
import { WalletPlugin } from "@unilab/uniweb3";

PagesUnify.init({
  plugins: [WalletPlugin],
});

export default createPagesHandler();
