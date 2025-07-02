import type {
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  Repository,
  Plugin,
  SchemaObject,
  AdapterRegistration,
  Middleware,
  RepoOptions,
  JoinRepoOptions,
} from "@unilab/core";
import {
  generateSchemas,
  getRepo,
  getRepoRegistry,
  registerAdapter,
  useGlobalMiddleware,
} from "@unilab/core";
import type { ClientConfig } from "./types";

export class Unify {
  private enableDebug: boolean = false;
  private entitySchemas: Record<string, SchemaObject> = {};
  private entitySources: Record<string, string[]> = {};

  constructor(config: ClientConfig) {
    this.enableDebug = config.enableDebug || false;
    this.initFromPlugins(config.plugins);
    this.applyMiddlewareToRepos(config.middleware);
  }

  private log(...args: any[]): void {
    if (this.enableDebug) {
      console.log("[Unify]", ...args);
    }
  }

  private initFromPlugins(plugins: Plugin[]) {
    const entities = plugins.flatMap((p) => p.entities || []);
    const adapters = plugins.flatMap((p) => p.adapters || []);

    // Generate schemas and analyze entity-source mapping
    if (entities.length > 0) {
      this.entitySchemas = generateSchemas(entities);
    }
    this.entitySources = this.analyzeEntitySources(adapters);

    // Register adapters and apply middleware
    adapters.forEach(({ entityName, source, adapter }) =>
      registerAdapter(entityName, source, adapter)
    );

    console.log(
      `✅ Registered adapters: ${adapters
        .map((a) => {
          const adapterName =
            (a.adapter.constructor as any).adapterName ||
            a.adapter.constructor.name;
          return `${adapterName}`;
        })
        .join(", ")}`
    );
  }

  // Apply middleware to all registered repositories
  private applyMiddlewareToRepos(middleware: Middleware<any>[] = []) {
    if (middleware.length > 0) {
      middleware.forEach((m) => useGlobalMiddleware(m));
      console.log(
        `✅ Registered middleware: ${middleware.map((m) => m.name).join(", ")}`
      );
    }
  }

  private analyzeEntitySources(
    adapters: AdapterRegistration[]
  ): Record<string, string[]> {
    const entitySources: Record<string, string[]> = {};
    adapters.forEach(({ source, entityName }) => {
      if (!entitySources[entityName]) {
        entitySources[entityName] = [];
      }
      entitySources[entityName].push(source);
    });
    return entitySources;
  }

  createRepositoryProxy<T extends Record<string, any>>(
    options: RepoOptions
  ): Repository<T> {
    return new Proxy({} as Repository<T>, {
      get: (target, prop: string) => {
        const { entityName, source } = options;
        const repo = getRepo(entityName, source!);

        switch (prop) {
          case "findMany":
            return async (args: FindManyArgs<T> = {}) => {
              this.log(`findMany called for ${entityName}:${source}`, args);

              const result = await repo.findMany(args);

              // Handle relations
              if (args.include && result && result.length > 0) {
                return await this.loadRelationsForMany(result, args.include);
              }

              return result;
            };

          case "findOne":
            return async (args: FindOneArgs<T>) => {
              this.log(`findOne called for ${entityName}:${source}`, args);

              const result = await repo.findOne(args);

              // Handle relations
              if (args.include && result) {
                return await this.loadRelations(result, args.include);
              }

              return result;
            };

          case "create":
            return async (args: CreationArgs<T>) => {
              this.log(`create called for ${entityName}:${source}`, args);
              return repo.create(args);
            };

          case "update":
            return async (args: UpdateArgs<T>) => {
              this.log(`update called for ${entityName}:${source}`, args);
              return repo.update(args);
            };

          case "delete":
            return async (args: DeletionArgs<T>) => {
              this.log(`delete called for ${entityName}:${source}`, args);
              return repo.delete(args);
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
  private static globalClient: Unify | null = null;

  static init(config: ClientConfig): void {
    Unify.globalClient = new Unify(config);
  }

  private static getGlobalClient(): Unify {
    if (!Unify.globalClient) {
      throw new Error("Unify not initialized. Call Unify.init() first.");
    }
    return Unify.globalClient;
  }

  static repo<T extends Record<string, any>>(
    options: RepoOptions
  ): Repository<T> {
    return Unify.getGlobalClient().createRepositoryProxy<T>(options);
  }

  // 静态 JoinRepo 方法
  static joinRepo<F extends Record<string, any>, L extends Record<string, any>>(
    options: JoinRepoOptions<F, L>
  ): Repository<F> {
    const baseRepo = Unify.repo<F>(options);

    // 包装 repository，为返回的 Promise 添加关联映射信息
    return new Proxy(baseRepo, {
      get: (target, prop: string) => {
        const originalMethod = (target as any)[prop];

        if (prop === "findMany" || prop === "findOne") {
          return (...args: any[]) => {
            const resultPromise = originalMethod.apply(target, args);
            // 为 Promise 添加关联映射信息
            (resultPromise as any).__relationMapping = {
              localField: options.localField,
              foreignField: options.foreignField,
            };
            return resultPromise;
          };
        }

        return originalMethod;
      },
    });
  }

  static getEntitySchemas(): Record<string, SchemaObject> {
    return Unify.getGlobalClient().entitySchemas;
  }

  static getAdapters(): string[] {
    return Array.from(getRepoRegistry().keys());
  }

  static getEntitySources(): Record<string, string[]> {
    return Unify.getGlobalClient().entitySources;
  }
}

// Export convenience function
export function repo<T extends Record<string, any>>(
  options: RepoOptions
): Repository<T> {
  return Unify.repo<T>(options);
}

export function joinRepo<
  F extends Record<string, any> = Record<string, any>,
  L extends Record<string, any> = Record<string, any>
>(options: JoinRepoOptions<F, L>): Repository<F> {
  return Unify.joinRepo<F, L>(options);
}
