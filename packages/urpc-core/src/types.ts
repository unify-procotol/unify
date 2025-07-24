export type QueryOperators<T> = {
  $gt?: T;
  $gte?: T;
  $lt?: T;
  $lte?: T;
  $eq?: T;
  $ne?: T;
  $in?: T[];
  $nin?: T[];
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: "sensitive" | "insensitive";
  not?: string | null;
};

export type WhereCondition<T> = {
  [K in keyof T]?: T[K];
};

export type WhereConditionWithOperators<T> = {
  [K in keyof T]?: T[K] | QueryOperators<T[K]>;
};

export type RelationCallbackSingle<
  T extends Record<string, any>,
  R extends Record<string, any>,
> = (entity: T) => Promise<R | null>;

export type RelationCallbackMany<
  T extends Record<string, any>,
  R extends Record<string, any>,
> = (entities: T[]) => Promise<R[]>;

export interface FindManyArgs<T extends Record<string, any>> {
  limit?: number;
  offset?: number;
  where?: WhereConditionWithOperators<T>;
  order_by?: Partial<Record<keyof T, "asc" | "desc">>;
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

export interface DeletionArgs<T extends Record<string, any>> {
  where: WhereCondition<T>;
}

export interface DataSourceAdapter<T extends Record<string, any>> {
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

export interface MiddlewareMetadata {
  entity: string;
  source?: string;
  context?: {
    lang?: string;
  };
}

export type MiddlewareContext<T extends Record<string, any>> = {
  operation: string; // findMany, findOne, create, createMany, update, updateMany, upsert, delete, call
  args: any;
  result?: any;
  metadata?: MiddlewareMetadata;
};

export type MiddlewareNext<T extends Record<string, any>> = () => Promise<any>;

export type Middleware<T extends Record<string, any>> = {
  name: string;
  required?: {
    entities: string[];
  };
  fn: (context: MiddlewareContext<T>, next: MiddlewareNext<T>) => Promise<any>;
};

export type MiddlewareOptions = {
  position?: "before" | "after" | "around";
  priority?: number;
  name?: string;
  required?: {
    entities: string[];
  };
};

export interface MiddlewareManagerInterface<T extends Record<string, any>> {
  use(middleware: Middleware<T>, options?: MiddlewareOptions): void;
  remove(name: string): boolean;
  clear(): void;
  execute(
    context: MiddlewareContext<T>,
    operation: () => Promise<any>
  ): Promise<any>;
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
  F extends Record<string, any>,
> {
  localField: keyof F;
  foreignField: keyof T;
}

export interface RepoOptions {
  entity: string;
  source?: string;
  context?: {
    lang?: string;
  };
}

export type JoinRepoOptions<
  F extends Record<string, any> = Record<string, any>,
  L extends Record<string, any> = Record<string, any>,
> = RepoOptions & RelationMapping<F, L>;

export interface I18nConfig {
  prompt?: string;
  model?: string;
}

export interface FieldConfig {
  i18n?: I18nConfig | boolean;
}

export interface EntityConfig {
  defaultSource?: string;
  cache?: {
    ttl?: number;
  };
  fields?: {
    [fieldName: string]: FieldConfig;
  };
}

export interface EntityConfigs {
  [entityName: string]: EntityConfig;
}

export interface BaseURPCConfig {
  plugins: Plugin[];
  middlewares?: Middleware<any>[];
  entityConfigs?: EntityConfigs;
  globalAdapters?: (new () => DataSourceAdapter<any>)[];
}
