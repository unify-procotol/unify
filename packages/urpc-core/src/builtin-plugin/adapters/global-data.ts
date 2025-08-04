import { BaseAdapter } from "../../adapter";
import { ErrorCodes, URPCError } from "../../error";
import {
  CreateManyArgs,
  CreationArgs,
  DeletionArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  UpsertArgs,
} from "../../types";
import { _DataEntity } from "../entities/_data";

export class GlobalDataAdapter extends BaseAdapter<_DataEntity> {
  static displayName = "URPCDataAdapter";

  private data: _DataEntity[] = [];

  async findMany(args?: FindManyArgs<_DataEntity>): Promise<_DataEntity[]> {
    const where = args?.where || {};
    const _key = where.key;
    const key = typeof _key === "string" ? _key : _key?.$eq;
    if (!key) {
      return this.data;
    }

    return this.data.filter((item) => item.key === key);
  }

  async findOne(args: FindOneArgs<_DataEntity>): Promise<_DataEntity | null> {
    const where = args.where;
    const key = where.key;
    if (!key) {
      return null;
    }
    return this.data.find((item) => item.key === key) || null;
  }

  async create(args: CreationArgs<_DataEntity>): Promise<_DataEntity> {
    const data = args.data;
    const key = data.key;
    const value = data.value;
    if (!key || !value) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "Key and value are required");
    }

    const item = {
      key,
      value,
    };
    this.data.push(item);
    return item;
  }

  async createMany(args: CreateManyArgs<_DataEntity>): Promise<_DataEntity[]> {
    const newItems = args.data as _DataEntity[];
    this.data.push(...newItems);
    return newItems;
  }

  async update(args: UpdateArgs<_DataEntity>): Promise<_DataEntity> {
    const data = args.data;
    const key = data.key;
    const value = data.value;
    if (!key || !value) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "Key and value are required");
    }

    const item = this.data.find((item) => item.key === key);
    if (!item) {
      throw new URPCError(ErrorCodes.NOT_FOUND, "Key not found");
    }
    item.value = value;
    return item;
  }

  async upsert(args: UpsertArgs<_DataEntity>): Promise<_DataEntity> {
    const existing = await this.findOne({ where: args.where });
    if (existing) {
      return this.update({ where: args.where, data: args.update });
    } else {
      return this.create({ data: args.create });
    }
  }

  async delete(args: DeletionArgs<_DataEntity>): Promise<boolean> {
    const initialLength = this.data.length;
    this.data = this.data.filter((item) => item.key !== args.where.key);
    return this.data.length < initialLength;
  }
}
