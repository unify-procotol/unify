import {
  CreateArgs,
  DeleteArgs,
  FindOneArgs,
  QueryArgs,
  UpdateArgs,
} from "../types";

export interface Storage {
  create(
    sourceId: string,
    tableName: string,
    args: CreateArgs
  ): Promise<Record<string, any>>;

  findMany(
    sourceId: string,
    tableName: string,
    args?: QueryArgs
  ): Promise<Record<string, any>[]>;

  findOne(
    sourceId: string,
    tableName: string,
    args: FindOneArgs
  ): Promise<Record<string, any> | null>;

  update(
    sourceId: string,
    tableName: string,
    args: UpdateArgs
  ): Promise<Record<string, any> | null>;

  delete(
    sourceId: string,
    tableName: string,
    args: DeleteArgs
  ): Promise<boolean>;

  truncate(sourceId: string, tableName: string): Promise<void>;

  tableExists(sourceId: string, tableName: string): Promise<boolean>;

  close?(): Promise<void>;
}
