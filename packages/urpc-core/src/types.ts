export type QueryOperators<T> = {
  gt?: T;
  gte?: T;
  lt?: T;
  lte?: T;
  eq?: T;
  ne?: T;
  in?: T[];
  nin?: T[];
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: "sensitive" | "insensitive";
  not?: string | null;
  path?: string[];
};

export type WhereCondition<T> = {
  [K in keyof T]?: T[K];
};

export type WhereConditionWithOperators<T> = {
  [K in keyof T]?: T[K] | QueryOperators<T[K]>;
} & {
  OR?: WhereConditionWithOperators<T>[];
  AND?: WhereConditionWithOperators<T>[];
};

export type OrderByValue =
  | "asc"
  | "desc"
  | {
      path: string[];
      sortOrder: "asc" | "desc";
    };

export type RelationCallbackSingle<
  T extends Record<string, any>,
  R extends Record<string, any>
> = (entity: T) => Promise<R | null>;

export type RelationCallbackMany<
  T extends Record<string, any>,
  R extends Record<string, any>
> = (entities: T[]) => Promise<R[]>;

export interface FindManyArgs<T extends Record<string, any>> {
  limit?: number;
  offset?: number;
  where?: WhereConditionWithOperators<T>;
  order_by?: Partial<Record<keyof T, OrderByValue>>;
  include?: {
    [key: string]: RelationCallbackMany<T, any>;
  };
}

export interface FindOneArgs<T extends Record<string, any>> {
  where: WhereCondition<T>;
  include?: {
    [key: string]: RelationCallbackSingle<T, any>;
  };
}

export interface CreationArgs<T extends Record<string, any>> {
  data: Partial<T>;
}

export interface CreateManyArgs<T extends Record<string, any>> {
  data: Partial<T>[];
}

export interface UpdateArgs<T extends Record<string, any>> {
  where: WhereCondition<T>;
  data: Partial<T>;
}

export interface UpdateManyArgs<T extends Record<string, any>> {
  where: WhereConditionWithOperators<T>;
  data: Partial<T>;
}

export interface UpsertArgs<T extends Record<string, any>> {
  where: WhereCondition<T>;
  update: Partial<T>;
  create: Partial<T>;
}

export interface UpsertManyArgs<T extends Record<string, any>> {
  data: Partial<T>[];
  onConflictDoUpdate: {
    target: keyof T;
    // setWhere?: WhereCondition<T>;
    // set?: {
    //   [K in keyof T]: any;
    // };
  };
}

export interface DeletionArgs<T extends Record<string, any>> {
  where: WhereCondition<T>;
}

export type MiddlewareMetadata = {
  entity?: string;
  source?: string;
  stream?: boolean;
  honoCtx?: any;
  nextApiRequest?: any;
  nextRequest?: any;
} & Record<string, any>;

export type MiddlewareContext = {
  operation: string; // findMany, findOne, create, createMany, update, updateMany, upsert, delete, call
  args: any;
  result?: any;
  metadata?: MiddlewareMetadata;
  user?: AuthUser | null;
};

export type MiddlewareOptions = {
  name?: string;
  required?: {
    entities: string[];
  };
};

export type MiddlewareNext = () => Promise<any>;

export type Middleware = MiddlewareOptions & {
  fn: (context: MiddlewareContext, next: MiddlewareNext) => Promise<any>;
};

export interface MiddlewareManagerInterface {
  use(middleware: Middleware, options?: MiddlewareOptions): void;
  remove(name: string): boolean;
  clear(): void;
  execute(
    context: MiddlewareContext,
    operation: () => Promise<any>
  ): Promise<any>;
}

export type OperationContext = MiddlewareMetadata & {
  user?: AuthUser | null;
};

export interface DataSourceAdapter<T extends Record<string, any>> {
  findMany(args?: FindManyArgs<T>, ctx?: OperationContext): Promise<T[]>;
  findOne(args: FindOneArgs<T>, ctx?: OperationContext): Promise<T | null>;
  create(args: CreationArgs<T>, ctx?: OperationContext): Promise<T>;
  createMany(args: CreateManyArgs<T>, ctx?: OperationContext): Promise<T[]>;
  update(args: UpdateArgs<T>, ctx?: OperationContext): Promise<T>;
  updateMany(args: UpdateManyArgs<T>, ctx?: OperationContext): Promise<T[]>;
  upsert(args: UpsertArgs<T>, ctx?: OperationContext): Promise<T>;
  upsertMany(args: UpsertManyArgs<T>, ctx?: OperationContext): Promise<T[]>;
  delete(args: DeletionArgs<T>, ctx?: OperationContext): Promise<boolean>;
  // custom methods
  [funcName: string]: (args: any, ctx?: OperationContext) => Promise<any>;
}

export interface AdapterRegistration {
  source: string;
  entity: string;
  adapter: DataSourceAdapter<any>;
}

export interface Plugin {
  entities?: Record<string, any>[];
  adapters?: AdapterRegistration[];
}

export interface RelationMapping<
  T extends Record<string, any>,
  F extends Record<string, any>
> {
  localField: keyof F;
  foreignField: keyof T;
}

export interface RepoOptions {
  entity: string;
  source?: string;
  context?: Record<string, any>;
}

export type JoinRepoOptions<
  F extends Record<string, any> = Record<string, any>,
  L extends Record<string, any> = Record<string, any>
> = RepoOptions & RelationMapping<F, L>;

export type PermissionRule =
  | boolean
  | string
  | string[]
  | ((user: AuthUser | null) => boolean)
  | ((
      user: AuthUser | null,
      entityData: Record<string, any> | Record<string, any>[] | null
    ) => boolean);

export type OperationCacheConfig =
  | {
      ttl?: string;
      grace?: string;
    }
  | boolean;

export type EntityCacheConfig = {
  findOne?: OperationCacheConfig;
  findMany?: OperationCacheConfig;
  create?: OperationCacheConfig;
  createMany?: OperationCacheConfig;
  update?: OperationCacheConfig;
  updateMany?: OperationCacheConfig;
  upsert?: OperationCacheConfig;
  upsertMany?: OperationCacheConfig;
  delete?: OperationCacheConfig;
} & {
  [operation: string]: OperationCacheConfig;
};

export interface I18nConfig {
  prompt?: string;
  model?: string;
}

export interface FieldConfig {
  i18n?: I18nConfig | boolean;
}

export interface EntityConfig {
  defaultSource?: string;

  // Cache configurations
  cache?: EntityCacheConfig;

  // Permission configurations
  allowApiCrud?: PermissionRule;
  allowApiRead?: PermissionRule;
  allowApiCreate?: PermissionRule;
  allowApiUpdate?: PermissionRule;
  allowApiDelete?: PermissionRule;

  // Field configurations
  fields?: {
    [fieldName: string]: FieldConfig;
  };

  // Init data
  initData?: Record<string, any>[];
}

export interface EntityConfigs {
  [entityName: string]: EntityConfig;
}

export interface GlobalAdapterConfig {
  source: string;
  factory: (entityClassName: string) => DataSourceAdapter<any>;
}

export interface BaseURPCConfig {
  plugins: Plugin[];
  middlewares?: Middleware[];
  entityConfigs?: EntityConfigs;
  globalAdapters?: GlobalAdapterConfig[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  [key: string]: any;
}
