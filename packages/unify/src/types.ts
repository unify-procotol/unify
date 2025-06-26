import type { Middleware, Plugin } from "@unilab/core";

export interface ClientConfig {
  enableDebug?: boolean;
  plugins: Plugin[];
  middleware?: Middleware<any>[];
}

export interface RelationMapping<
  F extends Record<string, any>,
  L extends Record<string, any>
> {
  localField: keyof L;
  foreignField: keyof F;
}
