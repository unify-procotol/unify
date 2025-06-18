// ============================================================================
// Query and Operation Types
// ============================================================================

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

// ============================================================================
// Database and Schema Types
// ============================================================================

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

export interface TableColumn {
  type: DatabaseColumnType;
  nullable?: boolean;
  unique?: boolean;
  default?: DatabaseDefaultValue;
}

export interface TableSchema {
  name: string;
  schema?: string;
  columns: Record<string, TableColumn>;
}

// ============================================================================
// Entity and Configuration Types
// ============================================================================

export interface EntityFunction<TArgs = Record<string, any>> {
  (args?: TArgs, context?: any): Promise<any> | any;
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
  table?: TableSchema;
}

export interface SourceConfig {
  id: string;
  entities: Record<string, EntityConfig>;
  middleware?: Array<(c: any, next: () => Promise<void>) => Promise<void>>;
}

// ============================================================================
// Storage Interface
// ============================================================================

export interface Storage {
  create(args: {
    sourceId: string;
    tableName: string;
    args: CreateArgs;
    schema?: string;
    tableSchema: TableSchema;
  }): Promise<Record<string, any>>;

  findMany(args: {
    sourceId: string;
    tableName: string;
    args?: QueryArgs;
    schema?: string;
  }): Promise<Record<string, any>[]>;

  findOne(args: {
    sourceId: string;
    tableName: string;
    args: FindOneArgs;
    schema?: string;
  }): Promise<Record<string, any> | null>;

  update(args: {
    sourceId: string;
    tableName: string;
    args: UpdateArgs;
    schema?: string;
    tableSchema: TableSchema;
  }): Promise<Record<string, any> | null>;

  delete(args: {
    sourceId: string;
    tableName: string;
    args: DeleteArgs;
    schema?: string;
  }): Promise<boolean>;

  truncate(args: {
    sourceId: string;
    tableName: string;
    schema?: string;
  }): Promise<void>;

  tableExists(args: {
    sourceId: string;
    tableName: string;
    schema?: string;
  }): Promise<boolean>;

  close?(): Promise<void>;
}
