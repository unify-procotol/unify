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

export class LocalStorageAdapter<
  T extends Record<string, any>
> extends BaseAdapter<T> {
  static displayName = "LocalStorageAdapter";
  static get name() {
    return "localstorage";
  }

  private storeName: string;
  private prefix: string;
  private storageKey: string;

  constructor(
    options: {
      storeName?: string;
      prefix?: string;
    } = {}
  ) {
    super();
    this.storeName = options.storeName || "default_store";
    this.prefix = options.prefix || "urpc_";
    this.storageKey = `${this.prefix}${this.storeName}`;
  }

  private checkLocalStorageAvailable(): void {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new Error("localStorage is not available in this environment");
    }
  }

  private getItems(): T[] {
    this.checkLocalStorageAvailable();

    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return [];
      }

      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn(
        `Failed to parse localStorage data for key ${this.storageKey}:`,
        error
      );
      return [];
    }
  }

  private setItems(items: T[]): void {
    this.checkLocalStorageAvailable();

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        throw new Error(
          "localStorage quota exceeded. Unable to store more data."
        );
      }
      throw new Error(`Failed to save data to localStorage: ${error}`);
    }
  }

  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    const items = this.getItems();
    return processFindManyArgs(items, args);
  }

  async findOne(args: FindOneArgs<T>): Promise<T | null> {
    const items = this.getItems();
    const item = items.find((item) => matchesWhere(item, args.where));
    return item || null;
  }

  async create(args: CreationArgs<T>): Promise<T> {
    const items = this.getItems();
    const newItem = {
      ...args.data,
    } as unknown as T;

    items.push(newItem);
    this.setItems(items);
    return newItem;
  }

  async createMany(args: CreateManyArgs<T>): Promise<T[]> {
    const items = this.getItems();
    const newItems = args.data as T[];
    items.push(...newItems);
    this.setItems(items);
    return newItems;
  }

  async update(args: UpdateArgs<T>): Promise<T> {
    const items = this.getItems();
    const index = items.findIndex((item) => matchesWhere(item, args.where));

    if (index === -1) {
      throw new Error("Item not found");
    }

    const updatedItem = {
      ...items[index],
      ...args.data,
    } as T;

    items[index] = updatedItem;
    this.setItems(items);
    return updatedItem;
  }

  async updateMany(args: UpdateManyArgs<T>): Promise<T[]> {
    const items = this.getItems();
    const updatedItems: T[] = [];

    for (let i = 0; i < items.length; i++) {
      if (matchesWhere(items[i], args.where)) {
        const updatedItem = {
          ...items[i],
          ...args.data,
        } as T;

        items[i] = updatedItem;
        updatedItems.push(updatedItem);
      }
    }

    if (updatedItems.length > 0) {
      this.setItems(items);
    }

    return updatedItems;
  }

  async delete(args: DeletionArgs<T>): Promise<boolean> {
    const items = this.getItems();
    const initialLength = items.length;
    const filteredItems = items.filter(
      (item) => !matchesWhere(item, args.where)
    );

    if (filteredItems.length < initialLength) {
      this.setItems(filteredItems);
      return true;
    }

    return false;
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
        const res = await this.create({ data: item });
        upsertedItems.push(res);
      }
    }
    return upsertedItems;
  }

  /**
   * Clear all data from the store
   */
  async clearStore(): Promise<void> {
    this.checkLocalStorageAvailable();
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Get the current size of stored data in bytes (approximate)
   */
  getStorageSize(): number {
    this.checkLocalStorageAvailable();
    const data = localStorage.getItem(this.storageKey);
    return data ? new Blob([data]).size : 0;
  }

  /**
   * Check if localStorage has sufficient space for data
   */
  checkQuota(): { used: number; available: number } {
    this.checkLocalStorageAvailable();

    // Estimate localStorage usage
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length;
      }
    }

    // Most browsers have a 5-10MB limit for localStorage
    const estimatedLimit = 5 * 1024 * 1024; // 5MB

    return {
      used: totalSize,
      available: estimatedLimit - totalSize,
    };
  }
}
