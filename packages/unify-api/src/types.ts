import { BlankEnv, BlankSchema } from "hono/types";
import { PGStorageConfig } from "./storage/pg";
import type { Hono } from "hono";

type BaseArgs = {
  source_id: string;
} & Record<string, any>;

// 基础查询参数类型
export interface QueryArgs extends BaseArgs {
  limit?: number;
  offset?: number;
  select?: string[];
  where?: Record<string, any>;
  order_by?: Record<string, "asc" | "desc">;
}

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

// 实体方法类型 - 基础接口
export interface EntityFunction<TArgs = QueryArgs> {
  (args?: TArgs, context?: any): Promise<any> | any;
}

// oRPC Procedure 类型定义
export interface ORPCProcedure {
  "~orpc": {
    handler: Function;
  };
  [key: string]: any;
}

// 支持的实体处理器类型 - 支持普通函数和 oRPC procedures
export type EntityProcedure<TArgs = any> = EntityFunction<TArgs> | ORPCProcedure;

// 支持的实体方法名类型
export type EntityFunctionName =
  | "findMany"
  | "findOne"
  | "create"
  | "update"
  | "delete";

// 实体配置类型 - 使用更灵活的方法定义
export interface EntityConfig {
  findMany?: EntityProcedure<QueryArgs>;
  findOne?: EntityProcedure<BaseArgs>; // 允许任意参数类型
  create?: EntityProcedure<BaseArgs>;
  update?: EntityProcedure<BaseArgs>;
  delete?: EntityProcedure<BaseArgs>;
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

// RestMapper 配置选项
export interface RestMapperOptions {
  /** 是否启用内置路由（根路径和API文档），默认为 true */
  enableBuiltinRoutes?: boolean;
  /** 自定义根路径响应信息 */
  rootMessage?: string;
  /** 自定义存储配置 */
  storageOptions?:
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
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  handler: EntityFunction<any>;
}

// HTTP 方法到实体方法的默认映射
export const DEFAULT_METHOD_MAPPING: Record<
  string,
  { method: string; pathSuffix?: string }
> = {
  findMany: { method: "GET" },
  findOne: { method: "GET", pathSuffix: "/:id" },
  create: { method: "POST" },
  update: { method: "PUT", pathSuffix: "/:id" },
  patch: { method: "PATCH", pathSuffix: "/:id" },
  delete: { method: "DELETE", pathSuffix: "/:id" },
  remove: { method: "DELETE", pathSuffix: "/:id" },
};
