import type {
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  Repository,
  DataSourceAdapter,
} from "@unilab/core";
import type {
  AdapterRegistration,
  AdapterRegistry,
  ClientConfig,
  RelationMapping,
} from "./types";

export class UnifyClient {
  private enableDebug: boolean = false;
  private adapters: AdapterRegistry = new Map();

  constructor(config: ClientConfig) {
    this.enableDebug = config.enableDebug || false;
    this.registerAdapters(config.adapters);
  }

  private log(...args: any[]): void {
    if (this.enableDebug) {
      console.log("[UnifyClientLite]", ...args);
    }
  }

  private registerAdapters<T extends Record<string, any>>(
    registrations: AdapterRegistration<T>[]
  ): void {
    for (const { source, adapter } of registrations) {
      this.adapters.set(
        source,
        adapter as DataSourceAdapter<Record<string, any>>
      );
      this.log(`Registered adapter for source: ${source}`);
    }
  }

  private getAdapter<T extends Record<string, any>>(
    source: string
  ): DataSourceAdapter<T> {
    const adapter = this.adapters.get(source);
    if (!adapter) {
      throw new Error(`No adapter registered for source: ${source}`);
    }
    return adapter as DataSourceAdapter<T>;
  }

  createRepositoryProxy<T extends Record<string, any>>(
    entityName: string,
    source: string
  ): Repository<T> {
    return new Proxy({} as Repository<T>, {
      get: (target, prop: string) => {
        const adapter = this.getAdapter<T>(source);

        switch (prop) {
          case "findMany":
            return async (args: FindManyArgs<T> = {}) => {
              this.log(`findMany called for ${entityName}:${source}`, args);

              const result = await adapter.findMany(args);

              // Handle relations
              if (args.include && result && result.length > 0) {
                return await this.loadRelationsForMany(result, args.include);
              }

              return result;
            };

          case "findOne":
            return async (args: FindOneArgs<T>) => {
              this.log(`findOne called for ${entityName}:${source}`, args);

              const result = await adapter.findOne(args);

              // Handle relations
              if (args.include && result) {
                return await this.loadRelations(result, args.include);
              }

              return result;
            };

          case "create":
            return async (args: CreationArgs<T>) => {
              this.log(`create called for ${entityName}:${source}`, args);
              return adapter.create(args);
            };

          case "update":
            return async (args: UpdateArgs<T>) => {
              this.log(`update called for ${entityName}:${source}`, args);
              return adapter.update(args);
            };

          case "delete":
            return async (args: DeletionArgs<T>) => {
              this.log(`delete called for ${entityName}:${source}`, args);
              return adapter.delete(args);
            };

          default:
            throw new Error(`Method ${prop} is not supported`);
        }
      },
    });
  }

  // Load relations for a single entity
  private async loadRelations<T extends Record<string, any>>(
    entity: T,
    include: { [key: string]: (entity: T) => Promise<any> }
  ): Promise<T> {
    const result = { ...entity } as any;

    // Process all relations in parallel
    const relationPromises = Object.entries(include).map(
      async ([key, callback]) => {
        try {
          const relationData = await callback(entity);
          result[key] = relationData;
        } catch (error) {
          this.log(`Error loading relation ${key}:`, error);
          result[key] = null;
        }
      }
    );

    await Promise.all(relationPromises);
    return result;
  }

  // Load relations for multiple entities
  private async loadRelationsForMany<T extends Record<string, any>>(
    entities: T[],
    include: { [key: string]: (entities: T[]) => Promise<any> }
  ): Promise<T[]> {
    const results = [...entities] as any[];

    // 并行处理所有关联查询
    const relationPromises = Object.entries(include).map(
      async ([propertyKey, callback]) => {
        try {
          const relationPromise = callback(entities);
          // 检查是否有关联映射信息附加到 Promise 上
          const relationMapping = (relationPromise as any).__relationMapping;
          const relatedData = await relationPromise;
          return { propertyKey, relatedData, relationMapping };
        } catch (error) {
          console.warn(`Failed to load relation ${propertyKey}:`, error);
          return { propertyKey, relatedData: null, relationMapping: null };
        }
      }
    );

    // 等待所有关联查询完成
    const relationResults = await Promise.all(relationPromises);

    // 将结果分配到对应的实体中
    relationResults.forEach(({ propertyKey, relatedData, relationMapping }) => {
      if (Array.isArray(relatedData)) {
        // 如果返回的是数组，需要根据外键分组
        results.forEach((entity) => {
          // 优先使用 Promise 上的关联映射信息，然后是传入的映射信息，最后是默认逻辑
          const mapping = relationMapping;
          if (mapping) {
            const localValue = entity[mapping.localField];
            entity[propertyKey] = relatedData.filter((item: any) => {
              return item[mapping.foreignField] === localValue;
            });
          } else {
            entity[propertyKey] = relatedData;
          }
        });
      } else {
        // 如果返回的不是数组，直接分配
        results.forEach((entity) => {
          entity[propertyKey] = relatedData;
        });
      }
    });

    return results;
  }

  // Static methods for global instance management
  private static globalClient: UnifyClient | null = null;

  static init(config: ClientConfig): void {
    UnifyClient.globalClient = new UnifyClient(config);
  }

  private static getGlobalClient(): UnifyClient {
    if (!UnifyClient.globalClient) {
      throw new Error(
        "UnifyClient not initialized. Call UnifyClient.init() first."
      );
    }
    return UnifyClient.globalClient;
  }

  static repo<T extends Record<string, any>>(
    entityName: string,
    source: string
  ): Repository<T> {
    return UnifyClient.getGlobalClient().createRepositoryProxy<T>(
      entityName,
      source
    );
  }

  // 静态 JoinRepo 方法
  static joinRepo<T extends Record<string, any>>(
    entityName: string,
    source: string,
    relationMapping: RelationMapping
  ): Repository<T> {
    const baseRepo = UnifyClient.repo<T>(entityName, source);

    // 包装 repository，为返回的 Promise 添加关联映射信息
    return new Proxy(baseRepo, {
      get: (target, prop: string) => {
        const originalMethod = (target as any)[prop];

        if (prop === "findMany" || prop === "findOne") {
          return (...args: any[]) => {
            const resultPromise = originalMethod.apply(target, args);
            // 为 Promise 添加关联映射信息
            (resultPromise as any).__relationMapping = relationMapping;
            return resultPromise;
          };
        }

        return originalMethod;
      },
    });
  }
}

// Export convenience function
export function repo<T extends Record<string, any>>(
  entityName: string,
  source: string
): Repository<T> {
  return UnifyClient.repo<T>(entityName, source);
}

export function joinRepo<T extends Record<string, any>>(
  entityName: string,
  source: string,
  relationMapping: RelationMapping
): Repository<T> {
  return UnifyClient.joinRepo<T>(entityName, source, relationMapping);
}
