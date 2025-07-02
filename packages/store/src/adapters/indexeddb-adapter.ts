import type {
  DataSourceAdapter,
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  WhereCondition,
  UpsertArgs,
} from "@unilab/core";
import {
  EntityConstructor,
  matchesWhere,
  processFindManyArgs,
  performUpsert,
} from "../utils";

/**
 * IndexedDB adapter for browser persistent storage
 * 基于 IndexedDB 的浏览器持久化存储适配器
 */
export class IndexedDBAdapter<T extends Record<string, any>>
  implements DataSourceAdapter<T>
{
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;
  private EntityClass: EntityConstructor<T>;
  private version: number = 1;

  constructor(
    EntityClass: EntityConstructor<T>,
    options: {
      dbName?: string;
      storeName?: string;
      version?: number;
    } = {}
  ) {
    this.EntityClass = EntityClass;
    this.dbName = options.dbName || `unify`;
    this.storeName = options.storeName || EntityClass.name.toLowerCase();
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

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: "id",
            autoIncrement: false,
          });

          // Create indexes for common fields
          try {
            store.createIndex("id", "id", { unique: true });
          } catch (e) {
            // Index might already exist
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

  private async getAllEntities(): Promise<T[]> {
    const store = await this.getStore("readonly");

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result.map(
          (data) => new this.EntityClass(data)
        );
        resolve(results);
      };

      request.onerror = () => {
        reject(
          new Error(`Failed to get all entities: ${request.error?.message}`)
        );
      };
    });
  }

  async findMany(args?: FindManyArgs<T>): Promise<T[]> {
    const entities = await this.getAllEntities();
    return processFindManyArgs(entities, args);
  }

  async findOne(args: FindOneArgs<T>): Promise<T | null> {
    // Optimize for id-based queries
    if (args.where.id && typeof args.where.id === "string") {
      const store = await this.getStore("readonly");

      return new Promise((resolve, reject) => {
        const request = store.get(args.where.id as string);

        request.onsuccess = () => {
          if (request.result) {
            resolve(new this.EntityClass(request.result));
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          reject(new Error(`Failed to find entity: ${request.error?.message}`));
        };
      });
    }

    // Fall back to scanning all entities
    const entities = await this.getAllEntities();

    for (const entity of entities) {
      if (matchesWhere(entity, args.where)) {
        return entity;
      }
    }

    return null;
  }

  async create(args: CreationArgs<T>): Promise<T> {
    const entity = new this.EntityClass(args.data);
    const store = await this.getStore("readwrite");

    return new Promise((resolve, reject) => {
      const request = store.add(entity);

      request.onsuccess = () => {
        resolve(entity);
      };

      request.onerror = () => {
        reject(new Error(`Failed to create entity: ${request.error?.message}`));
      };
    });
  }

  async update(args: UpdateArgs<T>): Promise<T> {
    const existing = await this.findOne({ where: args.where });

    if (!existing) {
      throw new Error("Entity not found for update");
    }

    // Update entity properties
    Object.assign(existing, args.data);

    const store = await this.getStore("readwrite");

    return new Promise((resolve, reject) => {
      const request = store.put(existing);

      request.onsuccess = () => {
        resolve(existing);
      };

      request.onerror = () => {
        reject(new Error(`Failed to update entity: ${request.error?.message}`));
      };
    });
  }

  async delete(args: DeletionArgs<T>): Promise<boolean> {
    // Optimize for id-based deletion
    if (args.where.id && typeof args.where.id === "string") {
      const store = await this.getStore("readwrite");

      return new Promise((resolve, reject) => {
        const request = store.delete(args.where.id as string);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          reject(
            new Error(`Failed to delete entity: ${request.error?.message}`)
          );
        };
      });
    }

    // Fall back to scanning and deleting matching entities
    const entities = await this.getAllEntities();
    let deleted = false;
    const store = await this.getStore("readwrite");

    for (const entity of entities) {
      if (matchesWhere(entity, args.where)) {
        await new Promise<void>((resolve, reject) => {
          const request = store.delete(entity.id);

          request.onsuccess = () => {
            deleted = true;
            resolve();
          };

          request.onerror = () => {
            reject(
              new Error(`Failed to delete entity: ${request.error?.message}`)
            );
          };
        });
      }
    }

    return deleted;
  }

  // Additional utility methods
  async count(args?: { where?: WhereCondition<T> }): Promise<number> {
    if (!args?.where) {
      const store = await this.getStore("readonly");

      return new Promise((resolve, reject) => {
        const request = store.count();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(
            new Error(`Failed to count entities: ${request.error?.message}`)
          );
        };
      });
    }

    const entities = await this.getAllEntities();
    return entities.filter((entity) => matchesWhere(entity, args.where!))
      .length;
  }

  async upsert(args: UpsertArgs<T>): Promise<T> {
    return performUpsert(
      args,
      this.findOne.bind(this),
      this.update.bind(this),
      this.create.bind(this)
    );
  }

  // Database management methods
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
