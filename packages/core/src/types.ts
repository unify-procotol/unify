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

// 关联查询回调函数类型 - 接收完整的实体对象
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
  where?: WhereCondition<T>;
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

export interface UpdateArgs<T extends Record<string, any>> {
  where: WhereCondition<T>;
  data: Partial<T>;
}

export interface DeletionArgs<T extends Record<string, any>> {
  where: WhereCondition<T>;
}

export interface DataSourceAdapter<T extends Record<string, any>> {
  findMany(args?: FindManyArgs<T>): Promise<T[]>;
  findOne(args: FindOneArgs<T>): Promise<T | null>;
  create(args: CreationArgs<T>): Promise<T>;
  update(args: UpdateArgs<T>): Promise<T>;
  delete(args: DeletionArgs<T>): Promise<boolean>;
}
