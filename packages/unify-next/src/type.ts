import { Middleware, Plugin } from "@unilab/core";

export interface UnifyConfig {
  plugins: Plugin[];
  middleware?: Middleware<any>[];
}
