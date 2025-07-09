import {
  BaseAdapter,
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  UpsertArgs,
  WhereCondition,
} from "@unilab/urpc-core";
import { matchesWhere, processFindManyArgs, performUpsert } from "../utils";

export class MemoryAdapter<
  T extends Record<string, any>,
> extends BaseAdapter<T> {
  private items: T[] = [];

  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    return processFindManyArgs(this.items, args);
  }

  async findOne(args: FindOneArgs<T>): Promise<T | null> {
    const item = this.items.find((item) => matchesWhere(item, args.where));
    if (item) {
      return item;
    }
    return null;
  }

  async create(args: CreationArgs<T>): Promise<T> {
    const newItem = {
      ...args.data,
    } as unknown as T;

    this.items.push(newItem);
    return newItem;
  }

  async update(args: UpdateArgs<T>): Promise<T> {
    const index = this.items.findIndex((item) =>
      matchesWhere(item, args.where)
    );
    if (index === -1) {
      throw new Error("Item not found");
    }

    const updatedItem = {
      ...this.items[index],
      ...args.data,
    } as T;

    this.items[index] = updatedItem;
    return updatedItem;
  }

  async delete(args: DeletionArgs<T>): Promise<boolean> {
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => !matchesWhere(item, args.where));
    return this.items.length < initialLength;
  }

  async upsert(args: UpsertArgs<T>): Promise<T> {
    return performUpsert(
      args,
      this.findOne.bind(this),
      this.update.bind(this),
      this.create.bind(this)
    );
  }
}
