import { SourceConfig, EntityConfig, QueryArgs } from "unify-api";
import { UnifyApiClient, ClientOptions, ApiResponse } from "./client";
import type { z } from "zod";

// 从 oRPC procedure 推断输入类型
type InferORPCInputType<T> = T extends {
  "~orpc": {
    inputSchema: infer S;
  };
}
  ? S extends z.ZodType<infer U>
    ? U
    : any
  : { id: string | number } & Record<string, any>;

// 从实体配置推断实体类型
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
          ? MapColumnType<T> | undefined
          : C[K] extends { type: infer T }
          ? MapColumnType<T>
          : any;
      }
    : { [key: string]: any }
  : { [key: string]: any };

// 数据库类型到TypeScript类型的映射
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

// 实体方法接口 - 为 findOne 方法使用更精确的类型推断
interface TypedEntityMethods<
  TEntity,
  TFindOneInput = { id: string | number } & Record<string, any>
> {
  findMany(
    args?: Omit<QueryArgs, "source_id">
  ): Promise<ApiResponse<TEntity[]>>;
  findOne(args: TFindOneInput): Promise<ApiResponse<TEntity>>;
  create(data: Partial<TEntity>): Promise<ApiResponse<TEntity>>;
  update(
    id: string | number,
    data: Partial<TEntity>
  ): Promise<ApiResponse<TEntity>>;
  patch(
    id: string | number,
    data: Partial<TEntity>
  ): Promise<ApiResponse<TEntity>>;
  delete(id: string | number): Promise<ApiResponse<void>>;
}

// 从SourceConfig推断客户端类型
type InferClientType<T extends SourceConfig> = {
  [K in keyof T["entities"]]: T["entities"][K] extends { findOne: infer FO }
    ? TypedEntityMethods<
        InferEntityType<T["entities"][K]>,
        InferORPCInputType<FO>
      >
    : TypedEntityMethods<InferEntityType<T["entities"][K]>>;
};

// 类型化客户端类
export class TypedClient<TConfig extends SourceConfig> {
  private client: UnifyApiClient;
  private sourceId: string;

  constructor(sourceConfig: TConfig, clientOptions: ClientOptions) {
    this.client = new UnifyApiClient(clientOptions);
    this.sourceId = sourceConfig.id;
  }

  // 获取实体方法的代理
  private getEntityMethods<TEntity>(
    entityName: string
  ): TypedEntityMethods<TEntity> {
    const entityClient = this.client.getEntity<TEntity>(
      this.sourceId,
      entityName
    );

    return {
      findMany: entityClient.findMany,
      findOne: entityClient.findOne,
      create: entityClient.create,
      update: entityClient.update,
      patch: entityClient.patch,
      delete: entityClient.delete,
    };
  }
}

// 创建类型化客户端的工厂函数
export function createTypedClient<TConfig extends SourceConfig>(
  sourceConfig: TConfig,
  clientOptions: ClientOptions
): InferClientType<TConfig> {
  const client = new UnifyApiClient(clientOptions);
  const sourceId = sourceConfig.id;

  // 使用代理来动态创建实体方法
  return new Proxy({} as InferClientType<TConfig>, {
    get(_, entityName: string | symbol) {
      if (
        typeof entityName === "string" &&
        entityName in sourceConfig.entities
      ) {
        const entityClient = client.getEntity(sourceId, entityName);

        return {
          findMany: entityClient.findMany,
          findOne: entityClient.findOne,
          create: entityClient.create,
          update: entityClient.update,
          patch: entityClient.patch,
          delete: entityClient.delete,
        };
      }
      return undefined;
    },
  });
}

// 扩展RestMapper以支持类型化客户端创建
export function createClientFromSource<TConfig extends SourceConfig>(
  sourceConfig: TConfig,
  clientOptions: ClientOptions
): InferClientType<TConfig> {
  return createTypedClient(sourceConfig, clientOptions);
}
