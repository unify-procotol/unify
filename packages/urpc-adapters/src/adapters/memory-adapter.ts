import {
  BaseAdapter,
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  CreateManyArgs,
  UpdateArgs,
  UpdateManyArgs,
  DeletionArgs,
  UpsertArgs,
  UpsertManyArgs,
  WhereCondition,
} from "@unilab/urpc-core";
import { matchesWhere, processFindManyArgs, performUpsert } from "../utils";

export class MemoryAdapter<
  T extends Record<string, any>
> extends BaseAdapter<T> {
  static displayName = "MemoryAdapter";
  static get name() {
    return "memory";
  }
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

  async createMany(args: CreateManyArgs<T>): Promise<T[]> {
    const newItems = args.data.map(
      (data) =>
        ({
          ...data,
        } as unknown as T)
    );

    this.items.push(...newItems);
    return newItems;
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

  async updateMany(args: UpdateManyArgs<T>): Promise<T[]> {
    const updatedItems: T[] = [];

    for (let i = 0; i < this.items.length; i++) {
      if (matchesWhere(this.items[i], args.where)) {
        const updatedItem = {
          ...this.items[i],
          ...args.data,
        } as T;

        this.items[i] = updatedItem;
        updatedItems.push(updatedItem);
      }
    }

    return updatedItems;
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

  async upsertMany(args: UpsertManyArgs<T>): Promise<T[]> {
    const upsertedItems: T[] = [];
    const { data, onConflictDoUpdate } = args;
    for (const item of data) {
      const k = onConflictDoUpdate.target;
      const v = item[k];
      if (v) {
        const res = await performUpsert(
          {
            where: { [k]: v } as WhereCondition<T>,
            create: item,
            update: item,
          },
          this.findOne.bind(this),
          this.update.bind(this),
          this.create.bind(this)
        );
        upsertedItems.push(res);
      } else {
        const res = await this.create({
          data: item,
        });
        upsertedItems.push(res);
      }
    }
    return upsertedItems;
  }
}
