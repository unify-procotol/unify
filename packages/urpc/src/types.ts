import type {
  Middleware,
  Plugin,
  EntityConfigs,
  GlobalAdapterRegistration,
} from "@unilab/urpc-core";

export interface RepoOptions<T extends Record<string, any>> {
  entity: string | { new (): T; name: string };
  source?: string;
  context?: {
    lang?: string;
  };
}

export interface RelationMapping<
  T extends Record<string, any>,
  F extends Record<string, any>,
> {
  localField: keyof F;
  foreignField: keyof T;
}

export type JoinRepoOptions<
  F extends Record<string, any> = Record<string, any>,
  L extends Record<string, any> = Record<string, any>,
> = RepoOptions<F> & RelationMapping<F, L>;

export interface URPCConfig {
  plugins: Plugin[];
  middlewares?: Middleware<any>[];
  entityConfigs?: EntityConfigs;
  globalAdapters?: GlobalAdapterRegistration[];
}
