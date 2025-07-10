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
  EntityConfigs,
  DataSourceAdapter,
} from "@unilab/urpc-core";
import {
  generateSchemas,
  getRepo,
  getRepoRegistry,
  registerAdapter,
  useGlobalMiddleware,
  getGlobalMiddlewareManager,
  simplifyEntityName,
} from "@unilab/urpc-core";
import type {
  LocalConfig,
  HttpClientConfig,
  URPCConfig,
  RepoOptions,
  JoinRepoOptions,
  HttpRequestOptions,
} from "./types";
import { BuiltinPlugin } from "@unilab/builtin-plugin";

export class URPC {
  private entitySchemas: Record<string, SchemaObject> = {};
  private entitySources: Record<string, string[]> = {};
  private entityConfigs: EntityConfigs = {};
  private entityNames: string[] = [];
  private httpConfig: HttpClientConfig | null = null;
  private isHttpMode: boolean = false;

  constructor(config: URPCConfig) {
    if (isHttpClientConfig(config)) {
      this.httpConfig = {
        timeout: 5000,
        headers: {
          "Content-Type": "application/json",
        },
        ...config,
      };
      this.isHttpMode = true;
    } else if (isLocalConfig(config)) {
      this.isHttpMode = false;
      this.initFromPlugins([...config.plugins, BuiltinPlugin(URPC)]);
      this.registerGlobalAdapters(config.globalAdapters);
      this.setEntityConfigs(config.entityConfigs);
      this.applyMiddlewareToRepos(config.middlewares);
    } else {
      throw new Error("Invalid configuration provided");
    }
  }

  private initFromPlugins(plugins: Plugin[]) {
    const entities = plugins.flatMap((p) => p.entities || []);
    const adapters = plugins.flatMap((p) => p.adapters || []);

    if (entities.length > 0) {
      this.entitySchemas = generateSchemas(entities);
      this.entityNames = entities.map((e) => simplifyEntityName(e.name));
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

  private applyMiddlewareToRepos(middlewares: Middleware<any>[] = []) {
    if (middlewares.length > 0) {
      middlewares.forEach((m) => {
        const requiredEntities = m.required?.entities;
        if (requiredEntities) {
          const missingEntities = requiredEntities.filter(
            (entity) => !this.entityNames.includes(simplifyEntityName(entity))
          );
          if (missingEntities.length > 0) {
            throw new Error(
              `Middleware ${m.name} requires entities: ${missingEntities.join(
                ", "
              )}`
            );
          }
        }
        useGlobalMiddleware(m);
      });
      console.log(
        `✅ Registered middlewares: ${middlewares.map((m) => m.name).join(", ")}`
      );
    }
  }

  private setEntityConfigs(entityConfigs: any) {
    if (entityConfigs) {
      this.entityConfigs = entityConfigs;
      getGlobalMiddlewareManager().setEntityConfigs(entityConfigs);
    }
  }

  private registerGlobalAdapters(
    globalAdapters: (new () => DataSourceAdapter<any>)[] = []
  ) {
    if (globalAdapters.length > 0) {
      globalAdapters.forEach((Adapter) => {
        const source = Adapter.name;
        this.entityNames.forEach((entityName) => {
          registerAdapter(entityName, source, new Adapter());
        });
      });
      console.log(
        `✅ Registered global adapters: ${globalAdapters
          .map((a) => {
            return `${a.name}`;
          })
          .join(", ")}`
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

  // HTTP client request methods
  private async request<T>(options: HttpRequestOptions): Promise<T> {
    if (!this.httpConfig) {
      throw new Error("HTTP configuration not available");
    }

    const { method, url, params, data, headers } = options;

    const baseUrl = this.httpConfig.baseUrl.endsWith("/")
      ? this.httpConfig.baseUrl.slice(0, -1)
      : this.httpConfig.baseUrl;
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    const fullUrl = new URL(`${baseUrl}/${cleanUrl}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object") {
            fullUrl.searchParams.set(key, JSON.stringify(value));
          } else {
            fullUrl.searchParams.set(key, String(value));
          }
        }
      });
    }

    const requestInit: RequestInit = {
      method,
      headers: {
        ...this.httpConfig.headers,
        ...headers,
      },
    };

    if (data && (method === "POST" || method === "PATCH")) {
      requestInit.body = JSON.stringify(data);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.httpConfig.timeout
    );

    const response = await fetch(fullUrl.toString(), {
      ...requestInit,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return result.data;
  }

  createRepositoryProxy<T extends Record<string, any>>(
    options: RepoOptions<T>
  ): Repository<T> {
    if (this.isHttpMode) {
      return this.createHttpRepositoryProxy<T>(options);
    } else {
      return this.createLocalRepositoryProxy<T>(options);
    }
  }

  // HTTP mode repository proxy
  private createHttpRepositoryProxy<T extends Record<string, any>>(
    options: RepoOptions<T>
  ): Repository<T> {
    return new Proxy({} as Repository<T>, {
      get: (target, prop: string) => {
        const { entity, context } = options;
        const isEntityClass = typeof entity === "function" && "name" in entity;
        const _entity = simplifyEntityName(
          isEntityClass ? entity.name : entity
        );
        const source =
          options.source || this.entityConfigs[_entity]?.defaultSource;
        switch (prop) {
          case "findMany":
            return async (args: FindManyArgs<T> = {}) => {
              const params: Record<string, any> = { source, context };

              if (args.where) params.where = args.where;
              if (args.order_by) params.order_by = args.order_by;
              if (args.limit) params.limit = args.limit;
              if (args.offset) params.offset = args.offset;

              const result = await this.request<T[]>({
                method: "GET",
                url: `/${_entity}/list`,
                params,
              });

              if (args.include && result && result.length > 0) {
                return await this.loadRelationsForMany(result, args.include);
              }

              if (isEntityClass) {
                return result.map((item) => {
                  const entityInstance = new entity();
                  Object.assign(entityInstance, item);
                  return entityInstance;
                });
              }
              return result;
            };

          case "findOne":
            return async (args: FindOneArgs<T>) => {
              const params: Record<string, any> = {
                source,
                context,
                where: args.where,
              };

              const result = await this.request<T | null>({
                method: "GET",
                url: `/${_entity}/find_one`,
                params,
              });

              if (args.include && result) {
                return await this.loadRelations(result, args.include);
              }

              if (isEntityClass) {
                const entityInstance = new entity();
                Object.assign(entityInstance, result);
                return entityInstance;
              }

              return result;
            };

          case "create":
            return async (args: CreationArgs<T>) => {
              const result = await this.request<T>({
                method: "POST",
                url: `/${_entity}/create`,
                params: { source, context },
                data: { data: args.data },
              });

              if (isEntityClass) {
                const entityInstance = new entity();
                Object.assign(entityInstance, result);
                return entityInstance;
              }
              return result;
            };

          case "update":
            return async (args: UpdateArgs<T>) => {
              const result = await this.request<T>({
                method: "PATCH",
                url: `/${_entity}/update`,
                params: { source, context },
                data: {
                  where: args.where,
                  data: args.data,
                },
              });
              if (isEntityClass) {
                const entityInstance = new entity();
                Object.assign(entityInstance, result);
                return entityInstance;
              }
              return result;
            };

          case "delete":
            return async (args: DeletionArgs<T>) => {
              const result = await this.request<{ success: boolean }>({
                method: "DELETE",
                url: `/${_entity}/delete`,
                params: {
                  source,
                  context,
                  where: args.where,
                },
              });
              return result.success;
            };

          default:
            throw new Error(`Method ${prop} is not supported`);
        }
      },
    });
  }

  // Local mode repository proxy
  private createLocalRepositoryProxy<T extends Record<string, any>>(
    options: RepoOptions<T>
  ): Repository<T> {
    return new Proxy({} as Repository<T>, {
      get: (target, prop: string) => {
        const { entity, context } = options;
        const isEntityClass = typeof entity === "function" && "name" in entity;
        const entityName = simplifyEntityName(
          isEntityClass ? entity.name : entity
        );
        const source =
          options.source || this.entityConfigs[entityName]?.defaultSource;

        if (!source) {
          throw new Error(`Source is required for entity ${entityName}`);
        }

        const repo = getRepo(entityName, source);

        switch (prop) {
          case "findMany":
            return async (args: FindManyArgs<T> = {}) => {
              const result = await repo.findMany(args, {
                entity: entityName,
                source,
                context,
              });

              if (args.include && result && result.length > 0) {
                return await this.loadRelationsForMany(result, args.include);
              }

              if (isEntityClass) {
                return result.map((item) => {
                  const entityInstance = new entity();
                  Object.assign(entityInstance, item);
                  return entityInstance;
                });
              }
              return result;
            };

          case "findOne":
            return async (args: FindOneArgs<T>) => {
              const result = await repo.findOne(args, {
                entity: entityName,
                source,
                context,
              });

              if (args.include && result) {
                return await this.loadRelations(result, args.include);
              }

              if (isEntityClass) {
                const entityInstance = new entity();
                Object.assign(entityInstance, result);
                return entityInstance;
              }
              return result;
            };

          case "create":
            return async (args: CreationArgs<T>) => {
              const result = await repo.create(args, {
                entity: entityName,
                source,
              });

              if (isEntityClass) {
                const entityInstance = new entity();
                Object.assign(entityInstance, result);
                return entityInstance;
              }
              return result;
            };

          case "update":
            return async (args: UpdateArgs<T>) => {
              const result = await repo.update(args, {
                entity: entityName,
                source,
              });

              if (isEntityClass) {
                const entityInstance = new entity();
                Object.assign(entityInstance, result);
                return entityInstance;
              }
              return result;
            };

          case "delete":
            return async (args: DeletionArgs<T>) => {
              return await repo.delete(args, {
                entity: entityName,
                source,
              });
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
      async ([propertyKey, callback]) => {
        try {
          const relatedData = await callback(entity);
          return { propertyKey, relatedData };
        } catch (error) {
          console.warn(`Failed to load relation ${propertyKey}:`, error);
          return { propertyKey, relatedData: null };
        }
      }
    );

    const relationResults = await Promise.all(relationPromises);

    relationResults.forEach(({ propertyKey, relatedData }) => {
      result[propertyKey] = relatedData;
    });

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

  private static globalInstance: URPC | null = null;

  static init(config: URPCConfig): void {
    if (!URPC.globalInstance) {
      URPC.globalInstance = new URPC(config);
    }
  }

  private static getGlobalInstance(): URPC {
    if (!URPC.globalInstance) {
      throw new Error("URPC not initialized. Call URPC.init() first.");
    }
    return URPC.globalInstance;
  }

  static repo<T extends Record<string, any>>(
    options: RepoOptions<T>
  ): Repository<T> {
    return URPC.getGlobalInstance().createRepositoryProxy<T>(options);
  }

  static joinRepo<F extends Record<string, any>, L extends Record<string, any>>(
    options: JoinRepoOptions<F, L>
  ): Repository<F> {
    const baseRepo = URPC.repo<F>(options);
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
    return URPC.getGlobalInstance().entitySchemas;
  }

  static getAdapters(): string[] {
    return Object.keys(getRepoRegistry());
  }

  static getEntitySources(): Record<string, string[]> {
    return URPC.getGlobalInstance().entitySources;
  }
}

export function repo<T extends Record<string, any>>(
  options: RepoOptions<T>
): Repository<T> {
  return URPC.repo<T>(options);
}

export function joinRepo<
  F extends Record<string, any> = Record<string, any>,
  L extends Record<string, any> = Record<string, any>,
>(options: JoinRepoOptions<F, L>): Repository<F> {
  return URPC.joinRepo<F, L>(options);
}

function isHttpClientConfig(config: URPCConfig): config is HttpClientConfig {
  return "baseUrl" in config;
}

function isLocalConfig(config: URPCConfig): config is LocalConfig {
  return "plugins" in config;
}
