import {
  CreationArgs,
  DataSourceAdapter,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
} from "./types";
import { URPCError, ErrorCodes } from "./error";

export class BaseAdapter<T extends Record<string, any>>
  implements DataSourceAdapter<T>
{
  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  async findOne(args: FindOneArgs<T>): Promise<T | null> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  async create(args: CreationArgs<T>): Promise<T> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  async update(args: UpdateArgs<T>): Promise<T> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
  async delete(args: DeletionArgs<T>): Promise<boolean> {
    throw new URPCError(ErrorCodes.NOT_FOUND, "Method not implemented.");
  }
}
