import type { Middleware, Plugin } from "@unilab/core";

export interface ClientConfig {
  enableDebug?: boolean;
  plugins: Plugin[];
  middleware?: Middleware<any>[];
}
