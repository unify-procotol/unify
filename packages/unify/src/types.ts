import { BlankEnv, BlankSchema } from "hono/types";
import { PGStorageConfig } from "./storage/pg";
import type { Context, Hono } from "hono";

export interface FindManyArgs<T = Record<string, any>> {
  source_id: string;
  limit?: number;
  offset?: number;
  select?: Array<keyof T>;
  where?: Partial<T>;
  order_by?: Partial<Record<keyof T, "asc" | "desc">>;
}

export interface FindOneArgs<T = Record<string, any>> {
  source_id: string;
  where: Partial<T>;
  select?: Array<keyof T>;
}

export interface CreateArgs<T = Record<string, any>> {
  source_id: string;
  data: Partial<T>;
}

export interface UpdateArgs<T = Record<string, any>> {
  source_id: string;
  where: Partial<T>;
  data: Partial<T>;
}

export interface DeleteArgs<T = Record<string, any>> {
  source_id: string;
  where: Partial<T>;
}

export type QueryArgs<T = Record<string, any>> =
  | FindManyArgs<T>
  | FindOneArgs<T>
  | CreateArgs<T>
  | UpdateArgs<T>
  | DeleteArgs<T>;

// 数据库字段类型
export type DatabaseColumnType =
  | "varchar"
  | "text"
  | "char"
  | "int"
  | "integer"
  | "bigint"
  | "smallint"
  | "tinyint"
  | "decimal"
  | "numeric"
  | "float"
  | "double"
  | "real"
  | "boolean"
  | "bool"
  | "date"
  | "datetime"
  | "timestamp"
  | "time"
  | "year"
  | "json"
  | "jsonb"
  | "uuid"
  | "binary"
  | "varbinary"
  | "blob"
  | "longblob"
  | "mediumblob"
  | "tinyblob"
  | "enum"
  | "set";

// 数据库字段默认值类型
export type DatabaseDefaultValue =
  | string // 字符串类型默认值，如 'default_value'
  | number // 数字类型默认值，如 0, 3.14
  | boolean // 布尔类型默认值，如 true, false
  | object // JSON 类型默认值，如 {}, []
  | null // NULL 默认值
  | "CURRENT_TIMESTAMP" // SQL 函数
  | "CURRENT_DATE" // SQL 函数
  | "CURRENT_TIME" // SQL 函数
  | "LOCALTIMESTAMP" // SQL 函数
  | "LOCALTIME" // SQL 函数
  | "UUID()" // UUID 生成函数
  | "AUTO_INCREMENT" // 自增
  | "SERIAL" // PostgreSQL 序列
  | "BIGSERIAL" // PostgreSQL 序列
  | "NOW()"; // SQL 函数

export interface EntityFunction<TArgs = Record<string, any>> {
  (args?: TArgs, context?: Context): Promise<any> | any;
}

// oRPC Procedure 类型定义
export interface ORPCProcedure {
  "~orpc": {
    handler: Function;
  };
  [key: string]: any;
}

// 支持的实体处理器类型 - 支持普通函数和 oRPC procedures
export type EntityProcedure<TArgs = Record<string, any>> =
  | EntityFunction<TArgs>
  | ORPCProcedure;

// 支持的实体方法名类型
export type EntityFunctionName =
  | "findMany"
  | "findOne"
  | "create"
  | "update"
  | "delete";

// 实体配置类型 - 使用更灵活的方法定义
export interface EntityConfig {
  findMany?: EntityProcedure<FindManyArgs>;
  findOne?: EntityProcedure<FindOneArgs>;
  create?: EntityProcedure<CreateArgs>;
  update?: EntityProcedure<UpdateArgs>;
  delete?: EntityProcedure<DeleteArgs>;
  table?: {
    name: string;
    schema: string;
    columns: {
      [key: string]: {
        type: DatabaseColumnType;
        nullable?: boolean;
        unique?: boolean;
        default?: DatabaseDefaultValue;
      };
    };
  };
}

// 源配置类型
export interface SourceConfig {
  id: string;
  entities: {
    [entityName: string]: EntityConfig;
  };
  middleware?: Array<(c: any, next: () => Promise<void>) => Promise<void>>;
}

// Adapter 配置选项
export interface AdapterOptions {
  /** 自定义存储配置 */
  storage?:
    | {
        type: "file";
        dataDir?: string;
      }
    | {
        type: "pg";
        config: PGStorageConfig;
      };
}

// getApp 方法返回的应用对象类型
export interface App extends Hono<BlankEnv, BlankSchema, "/"> {}

// REST API 映射配置
export interface RestMethodMapping {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  handler: EntityFunction<any>;
}

// HTTP 方法到实体方法的默认映射
export const DEFAULT_METHOD_MAPPING: Record<
  string,
  { method: string; pathSuffix?: string }
> = {
  findMany: { method: "GET", pathSuffix: "/list" },
  findOne: { method: "GET", pathSuffix: "/find_one" },
  create: { method: "POST", pathSuffix: "/create" },
  update: { method: "PATCH", pathSuffix: "/update" },
  delete: { method: "DELETE", pathSuffix: "/delete" },
};
