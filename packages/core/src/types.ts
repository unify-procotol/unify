export interface BaseEntity {}

export interface FindManyArgs<T extends BaseEntity> {
  limit?: number;
  offset?: number;
  where?: Partial<T>;
  order_by?: Partial<Record<keyof T, "asc" | "desc">>;
}

export interface FindOneArgs<T extends BaseEntity> {
  where: Partial<T>;
}

export interface CreationArgs<T extends BaseEntity> {
  data: Partial<T>;
}

export interface UpdateArgs<T extends BaseEntity> {
  where: Partial<T>;
  data: Partial<T>;
}

export interface DeletionArgs<T extends BaseEntity> {
  where: Partial<T>;
}

export interface DataSourceAdapter<T extends BaseEntity> {
  findMany(args: FindManyArgs<T>): Promise<T[]>;
  findOne(args: FindOneArgs<T>): Promise<T | null>;
  create(args: CreationArgs<T>): Promise<T>;
  update(args: UpdateArgs<T>): Promise<T>;
  delete(args: DeletionArgs<T>): Promise<boolean>;
}
