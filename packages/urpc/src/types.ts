import type { Middleware, Plugin, EntityConfigs } from "@unilab/urpc-core";

export interface URPCConfig {
  enableDebug?: boolean;
  plugins: Plugin[];
  middlewares?: Middleware<any>[];
  entityConfigs?: EntityConfigs;
}
