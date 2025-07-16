import type {
  Plugin,
  SchemaObject,
  Middleware,
  EntityConfigs,
  DataSourceAdapter,
} from "@unilab/urpc-core";
import {
  generateSchemas,
  registerAdapter,
  useGlobalMiddleware,
  getGlobalMiddlewareManager,
  simplifyEntityName,
  extractAdapterName,
  extractEntityClassName,
} from "@unilab/urpc-core";
import type {
  LocalConfig,
  HttpClientConfig,
  HybridConfig,
  URPCConfig,
  RepoOptions,
  JoinRepoOptions,
  ProxyRepo,
} from "./types";
import { BuiltinPlugin } from "@unilab/builtin-plugin";
import { isHttpClientConfig, isLocalConfig, isHybridConfig } from "./utils";
import {
  createHttpRepositoryProxy,
  createLocalRepositoryProxy,
  createHybridRepositoryProxy,
} from "./proxy";

enum Mode {
  Local = "local",
  Http = "http",
  Hybrid = "hybrid",
}

export class URPC {
  private entitySchemas: Record<string, SchemaObject> = {};
  private entitySources: Record<string, string[]> = {};
  private entityConfigs: EntityConfigs = {};
  private httpConfig: HttpClientConfig | null = null;
  private mode: Mode = Mode.Local;

  constructor(config: URPCConfig) {
    this.initializeConfig(config);
  }

  private initializeConfig(config: URPCConfig): void {
    if (isHybridConfig(config)) {
      this.setupHybridMode(config);
    } else if (isHttpClientConfig(config)) {
      this.setupHttpMode(config);
    } else if (isLocalConfig(config)) {
      this.setupLocalMode(config);
    } else {
      throw new Error("Invalid configuration provided");
    }
  }

  private setupHybridMode(config: HybridConfig): void {
    this.mode = Mode.Hybrid;

    //  Initializing the Local Configuration
    const plugins = [...config.plugins, BuiltinPlugin(URPC)];
    this.registerPluginAdapters(plugins);
    this.registerGlobalAdapters({
      plugins: plugins,
      globalAdapters: config.globalAdapters,
    });
    this.setEntityConfigs(config.entityConfigs);
    this.applyMiddlewareToRepos({
      plugins: plugins,
      middlewares: config.middlewares || [],
    });
    this.analyzeEntities({
      plugins: plugins,
      globalAdapters: config.globalAdapters,
    });

    // Initializing the HTTP Configuration
    this.httpConfig = {
      baseUrl: config.baseUrl,
      timeout: config.timeout || 5000,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    };
  }

  private setupHttpMode(config: HttpClientConfig): void {
    this.httpConfig = {
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
      ...config,
    };
    this.mode = Mode.Http;
  }

  private setupLocalMode(config: LocalConfig): void {
    this.mode = Mode.Local;
    const plugins = [...config.plugins, BuiltinPlugin(URPC)];
    this.registerPluginAdapters(plugins);
    this.registerGlobalAdapters({
      plugins: plugins,
      globalAdapters: config.globalAdapters,
    });
    this.setEntityConfigs(config.entityConfigs);
    this.applyMiddlewareToRepos({
      plugins: plugins,
      middlewares: config.middlewares || [],
    });
    this.analyzeEntities({
      plugins: plugins,
      globalAdapters: config.globalAdapters,
    });
  }

  private registerPluginAdapters(plugins: Plugin[]) {
    const adapters = plugins.flatMap((p) => p.adapters || []);
    if (adapters.length) {
      adapters.forEach(({ entity, source, adapter }) =>
        registerAdapter(entity, source, adapter)
      );
    }
  }

  private registerGlobalAdapters({
    plugins,
    globalAdapters = [],
  }: {
    plugins: Plugin[];
    globalAdapters?: (new () => DataSourceAdapter<any>)[];
  }): void {
    if (globalAdapters.length > 0) {
      const entities = plugins.flatMap((p) => p.entities || []);
      globalAdapters.forEach((Adapter) => {
        const source = Adapter.name;
        entities.forEach((entity) => {
          const entityName = extractEntityClassName(entity);
          registerAdapter(entityName, source, new Adapter());
        });
      });
    }
  }

  private setEntityConfigs(entityConfigs: any): void {
    if (entityConfigs) {
      this.entityConfigs = entityConfigs;
      getGlobalMiddlewareManager().setEntityConfigs(entityConfigs);
    }
  }

  private analyzeEntities({
    plugins,
    globalAdapters,
  }: {
    plugins: Plugin[];
    globalAdapters?: (new () => DataSourceAdapter<any>)[];
  }) {
    const entities = plugins.flatMap((p) => p.entities || []);
    const adapters = plugins.flatMap((p) => p.adapters || []);

    if (entities.length > 0) {
      this.entitySchemas = generateSchemas(entities);
    }

    const entitySources: Record<string, string[]> = {};

    adapters.forEach(({ source, entity }) => {
      if (!entitySources[entity]) {
        entitySources[entity] = [];
      }
      entitySources[entity].push(source);
    });

    if (globalAdapters && entities) {
      globalAdapters.forEach((adapter) => {
        entities.forEach((entity) => {
          const entityName = extractEntityClassName(entity);
          const source = extractAdapterName(adapter)
            .toLowerCase()
            .replace("adapter", "");
          if (!entitySources[entityName]) {
            entitySources[entityName] = [];
          }
          entitySources[entityName].push(source);
        });
      });
    }

    this.entitySources = entitySources;
  }

  private applyMiddlewareToRepos({
    plugins,
    middlewares,
  }: {
    plugins: Plugin[];
    middlewares: Middleware<any>[];
  }): void {
    if (middlewares.length > 0) {
      middlewares.forEach((m) => {
        const requiredEntities = m.required?.entities;
        if (requiredEntities) {
          const entities = plugins.flatMap((p) => p.entities || []);
          const entityNames = entities.map((e) => simplifyEntityName(e.name));
          const missingEntities = requiredEntities.filter(
            (entity) => !entityNames.includes(simplifyEntityName(entity))
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

  createRepositoryProxy<T extends Record<string, any>>(
    options: RepoOptions<T>
  ): ProxyRepo<T> {
    if (this.mode === Mode.Hybrid) {
      return createHybridRepositoryProxy<T>(
        options,
        this.entityConfigs,
        this.httpConfig!
      );
    } else if (this.mode === Mode.Http) {
      return createHttpRepositoryProxy<T>(
        options,
        this.entityConfigs,
        this.httpConfig!
      );
    } else {
      return createLocalRepositoryProxy<T>(options, this.entityConfigs);
    }
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
  ): ProxyRepo<T> {
    return URPC.getGlobalInstance().createRepositoryProxy<T>(options);
  }

  static joinRepo<F extends Record<string, any>, L extends Record<string, any>>(
    options: JoinRepoOptions<F, L>
  ): ProxyRepo<F> {
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

  static getEntitySources(): Record<string, string[]> {
    return URPC.getGlobalInstance().entitySources;
  }
}

export function repo<T extends Record<string, any>>(
  options: RepoOptions<T>
): ProxyRepo<T> {
  return URPC.repo<T>(options);
}

export function joinRepo<
  F extends Record<string, any> = Record<string, any>,
  L extends Record<string, any> = Record<string, any>,
>(options: JoinRepoOptions<F, L>): ProxyRepo<F> {
  return URPC.joinRepo<F, L>(options);
}
