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
  UpsertManyArgs,
} from "./types";
import { URPCError, ErrorCodes } from "./error";

export class BaseAdapter<T extends Record<string, any>>
  implements DataSourceAdapter<T>
{
  async findMany(args?: FindManyArgs<T>, ctx?: OperationContext): Promise<T[]> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "findMany not implemented.");
  }
  async findOne(
    args: FindOneArgs<T>,
    ctx?: OperationContext
  ): Promise<T | null> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "findOne not implemented.");
  }
  async create(args: CreationArgs<T>, ctx?: OperationContext): Promise<T> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "create not implemented.");
  }
  async createMany(
    args: CreateManyArgs<T>,
    ctx?: OperationContext
  ): Promise<T[]> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "createMany not implemented.");
  }
  async update(args: UpdateArgs<T>, ctx?: OperationContext): Promise<T> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "update not implemented.");
  }
  async updateMany(
    args: UpdateManyArgs<T>,
    ctx?: OperationContext
  ): Promise<T[]> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "updateMany not implemented.");
  }
  async upsert(args: UpsertArgs<T>, ctx?: OperationContext): Promise<T> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "upsert not implemented.");
  }
  async upsertMany(
    args: UpsertManyArgs<T>,
    ctx?: OperationContext
  ): Promise<T[]> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "upsertMany not implemented.");
  }
  async delete(
    args: DeletionArgs<T>,
    ctx?: OperationContext
  ): Promise<boolean> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "delete not implemented.");
  }
  [methodName: string]: any;
}
