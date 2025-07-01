import { getGlobalMiddlewareManager } from "./middleware-manager";
import type {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  MiddlewareContext,
} from "./types";

export class Repository<T extends Record<string, any>> {
  private adapter: DataSourceAdapter<T>;

  constructor(adapter: DataSourceAdapter<T>) {
    this.adapter = adapter;
  }

  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    const context: MiddlewareContext<T> = {
      args,
      operation: "findMany",
      adapter: this.adapter,
    };

    return getGlobalMiddlewareManager().execute(context, async () => {
      return this.adapter.findMany(args);
    });
  }

  async findOne(args: FindOneArgs<T>): Promise<T | null> {
    const context: MiddlewareContext<T> = {
      args,
      operation: "findOne",
      adapter: this.adapter,
    };

    return getGlobalMiddlewareManager().execute(context, async () => {
      return this.adapter.findOne(args);
    });
  }

  async create(args: CreationArgs<T>): Promise<T> {
    const context: MiddlewareContext<T> = {
      args,
      operation: "create",
      adapter: this.adapter,
    };

    return getGlobalMiddlewareManager().execute(context, async () => {
      const result = await this.adapter.create(args);
      return result;
    });
  }

  async update(args: UpdateArgs<T>): Promise<T> {
    const context: MiddlewareContext<T> = {
      args,
      operation: "update",
      adapter: this.adapter,
    };

    return getGlobalMiddlewareManager().execute(context, async () => {
      return this.adapter.update(args);
    });
  }

  async delete(args: DeletionArgs<T>): Promise<boolean> {
    const context: MiddlewareContext<T> = {
      args,
      operation: "delete",
      adapter: this.adapter,
    };

    return getGlobalMiddlewareManager().execute(context, async () => {
      const result = await this.adapter.delete(args);
      return result;
    });
  }
}

export class BaseAdapter<T extends Record<string, any>>
  implements DataSourceAdapter<T>
{
  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    return [];
  }
  async findOne(args: FindOneArgs<T>): Promise<T | null> {
    return null;
  }
  async create(args: CreationArgs<T>): Promise<T> {
    throw new Error("Method not implemented.");
  }
  async update(args: UpdateArgs<T>): Promise<T> {
    throw new Error("Method not implemented.");
  }
  async delete(args: DeletionArgs<T>): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
