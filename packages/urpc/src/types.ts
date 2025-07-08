import type { Middleware, Plugin } from "@unilab/urpc-core";

export interface URPCConfig {
  enableDebug?: boolean;
  plugins: Plugin[];
  middlewares?: Middleware<any>[];
}
