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
} from "@unilab/urpc-core";
import { matchesWhere, processFindManyArgs, performUpsert } from "../utils";

export interface MockAdapterOptions {
  /** Simulated delay time in milliseconds */
  delay?: number;
  /** Whether to simulate network errors */
  simulateNetworkError?: boolean;
  /** Error occurrence rate (0-1) */
  errorRate?: number;
  /** Custom error message */
  errorMessage?: string;
}

export class MockAdapter<T extends Record<string, any>> extends BaseAdapter<T> {
  static displayName = "MockAdapter";
  static get name() { return "mock"; }
  private items: T[] = [];
  private options: MockAdapterOptions = {
    delay: 0,
    simulateNetworkError: false,
    errorRate: 0,
    errorMessage: "Mock network error",
  };

  constructor(options: MockAdapterOptions = {}) {
    super();
    this.options = {
      delay: 0,
      simulateNetworkError: false,
      errorRate: 0,
      errorMessage: "Mock network error",
      ...options,
    };
  }

  /**
   * Simulate delay
   */
  private async simulateDelay(): Promise<void> {
    if (this.options.delay && this.options.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.options.delay));
    }
  }

  /**
   * Simulate error
   */
  private simulateError(): void {
    if (
      this.options.simulateNetworkError &&
      this.options.errorRate &&
      Math.random() < this.options.errorRate
    ) {
      throw new Error(this.options.errorMessage);
    }
  }

  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    await this.simulateDelay();
    this.simulateError();
    return processFindManyArgs(this.items, args);
  }

  async findOne(args: FindOneArgs<T>): Promise<T | null> {
    await this.simulateDelay();
    this.simulateError();
    const item = this.items.find((item) => matchesWhere(item, args.where));
    if (item) {
      return item;
    }
    return null;
  }

  async create(args: CreationArgs<T>): Promise<T> {
    await this.simulateDelay();
    this.simulateError();
    const newItem = {
      ...args.data,
    } as unknown as T;

    this.items.push(newItem);
    return newItem;
  }

  async createMany(args: CreateManyArgs<T>): Promise<T[]> {
    await this.simulateDelay();
    this.simulateError();
    const newItems = args.data.map(data => ({
      ...data,
    } as unknown as T));

    this.items.push(...newItems);
    return newItems;
  }

  async update(args: UpdateArgs<T>): Promise<T> {
    await this.simulateDelay();
    this.simulateError();
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
    await this.simulateDelay();
    this.simulateError();
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
    await this.simulateDelay();
    this.simulateError();
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => !matchesWhere(item, args.where));
    return this.items.length < initialLength;
  }

  async upsert(args: UpsertArgs<T>): Promise<T> {
    await this.simulateDelay();
    this.simulateError();
    return performUpsert(
      args,
      this.findOne.bind(this),
      this.update.bind(this),
      this.create.bind(this)
    );
  }
}
