import type { Middleware, Plugin } from "@unilab/urpc-core";

export interface ClientConfig {
  enableDebug?: boolean;
  plugins: Plugin[];
  middleware?: Middleware<any>[];
}
