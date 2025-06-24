import type {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
} from "./types";

export class Repository<T extends Record<string, any>> {
  private adapter: DataSourceAdapter<T>;

  constructor(adapter: DataSourceAdapter<T>) {
    this.adapter = adapter;
  }

  async findMany(args?: FindManyArgs<T>) {
    return this.adapter.findMany(args);
  }

  async findOne(args: FindOneArgs<T>) {
    return this.adapter.findOne(args);
  }

  async create(args: CreationArgs<T>) {
    return this.adapter.create(args);
  }

  async update(args: UpdateArgs<T>) {
    return this.adapter.update(args);
  }

  async delete(args: DeletionArgs<T>) {
    return this.adapter.delete(args);
  }
}
