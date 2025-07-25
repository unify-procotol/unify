import type {
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  CreateManyArgs,
  UpdateArgs,
  UpdateManyArgs,
  UpsertArgs,
  DeletionArgs,
  BaseURPCConfig,
} from "@unilab/urpc-core";

export interface RepoOptions<T extends Record<string, any>> {
  entity: string | { new (...args: any[]): T; displayName?: string };
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
  createMany(args: CreateManyArgs<T>): Promise<T[]>;
  update(args: UpdateArgs<T>): Promise<T>;
  updateMany(args: UpdateManyArgs<T>): Promise<T[]>;
  upsert(args: UpsertArgs<T>): Promise<T>;
  delete(args: DeletionArgs<T>): Promise<boolean>;
  // custom methods
  [funcName: string]: (args: any) => Promise<any>;
}

export interface LocalConfig extends BaseURPCConfig {}

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
