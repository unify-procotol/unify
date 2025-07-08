import { Middleware, Plugin } from "@unilab/urpc-core";

export interface URPCConfig {
  plugins: Plugin[];
  middleware?: Middleware<any>[];
}
