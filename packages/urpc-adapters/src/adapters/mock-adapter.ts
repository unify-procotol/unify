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

export interface MockAdapterOptions {
  /** Simulated delay time in milliseconds */
  delay?: number;
}

export class MockAdapter<T extends Record<string, any>> extends BaseAdapter<T> {
  static displayName = "MockAdapter";
  static get name() {
    return "mock";
  }
  private data: T[] = [];
  private delay: number;

  constructor(options: { delay?: number; data?: T[] } = {}) {
    super();
    this.delay = options.delay || 0;
    this.data = options.data || [];
  }

  private async simulateDelay(): Promise<void> {
    if (this.delay && this.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }
  }

  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    await this.simulateDelay();
    return processFindManyArgs(this.data, args);
  }

  async findOne(args: FindOneArgs<T>): Promise<T | null> {
    await this.simulateDelay();
    const item = this.data.find((item) => matchesWhere(item, args.where));
    if (item) {
      return item;
    }
    return null;
  }

  async create(args: CreationArgs<T>): Promise<T> {
    await this.simulateDelay();

    const newItem = {
      ...args.data,
    } as unknown as T;

    this.data.push(newItem);
    return newItem;
  }

  async createMany(args: CreateManyArgs<T>): Promise<T[]> {
    await this.simulateDelay();
    const newItems = args.data as T[];
    this.data.push(...newItems);
    return newItems;
  }

  async update(args: UpdateArgs<T>): Promise<T> {
    await this.simulateDelay();
    const index = this.data.findIndex((item) => matchesWhere(item, args.where));
    if (index === -1) {
      throw new Error("Item not found");
    }

    const updatedItem = {
      ...this.data[index],
      ...args.data,
    } as T;

    this.data[index] = updatedItem;
    return updatedItem;
  }

  async updateMany(args: UpdateManyArgs<T>): Promise<T[]> {
    await this.simulateDelay();

    const updatedItems: T[] = [];

    for (let i = 0; i < this.data.length; i++) {
      if (matchesWhere(this.data[i], args.where)) {
        const updatedItem = {
          ...this.data[i],
          ...args.data,
        } as T;

        this.data[i] = updatedItem;
        updatedItems.push(updatedItem);
      }
    }

    return updatedItems;
  }

  async delete(args: DeletionArgs<T>): Promise<boolean> {
    await this.simulateDelay();
    const initialLength = this.data.length;
    this.data = this.data.filter((item) => !matchesWhere(item, args.where));
    return this.data.length < initialLength;
  }

  async upsert(args: UpsertArgs<T>): Promise<T> {
    await this.simulateDelay();
    return performUpsert(
      args,
      this.findOne.bind(this),
      this.update.bind(this),
      this.create.bind(this)
    );
  }

  async upsertMany(args: UpsertManyArgs<T>): Promise<T[]> {
    await this.simulateDelay();
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
