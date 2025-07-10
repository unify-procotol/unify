import type {
  Middleware,
  Plugin,
  EntityConfigs,
  DataSourceAdapter,
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

export interface LocalConfig {
  plugins: Plugin[];
  middlewares?: Middleware<any>[];
  entityConfigs?: EntityConfigs;
  globalAdapters?: (new () => DataSourceAdapter<any>)[];
}

export interface HttpClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface HttpRequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

export interface HttpResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export type URPCConfig = LocalConfig | HttpClientConfig;
