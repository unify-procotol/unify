import { getGlobalMiddlewareManager } from "./middleware-manager";
import type {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  MiddlewareMetadata,
  CallArgs,
  ReqCtx,
  PageRouterStreamResponse,
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
    return getGlobalMiddlewareManager().execute(
      {
        args,
        operation: "findMany",
        metadata: metadata,
      },
      async () => {
        return this.adapter.findMany(args);
      }
    );
  }

  async findOne(
    args: FindOneArgs<T>,
    metadata?: MiddlewareMetadata
  ): Promise<T | null> {
    return getGlobalMiddlewareManager().execute(
      {
        args,
        operation: "findOne",
        metadata: metadata,
      },
      async () => {
        return this.adapter.findOne(args);
      }
    );
  }

  async create(
    args: CreationArgs<T>,
    metadata?: MiddlewareMetadata
  ): Promise<T> {
    return getGlobalMiddlewareManager().execute(
      {
        args,
        operation: "create",
        metadata: metadata,
      },
      async () => {
        const result = await this.adapter.create(args);
        return result;
      }
    );
  }

  async update(args: UpdateArgs<T>, metadata?: MiddlewareMetadata): Promise<T> {
    return getGlobalMiddlewareManager().execute(
      {
        args,
        operation: "update",
        metadata: metadata,
      },
      async () => {
        return this.adapter.update(args);
      }
    );
  }

  async delete(
    args: DeletionArgs<T>,
    metadata?: MiddlewareMetadata
  ): Promise<boolean> {
    return getGlobalMiddlewareManager().execute(
      {
        args,
        operation: "delete",
        metadata: metadata,
      },
      async () => {
        const result = await this.adapter.delete(args);
        return result;
      }
    );
  }

  async call(
    args: CallArgs<T>,
    metadata?: MiddlewareMetadata,
    reqOptions?: ReqCtx
  ): Promise<T | Response | PageRouterStreamResponse> {
    return getGlobalMiddlewareManager().execute(
      {
        args,
        operation: "call",
        metadata: metadata,
      },
      async () => {
        const result = await this.adapter.call(args, {
          honoCtx: reqOptions?.honoCtx,
          stream: reqOptions?.stream,
        });
        return result;
      }
    );
  }
}
