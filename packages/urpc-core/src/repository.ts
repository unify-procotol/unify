import { ErrorCodes, URPCError } from "./error";
import { getGlobalMiddlewareManager } from "./middleware-manager";
import type {
  CreationArgs,
  CreateManyArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  UpdateManyArgs,
  UpsertArgs,
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

  async createMany(
    args: CreateManyArgs<T>,
    metadata?: MiddlewareMetadata
  ): Promise<T[]> {
    return getGlobalMiddlewareManager().execute(
      {
        args,
        operation: "createMany",
        metadata: metadata,
      },
      async () => {
        return this.adapter.createMany(args);
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

  async updateMany(
    args: UpdateManyArgs<T>,
    metadata?: MiddlewareMetadata
  ): Promise<T[]> {
    return getGlobalMiddlewareManager().execute(
      {
        args,
        operation: "updateMany",
        metadata: metadata,
      },
      async () => {
        return this.adapter.updateMany(args);
      }
    );
  }

  async upsert(args: UpsertArgs<T>, metadata?: MiddlewareMetadata): Promise<T> {
    return getGlobalMiddlewareManager().execute(
      {
        args,
        operation: "upsert",
        metadata: metadata,
      },
      async () => {
        return this.adapter.upsert(args);
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

  async customMethod(
    methodName: string,
    args: any,
    metadata?: MiddlewareMetadata
  ) {
    if (!this.adapter[methodName]) {
      throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
    }
    return getGlobalMiddlewareManager().execute(
      {
        args,
        operation: methodName,
        metadata: metadata,
      },
      async () => {
        return this.adapter[methodName](args);
      }
    );
  }
}
