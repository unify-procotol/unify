export interface BaseEntity {}

// 查询操作符类型
export type QueryOperators<T> = {
  $gt?: T;
  $gte?: T;
  $lt?: T;
  $lte?: T;
  $eq?: T;
  $ne?: T;
  $in?: T[];
  $nin?: T[];
};

// 扩展的查询条件类型
export type WhereCondition<T> = {
  [K in keyof T]?: T[K] | QueryOperators<T[K]>;
};

// 关系配置接口
export interface RelationConfig<T extends BaseEntity, R extends BaseEntity> {
  fields?: {
    [key: string]: string;
  };
  findOptions?: {
    limit?: number;
    orderBy?: Partial<Record<keyof R, "asc" | "desc">>;
    where?: WhereCondition<R>;
  };
}

// Select 类型定义 - 提取被 @Relations 装饰的字段
export type RelationFields<T> = {
  [K in keyof T]: T[K] extends (infer U)[]
    ? U extends Record<string, any>
      ? K
      : never
    : T[K] extends Record<string, any> | undefined
    ? K extends string
      ? T[K] extends string | number | boolean | Date | null | undefined
        ? never
        : K
      : never
    : never;
}[keyof T];

export interface FindManyArgs<T extends BaseEntity> {
  limit?: number;
  offset?: number;
  where?: WhereCondition<T>;
  order_by?: Partial<Record<keyof T, "asc" | "desc">>;
  include?: {
    [K in RelationFields<T>]?: boolean;
  };
}

export interface FindOneArgs<T extends BaseEntity> {
  where: WhereCondition<T>;
  include?: {
    [K in RelationFields<T>]?: boolean;
  };
}

export interface CreationArgs<T extends BaseEntity> {
  data: Partial<T>;
}

export interface UpdateArgs<T extends BaseEntity> {
  where: WhereCondition<T>;
  data: Partial<T>;
}

export interface DeletionArgs<T extends BaseEntity> {
  where: WhereCondition<T>;
}

export interface DataSourceAdapter<T extends BaseEntity> {
  findMany(args?: FindManyArgs<T>): Promise<T[]>;
  findOne(args: FindOneArgs<T>): Promise<T | null>;
  create(args: CreationArgs<T>): Promise<T>;
  update(args: UpdateArgs<T>): Promise<T>;
  delete(args: DeletionArgs<T>): Promise<boolean>;
}

// 关系元数据存储
export interface RelationMetadata {
  type: "toOne" | "toMany";
  target: () => any;
  config?: RelationConfig<any, any>;
  foreignKey?: string;
}

// 存储实体关系元数据的全局 Map
export const relationMetadataMap = new Map<
  string,
  Map<string, RelationMetadata>
>();
