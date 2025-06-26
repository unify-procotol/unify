import { Unify } from "@unilab/unify-next";
import { WalletPlugin } from "@unilab/uniweb3";

export const runtime = "nodejs";

// Initialize Unify with plugins
Unify.init({
  plugins: [WalletPlugin],
});

export const GET = Unify.handler;
export const POST = Unify.handler;
export const PATCH = Unify.handler;
export const DELETE = Unify.handler;
