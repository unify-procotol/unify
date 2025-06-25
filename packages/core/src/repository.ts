import { MiddlewareManager } from "./middleware/manager";
import type {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  Middleware,
  MiddlewareOptions,
  MiddlewareContext,
} from "./types";

export class Repository<T extends Record<string, any>> {
  private adapter: DataSourceAdapter<T>;
  private middlewareManager: MiddlewareManager<T>;

  constructor(adapter: DataSourceAdapter<T>) {
    this.adapter = adapter;
    this.middlewareManager = new MiddlewareManager<T>();
  }

  use(middleware: Middleware<T>, options?: MiddlewareOptions): this {
    this.middlewareManager.use(middleware, options);
    return this;
  }

  removeMiddleware(name: string): boolean {
    return this.middlewareManager.remove(name);
  }

  clearMiddlewares(): void {
    this.middlewareManager.clear();
  }

  async findMany(args?: FindManyArgs<T>) {
    const context: MiddlewareContext<T> = {
      args,
      operation: "findMany",
      adapter: this.adapter,
    };

    return this.middlewareManager.execute(context, async () => {
      return this.adapter.findMany(args);
    });
  }

  async findOne(args: FindOneArgs<T>) {
    const context: MiddlewareContext<T> = {
      args,
      operation: "findOne",
      adapter: this.adapter,
    };

    return this.middlewareManager.execute(context, async () => {
      return this.adapter.findOne(args);
    });
  }

  async create(args: CreationArgs<T>) {
    const context: MiddlewareContext<T> = {
      args,
      operation: "create",
      adapter: this.adapter,
    };

    return this.middlewareManager.execute(context, async () => {
      const result = await this.adapter.create(args);
      return result;
    });
  }

  async update(args: UpdateArgs<T>) {
    const context: MiddlewareContext<T> = {
      args,
      operation: "update",
      adapter: this.adapter,
    };

    return this.middlewareManager.execute(context, async () => {
      return this.adapter.update(args);
    });
  }

  async delete(args: DeletionArgs<T>) {
    const context: MiddlewareContext<T> = {
      args,
      operation: "delete",
      adapter: this.adapter,
    };

    return this.middlewareManager.execute(context, async () => {
      const result = await this.adapter.delete(args);
      return result;
    });
  }
}
