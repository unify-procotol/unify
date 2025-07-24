import {
  CreationArgs,
  CreateManyArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  UpdateManyArgs,
  UpsertArgs,
  OperationContext,
} from "./types";
import { URPCError, ErrorCodes } from "./error";

export class BaseAdapter<T extends Record<string, any>>
  implements DataSourceAdapter<T>
{
  async findMany(args?: FindManyArgs<T>, ctx?: OperationContext): Promise<T[]> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  async findOne(
    args: FindOneArgs<T>,
    ctx?: OperationContext
  ): Promise<T | null> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  async create(args: CreationArgs<T>, ctx?: OperationContext): Promise<T> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  async createMany(
    args: CreateManyArgs<T>,
    ctx?: OperationContext
  ): Promise<T[]> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  async update(args: UpdateArgs<T>, ctx?: OperationContext): Promise<T> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  async updateMany(
    args: UpdateManyArgs<T>,
    ctx?: OperationContext
  ): Promise<T[]> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  async upsert(args: UpsertArgs<T>, ctx?: OperationContext): Promise<T> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  async delete(
    args: DeletionArgs<T>,
    ctx?: OperationContext
  ): Promise<boolean> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  [methodName: string]: any;
}
