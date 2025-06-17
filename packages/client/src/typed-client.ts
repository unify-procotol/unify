import {
  SourceConfig,
  EntityConfig,
  FindManyArgs,
  FindOneArgs,
  CreateArgs,
  UpdateArgs,
  DeleteArgs,
} from "@unify/server";
import { UnifyClient, ClientOptions, ApiResponse } from "./client";

type InferEntityType<T extends EntityConfig> = T extends {
  table: { columns: infer C };
}
  ? C extends Record<
      string,
      { type: infer FieldType; nullable?: boolean; default?: any }
    >
    ? {
        [K in keyof C]: C[K] extends { type: infer T; nullable: true }
          ? MapColumnType<T> | null
          : C[K] extends { type: infer T; default: any }
          ? MapColumnType<T>
          : C[K] extends { type: infer T }
          ? MapColumnType<T>
          : any;
      }
    : { [key: string]: any }
  : { [key: string]: any };

type MapColumnType<T> = T extends
  | "integer"
  | "int"
  | "bigint"
  | "smallint"
  | "tinyint"
  | "decimal"
  | "numeric"
  | "float"
  | "double"
  | "real"
  ? number
  : T extends "boolean" | "bool"
  ? boolean
  : T extends "date" | "datetime" | "timestamp"
  ? Date | string
  : T extends "json" | "jsonb"
  ? any
  : string;

type IsORPCProcedure<T> = T extends { "~orpc": any } ? true : false;

type ExtractORPCInputType<T> = T extends { "~orpc": any }
  ? T["~orpc"] extends { inputSchema?: { _input: infer Input } }
    ? Input
    : any
  : any;

type ExtractORPCOutputType<T> = T extends { "~orpc": any }
  ? T["~orpc"] extends { outputSchema?: { _output: infer Output } }
    ? Output
    : any
  : any;

type HasORPCProcedures<T extends EntityConfig> = (
  T extends { findMany?: infer FM } ? IsORPCProcedure<FM> : false
) extends true
  ? true
  : (
      T extends { findOne?: infer FO } ? IsORPCProcedure<FO> : false
    ) extends true
  ? true
  : (T extends { create?: infer C } ? IsORPCProcedure<C> : false) extends true
  ? true
  : (T extends { update?: infer U } ? IsORPCProcedure<U> : false) extends true
  ? true
  : (T extends { patch?: infer P } ? IsORPCProcedure<P> : false) extends true
  ? true
  : (T extends { delete?: infer D } ? IsORPCProcedure<D> : false) extends true
  ? true
  : false;

interface TypedEntityMethods<TEntity extends EntityConfig> {
  findMany(
    args?: Omit<FindManyArgs<TEntity>, "source_id">
  ): Promise<ApiResponse<Partial<TEntity>[]>>;
  findOne(
    args?: Omit<FindOneArgs<TEntity>, "source_id">
  ): Promise<ApiResponse<Partial<TEntity>>>;
  create(
    args?: Omit<CreateArgs<TEntity>, "source_id">
  ): Promise<ApiResponse<Partial<TEntity>>>;
  update(
    args?: Omit<UpdateArgs<TEntity>, "source_id">
  ): Promise<ApiResponse<Partial<TEntity>>>;
  delete(
    args?: Omit<DeleteArgs<TEntity>, "source_id">
  ): Promise<ApiResponse<{ success: boolean; message: string }>>;
}

type TypedEntityMethodsForORPC<TEntityConfig extends EntityConfig> = {
  findMany(
    args?: TEntityConfig extends { findMany?: infer F }
      ? ExtractORPCInputType<F>
      : any
  ): Promise<
    ApiResponse<
      TEntityConfig extends { findMany?: infer F }
        ? ExtractORPCOutputType<F>[]
        : any[]
    >
  >;

  findOne(
    args: TEntityConfig extends { findOne?: infer F }
      ? ExtractORPCInputType<F>
      : any
  ): Promise<
    ApiResponse<
      TEntityConfig extends { findOne?: infer F }
        ? ExtractORPCOutputType<F>
        : any
    >
  >;

  create(
    data: TEntityConfig extends { create?: infer F }
      ? ExtractORPCInputType<F>
      : any
  ): Promise<
    ApiResponse<
      TEntityConfig extends { create?: infer F }
        ? ExtractORPCOutputType<F>
        : any
    >
  >;

  update(
    id: string | number,
    data: TEntityConfig extends { update?: infer F }
      ? ExtractORPCInputType<F>
      : any
  ): Promise<
    ApiResponse<
      TEntityConfig extends { update?: infer F }
        ? ExtractORPCOutputType<F>
        : any
    >
  >;

  patch(
    id: string | number,
    data: TEntityConfig extends { patch?: infer F }
      ? ExtractORPCInputType<F>
      : any
  ): Promise<
    ApiResponse<
      TEntityConfig extends { patch?: infer F } ? ExtractORPCOutputType<F> : any
    >
  >;

  delete(id: string | number): Promise<ApiResponse<void>>;
};

export type InferClientType<T extends SourceConfig> = {
  [K in keyof T["entities"]]: HasORPCProcedures<T["entities"][K]> extends true
    ? TypedEntityMethodsForORPC<T["entities"][K]>
    : TypedEntityMethods<InferEntityType<T["entities"][K]>>;
};

export function createTypedClient<TConfig extends SourceConfig>(
  sourceConfig: TConfig,
  clientOptions: ClientOptions
): InferClientType<TConfig> {
  const client = new UnifyClient(clientOptions);
  const sourceId = sourceConfig.id;

  return new Proxy({} as InferClientType<TConfig>, {
    get(target, entityName: string | symbol) {
      if (
        typeof entityName === "string" &&
        entityName in sourceConfig.entities
      ) {
        const entityClient = client.getEntity(sourceId, entityName);

        return {
          findMany: entityClient.findMany.bind(entityClient),
          findOne: entityClient.findOne.bind(entityClient),
          create: entityClient.create.bind(entityClient),
          update: entityClient.update.bind(entityClient),
          delete: entityClient.delete.bind(entityClient),
        };
      }

      return undefined;
    },
  });
}

export type InferClientMapType<T extends Record<string, SourceConfig>> = {
  [K in keyof T]: InferClientType<T[K]>;
};

export function createClient<TConfig extends SourceConfig>(
  sourceConfig: TConfig,
  clientOptions: ClientOptions
): InferClientType<TConfig>;

export function createClient<TSourceMap extends Record<string, SourceConfig>>(
  sourceMap: TSourceMap,
  clientOptions: ClientOptions
): InferClientMapType<TSourceMap>;

export function createClient<
  T extends SourceConfig | Record<string, SourceConfig>
>(
  config: T,
  clientOptions: ClientOptions
): T extends SourceConfig
  ? InferClientType<T>
  : T extends Record<string, SourceConfig>
  ? InferClientMapType<T>
  : never {
  if ("id" in config && "entities" in config) {
    return createTypedClient(config as any, clientOptions) as any;
  }

  const clientMap = {} as any;
  for (const [pluginName, sourceConfig] of Object.entries(config)) {
    clientMap[pluginName] = createTypedClient(sourceConfig, clientOptions);
  }
  return clientMap;
}
