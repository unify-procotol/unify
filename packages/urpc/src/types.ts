import type {
  Middleware,
  Plugin,
  EntityConfigs,
  DataSourceAdapter,
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  CallArgs,
} from "@unilab/urpc-core";

export interface RepoOptions<T extends Record<string, any>> {
  entity: string | { new (): T; name: string };
  source?: string;
  context?: {
    lang?: string;
    stream?: boolean;
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

export interface ProxyRepo<T extends Record<string, any>> {
  findMany(args?: FindManyArgs<T>): Promise<T[]>;
  findOne(args: FindOneArgs<T>): Promise<T | null>;
  create(args: CreationArgs<T>): Promise<T>;
  update(args: UpdateArgs<T>): Promise<T>;
  delete(args: DeletionArgs<T>): Promise<boolean>;
  call(args: CallArgs<T>): Promise<T | Response>;
}

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

export interface HybridConfig extends LocalConfig, HttpClientConfig {}

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

export type URPCConfig = LocalConfig | HttpClientConfig | HybridConfig;
