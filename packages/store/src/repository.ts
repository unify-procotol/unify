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

/**
 * Repository interface for entity operations
 * 实体操作的统一接口
 */
export interface Repository<T extends Record<string, any>> {
  create(args: CreationArgs<T>): Promise<T>;
  update(args: UpdateArgs<T>): Promise<T>;
  upsert(args: UpsertArgs<T>): Promise<T>;
  findOne(args: FindOneArgs<T>): Promise<T | null>;
  findMany(args?: FindManyArgs<T>): Promise<T[]>;
  delete(args: DeletionArgs<T>): Promise<boolean>;
  count(args?: { where?: WhereCondition<T> }): Promise<number>;
}

/**
 * Global registry for adapters
 * 全局适配器注册表
 */
const adapterRegistry = new Map<
  string,
  MemoryAdapter<any> | IndexedDBAdapter<any>
>();

/**
 * Create or get repository for entity with specified adapter type
 * 为实体创建或获取指定适配器类型的 repository
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
): Repository<T> {
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

  // Return repository interface
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
 * 清除所有缓存的适配器
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
 * 获取缓存统计信息用于调试
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
