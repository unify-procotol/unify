import { getGlobalMiddlewareManager } from "./middleware-manager";
import type {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  MiddlewareContext,
  MiddlewareMetadata,
} from "./types";

export class Repository<T extends Record<string, any>> {
  private adapter: DataSourceAdapter<T>;

  constructor(adapter: DataSourceAdapter<T>) {
    this.adapter = adapter;
  }

  async findMany(
    args?: FindManyArgs<T>,
    metadata?: MiddlewareMetadata
  ): Promise<T[]> {
    const context: MiddlewareContext<T> = {
      args,
      operation: "findMany",
      adapter: this.adapter,
      metadata: metadata,
    };

    return getGlobalMiddlewareManager().execute(context, async () => {
      return this.adapter.findMany(args);
    });
  }

  async findOne(
    args: FindOneArgs<T>,
    metadata?: MiddlewareMetadata
  ): Promise<T | null> {
    const context: MiddlewareContext<T> = {
      args,
      operation: "findOne",
      adapter: this.adapter,
      metadata: metadata,
    };

    return getGlobalMiddlewareManager().execute(context, async () => {
      return this.adapter.findOne(args);
    });
  }

  async create(
    args: CreationArgs<T>,
    metadata?: MiddlewareMetadata
  ): Promise<T> {
    const context: MiddlewareContext<T> = {
      args,
      operation: "create",
      adapter: this.adapter,
      metadata: metadata,
    };

    return getGlobalMiddlewareManager().execute(context, async () => {
      const result = await this.adapter.create(args);
      return result;
    });
  }

  async update(args: UpdateArgs<T>, metadata?: MiddlewareMetadata): Promise<T> {
    const context: MiddlewareContext<T> = {
      args,
      operation: "update",
      adapter: this.adapter,
      metadata: metadata,
    };

    return getGlobalMiddlewareManager().execute(context, async () => {
      return this.adapter.update(args);
    });
  }

  async delete(
    args: DeletionArgs<T>,
    metadata?: MiddlewareMetadata
  ): Promise<boolean> {
    const context: MiddlewareContext<T> = {
      args,
      operation: "delete",
      adapter: this.adapter,
      metadata: metadata,
    };

    return getGlobalMiddlewareManager().execute(context, async () => {
      const result = await this.adapter.delete(args);
      return result;
    });
  }
}
