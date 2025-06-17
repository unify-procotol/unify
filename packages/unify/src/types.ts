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

export type DatabaseDefaultValue =
  | string // String type default value, e.g. 'default_value'
  | number // Number type default value, e.g. 0, 3.14
  | boolean // Boolean type default value, e.g. true, false
  | object // JSON type default value, e.g. {}, []
  | null // NULL default value
  | "CURRENT_TIMESTAMP" // SQL function
  | "CURRENT_DATE" // SQL function
  | "CURRENT_TIME" // SQL function
  | "LOCALTIMESTAMP" // SQL function
  | "LOCALTIME" // SQL function
  | "UUID()" // UUID function
  | "AUTO_INCREMENT" // Auto increment
  | "SERIAL" // PostgreSQL sequence
  | "BIGSERIAL" // PostgreSQL sequence
  | "NOW()"; // SQL function

export interface EntityFunction<TArgs = Record<string, any>> {
  (args?: TArgs, context?: Context): Promise<any> | any;
}

export interface ORPCProcedure {
  "~orpc": {
    handler: Function;
  };
  [key: string]: any;
}

export type EntityProcedure<TArgs = Record<string, any>> =
  | EntityFunction<TArgs>
  | ORPCProcedure;

export type EntityFunctionName =
  | "findMany"
  | "findOne"
  | "create"
  | "update"
  | "delete";

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

export interface SourceConfig {
  id: string;
  entities: {
    [entityName: string]: EntityConfig;
  };
  middleware?: Array<(c: any, next: () => Promise<void>) => Promise<void>>;
}

export interface AdapterOptions {
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

export interface App extends Hono<BlankEnv, BlankSchema, "/"> {}

export interface RestMethodMapping {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  handler: EntityFunction<any>;
}

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
