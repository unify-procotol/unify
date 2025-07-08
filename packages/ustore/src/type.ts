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

export type WhereCondition<T> = {
  [K in keyof T]?: T[K];
};

export type WhereConditionWithOperators<T> = {
  [K in keyof T]?: T[K] | QueryOperators<T[K]>;
};

export interface FindManyArgs<T extends Record<string, any>> {
  limit?: number;
  offset?: number;
  where?: WhereConditionWithOperators<T>;
  order_by?: Partial<Record<keyof T, "asc" | "desc">>;
}

export interface FindOneArgs<T extends Record<string, any>> {
  where: WhereCondition<T>;
}

export interface CreationArgs<T extends Record<string, any>> {
  data: Partial<T>;
}

export interface UpdateArgs<T extends Record<string, any>> {
  where: WhereCondition<T>;
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
  update(args: UpdateArgs<T>): Promise<T>;
  upsert(args: UpsertArgs<T>): Promise<T>;
  delete(args: DeletionArgs<T>): Promise<boolean>;
}
