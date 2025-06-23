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

// Select 类型定义
export type SelectFields<T extends BaseEntity> = {
  [K in keyof T]?: boolean;
};

export interface FindManyArgs<T extends BaseEntity> {
  limit?: number;
  offset?: number;
  where?: WhereCondition<T>;
  order_by?: Partial<Record<keyof T, "asc" | "desc">>;
  select?: SelectFields<T>;
}

export interface FindOneArgs<T extends BaseEntity> {
  where: WhereCondition<T>;
  select?: SelectFields<T>;
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
  type: 'toOne' | 'toMany';
  target: () => any;
  config?: RelationConfig<any, any>;
  foreignKey?: string;
}

// 存储实体关系元数据的全局 Map
export const relationMetadataMap = new Map<string, Map<string, RelationMetadata>>();
