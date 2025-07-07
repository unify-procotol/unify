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

    if (entities.length > 0) {
      this.entitySchemas = generateSchemas(entities);
    }
    this.entitySources = this.analyzeEntitySources(adapters);

    adapters.forEach(({ entity, source, adapter }) =>
      registerAdapter(entity, source, adapter)
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
    adapters.forEach(({ source, entity }) => {
      if (!entitySources[entity]) {
        entitySources[entity] = [];
      }
      entitySources[entity].push(source);
    });
    return entitySources;
  }

  createRepositoryProxy<T extends Record<string, any>>(
    options: RepoOptions
  ): Repository<T> {
    return new Proxy({} as Repository<T>, {
      get: (target, prop: string) => {
        const { entity, source } = options;
        const repo = getRepo(entity, source!);

        switch (prop) {
          case "findMany":
            return async (args: FindManyArgs<T> = {}) => {
              this.log(`findMany called for ${entity}:${source}`, args);

              const result = await repo.findMany(args);

              if (args.include && result && result.length > 0) {
                return await this.loadRelationsForMany(result, args.include);
              }

              return result;
            };

          case "findOne":
            return async (args: FindOneArgs<T>) => {
              this.log(`findOne called for ${entity}:${source}`, args);

              const result = await repo.findOne(args);

              if (args.include && result) {
                return await this.loadRelations(result, args.include);
              }

              return result;
            };

          case "create":
            return async (args: CreationArgs<T>) => {
              this.log(`create called for ${entity}:${source}`, args);
              return repo.create(args);
            };

          case "update":
            return async (args: UpdateArgs<T>) => {
              this.log(`update called for ${entity}:${source}`, args);
              return repo.update(args);
            };

          case "delete":
            return async (args: DeletionArgs<T>) => {
              this.log(`delete called for ${entity}:${source}`, args);
              return repo.delete(args);
            };

          default:
            throw new Error(`Method ${prop} is not supported`);
        }
      },
    });
  }

  private async loadRelations<T extends Record<string, any>>(
    entity: T,
    include: { [key: string]: (entity: T) => Promise<any> }
  ): Promise<T> {
    const result = { ...entity } as any;
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

  private async loadRelationsForMany<T extends Record<string, any>>(
    entities: T[],
    include: { [key: string]: (entities: T[]) => Promise<any> }
  ): Promise<T[]> {
    const results = [...entities] as any[];
    const relationPromises = Object.entries(include).map(
      async ([propertyKey, callback]) => {
        try {
          const relationPromise = callback(entities);
          const relationMapping = (relationPromise as any).__relationMapping;
          const relatedData = await relationPromise;
          return { propertyKey, relatedData, relationMapping };
        } catch (error) {
          console.warn(`Failed to load relation ${propertyKey}:`, error);
          return { propertyKey, relatedData: null, relationMapping: null };
        }
      }
    );
    const relationResults = await Promise.all(relationPromises);
    relationResults.forEach(({ propertyKey, relatedData, relationMapping }) => {
      if (Array.isArray(relatedData)) {
        results.forEach((entity) => {
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
        results.forEach((entity) => {
          entity[propertyKey] = relatedData;
        });
      }
    });

    return results;
  }

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

  static joinRepo<F extends Record<string, any>, L extends Record<string, any>>(
    options: JoinRepoOptions<F, L>
  ): Repository<F> {
    const baseRepo = Unify.repo<F>(options);
    return new Proxy(baseRepo, {
      get: (target, prop: string) => {
        const originalMethod = (target as any)[prop];
        if (prop === "findMany" || prop === "findOne") {
          return (...args: any[]) => {
            const resultPromise = originalMethod.apply(target, args);
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

export function repo<T extends Record<string, any>>(
  options: RepoOptions
): Repository<T> {
  return Unify.repo<T>(options);
}

export function joinRepo<
  F extends Record<string, any> = Record<string, any>,
  L extends Record<string, any> = Record<string, any>,
>(options: JoinRepoOptions<F, L>): Repository<F> {
  return Unify.joinRepo<F, L>(options);
}
