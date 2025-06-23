import type {
  BaseEntity,
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
} from "./types";

// 适配器注册表
const adapterRegistry = new Map<string, () => DataSourceAdapter<any>>();

export class Repository<T extends BaseEntity> {
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

// 注册自定义适配器， 提供给hono后端使用
export function registerAdapter<T extends BaseEntity>(
  name: string,
  adapterFactory: () => DataSourceAdapter<T>
) {
  adapterRegistry.set(name, adapterFactory);
}

// 在前端使用
export function Repo<T extends BaseEntity>(
  entityName: string,
  source: string
): Repository<T> {
  const adapterFactory = adapterRegistry.get(source);

  if (!adapterFactory) {
    throw new Error(`Unknown data source: ${source}`);
  }

  const adapter = adapterFactory();
  return new Repository<T>(adapter);
}
