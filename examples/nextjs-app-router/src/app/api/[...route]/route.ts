import { AppUnify } from "@unilab/unify-next/app-router";
import { WalletPlugin } from "@unilab/uniweb3";

AppUnify.init({
  plugins: [WalletPlugin],
});

export const GET = AppUnify.handler;
export const POST = AppUnify.handler;
export const PATCH = AppUnify.handler;
export const DELETE = AppUnify.handler;
