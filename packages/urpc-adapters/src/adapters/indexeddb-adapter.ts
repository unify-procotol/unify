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

export class IndexedDBAdapter<
  T extends Record<string, any>
> extends BaseAdapter<T> {
  static displayName = "IndexedDBAdapter";
  static get name() {
    return "indexeddb";
  }
  private dbName: string = "urpc_db";
  private storeName: string = "default_store";
  private db: IDBDatabase | null = null;
  private version: number = 1;

  constructor(
    options: {
      dbName?: string;
      storeName?: string;
      version?: number;
    } = {}
  ) {
    super();
    this.dbName = options.dbName || "urpc_db";
    this.storeName = options.storeName || "default_store";
    this.version = options.version || 1;
  }

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject(new Error("IndexedDB is not available in this environment"));
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(
          new Error(`Failed to open IndexedDB: ${request.error?.message}`)
        );
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "id",
            autoIncrement: true,
          });

          // Create indexes for common fields
          try {
            store.createIndex("id", "id", { unique: true });
          } catch (e) {
            // Indexes might already exist
          }
        }
      };
    });
  }

  private async getStore(
    mode: IDBTransactionMode = "readonly"
  ): Promise<IDBObjectStore> {
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName], mode);
    return transaction.objectStore(this.storeName);
  }

  private async getAllItems(): Promise<T[]> {
    const store = await this.getStore("readonly");

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to get all items: ${request.error?.message}`));
      };
    });
  }

  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    const items = await this.getAllItems();
    return processFindManyArgs(items, args);
  }

  async findOne(args: FindOneArgs<T>): Promise<T | null> {
    // Optimize for id-based queries
    if (args.where.id && typeof args.where.id === "string") {
      const store = await this.getStore("readonly");

      return new Promise((resolve, reject) => {
        const request = store.get(args.where.id as string);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(new Error(`Failed to find item: ${request.error?.message}`));
        };
      });
    }

    // Fall back to scanning all items
    const items = await this.findMany({ where: args.where });
    return items[0] || null;
  }

  async create(args: CreationArgs<T>): Promise<T> {
    const store = await this.getStore("readwrite");

    const newItem = {
      ...args.data,
    } as unknown as T;

    return new Promise((resolve, reject) => {
      const request = store.add(newItem);

      request.onsuccess = () => {
        resolve(newItem);
      };

      request.onerror = () => {
        reject(new Error(`Failed to create item: ${request.error?.message}`));
      };
    });
  }

  async createMany(args: CreateManyArgs<T>): Promise<T[]> {
    const store = await this.getStore("readwrite");
    const newItems = args.data.map(
      (data) =>
        ({
          ...data,
        } as unknown as T)
    );

    return new Promise((resolve, reject) => {
      const results: T[] = [];
      let completed = 0;

      if (newItems.length === 0) {
        resolve([]);
        return;
      }

      newItems.forEach((item, index) => {
        const request = store.add(item);

        request.onsuccess = () => {
          results[index] = item;
          completed++;

          if (completed === newItems.length) {
            resolve(results);
          }
        };

        request.onerror = () => {
          reject(
            new Error(
              `Failed to create item ${index}: ${request.error?.message}`
            )
          );
        };
      });
    });
  }

  async update(args: UpdateArgs<T>): Promise<T> {
    const existing = await this.findOne({ where: args.where });
    if (!existing) {
      throw new Error("Item not found");
    }

    const store = await this.getStore("readwrite");
    const updatedItem = {
      ...existing,
      ...args.data,
    } as T;

    return new Promise((resolve, reject) => {
      const request = store.put(updatedItem);

      request.onsuccess = () => {
        resolve(updatedItem);
      };

      request.onerror = () => {
        reject(new Error(`Failed to update item: ${request.error?.message}`));
      };
    });
  }

  async updateMany(args: UpdateManyArgs<T>): Promise<T[]> {
    const allItems = await this.getAllItems();
    const itemsToUpdate = allItems.filter((item) =>
      matchesWhere(item, args.where)
    );

    if (itemsToUpdate.length === 0) {
      return [];
    }

    const store = await this.getStore("readwrite");
    const updatedItems = itemsToUpdate.map(
      (item) =>
        ({
          ...item,
          ...args.data,
        } as T)
    );

    return new Promise((resolve, reject) => {
      const results: T[] = [];
      let completed = 0;

      updatedItems.forEach((item, index) => {
        const request = store.put(item);

        request.onsuccess = () => {
          results[index] = item;
          completed++;

          if (completed === updatedItems.length) {
            resolve(results);
          }
        };

        request.onerror = () => {
          reject(
            new Error(
              `Failed to update item ${index}: ${request.error?.message}`
            )
          );
        };
      });
    });
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

  async delete(args: DeletionArgs<T>): Promise<boolean> {
    const db = await this.initDB();
    const transaction = db.transaction([this.storeName], "readwrite");
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      let deletedCount = 0;
      let processed = 0;
      let totalToProcess = 0;

      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const items = getAllRequest.result;
        const itemsToDelete = items.filter((item) =>
          matchesWhere(item, args.where)
        );

        if (itemsToDelete.length === 0) {
          resolve(false);
          return;
        }

        totalToProcess = itemsToDelete.length;

        itemsToDelete.forEach((item) => {
          const deleteRequest = store.delete(item.id.toString());

          deleteRequest.onsuccess = () => {
            deletedCount++;
            processed++;

            if (processed === totalToProcess) {
              resolve(deletedCount > 0);
            }
          };

          deleteRequest.onerror = () => {
            processed++;

            if (processed === totalToProcess) {
              resolve(deletedCount > 0);
            }
          };
        });
      };

      getAllRequest.onerror = () => {
        reject(
          new Error(`Failed to get all items: ${getAllRequest.error?.message}`)
        );
      };

      transaction.onerror = () => {
        reject(new Error(`Transaction failed: ${transaction.error?.message}`));
      };
    });
  }

  async clearStore(): Promise<void> {
    const store = await this.getStore("readwrite");

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to clear store: ${request.error?.message}`));
      };
    });
  }

  async closeDB(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async deleteDatabase(): Promise<void> {
    await this.closeDB();

    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject(new Error("IndexedDB is not available in this environment"));
        return;
      }

      const request = indexedDB.deleteDatabase(this.dbName);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(
          new Error(`Failed to delete database: ${request.error?.message}`)
        );
      };
    });
  }
}
