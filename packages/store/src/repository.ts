import type {
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  WhereCondition,
  UpsertArgs,
} from "@unilab/core";
import { MemoryAdapter, IndexedDBAdapter } from "./adapters";

type EntityConstructor<T> = new (...args: any[]) => T;

const adapterRegistry = new Map<
  string,
  MemoryAdapter<any> | IndexedDBAdapter<any>
>();

/**
 * Create or get repository for entity with specified adapter type
 *
 * @param EntityClass - Entity class constructor
 * @param adapterType - Adapter type (currently supports "memory")
 * @param options - Configuration options
 * @returns Repository instance
 */
export function repo<T extends Record<string, any>>(
  EntityClass: EntityConstructor<T>,
  adapterType: "memory" | "indexeddb" = "memory",
  options: {
    maxSize?: number;
    dbName?: string;
    storeName?: string;
    version?: number;
  } = {}
) {
  const entityName = EntityClass.name;
  const registryKey = `${entityName}-${adapterType}`;

  // Get or create adapter
  let adapter = adapterRegistry.get(registryKey) as
    | MemoryAdapter<T>
    | IndexedDBAdapter<T>;

  if (!adapter) {
    if (adapterType === "memory") {
      adapter = new MemoryAdapter(EntityClass, options.maxSize || 5);
      adapterRegistry.set(registryKey, adapter);
    } else if (adapterType === "indexeddb") {
      adapter = new IndexedDBAdapter(EntityClass, {
        dbName: options.dbName,
        storeName: options.storeName,
        version: options.version,
      });
      adapterRegistry.set(registryKey, adapter);
    } else {
      throw new Error(`Unsupported adapter type: ${adapterType}`);
    }
  }

  return {
    async create(args: CreationArgs<T>): Promise<T> {
      return adapter.create(args);
    },

    async update(args: UpdateArgs<T>): Promise<T> {
      return adapter.update(args);
    },

    async upsert(args: UpsertArgs<T>): Promise<T> {
      return adapter.upsert(args);
    },

    async findOne(args: FindOneArgs<T>): Promise<T | null> {
      return adapter.findOne(args);
    },

    async findMany(args?: FindManyArgs<T>): Promise<T[]> {
      return adapter.findMany(args);
    },

    async delete(args: DeletionArgs<T>): Promise<boolean> {
      return adapter.delete(args);
    },

    async count(args?: { where?: WhereCondition<T> }): Promise<number> {
      return adapter.count(args);
    },
  };
}

/**
 * Clear all cached adapters
 */
export function clearAllRepositories(): void {
  adapterRegistry.forEach((adapter) => {
    if (adapter instanceof MemoryAdapter) {
      adapter.clearCache();
    }
  });
  adapterRegistry.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): Record<string, number> {
  const stats: Record<string, number> = {};

  adapterRegistry.forEach((adapter, key) => {
    if (adapter instanceof MemoryAdapter) {
      stats[key] = adapter.getCacheSize();
    } else {
      stats[key] = -1; // IndexedDB doesn't have cache size concept
    }
  });

  return stats;
}
