import type {
  Repository,
  Plugin,
  SchemaObject,
  Middleware,
  EntityConfigs,
  DataSourceAdapter,
} from "@unilab/urpc-core";
import {
  generateSchemas,
  getRepoRegistry,
  registerAdapter,
  useGlobalMiddleware,
  getGlobalMiddlewareManager,
  simplifyEntityName,
} from "@unilab/urpc-core";
import type {
  LocalConfig,
  HttpClientConfig,
  HybridConfig,
  URPCConfig,
  RepoOptions,
  JoinRepoOptions,
} from "./types";
import { BuiltinPlugin } from "@unilab/builtin-plugin";
import {
  isHttpClientConfig,
  isLocalConfig,
  isHybridConfig,
  analyzeEntitySources,
} from "./utils";
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
  private entityNames: string[] = [];
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
    this.initFromPlugins([...config.plugins, BuiltinPlugin(URPC)]);
    this.registerGlobalAdapters(config.globalAdapters);
    this.setEntityConfigs(config.entityConfigs);
    this.applyMiddlewareToRepos(config.middlewares);

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
    this.initFromPlugins([...config.plugins, BuiltinPlugin(URPC)]);
    this.registerGlobalAdapters(config.globalAdapters);
    this.setEntityConfigs(config.entityConfigs);
    this.applyMiddlewareToRepos(config.middlewares);
  }

  private initFromPlugins(plugins: Plugin[]): void {
    const entities = plugins.flatMap((p) => p.entities || []);
    const adapters = plugins.flatMap((p) => p.adapters || []);

    if (entities.length > 0) {
      this.entitySchemas = generateSchemas(entities);
      this.entityNames = entities.map((e) => simplifyEntityName(e.name));
    }
    this.entitySources = analyzeEntitySources(adapters);

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

  private applyMiddlewareToRepos(middlewares: Middleware<any>[] = []): void {
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

  private setEntityConfigs(entityConfigs: any): void {
    if (entityConfigs) {
      this.entityConfigs = entityConfigs;
      getGlobalMiddlewareManager().setEntityConfigs(entityConfigs);
    }
  }

  private registerGlobalAdapters(
    globalAdapters: (new () => DataSourceAdapter<any>)[] = []
  ): void {
    if (globalAdapters.length > 0) {
      globalAdapters.forEach((Adapter) => {
        const source = Adapter.name;
        this.entityNames.forEach((entityName) => {
          registerAdapter(entityName, source, new Adapter());
        });
      });
      console.log(
        `✅ Registered global adapters: ${globalAdapters
          .map((a) => `${a.name}`)
          .join(", ")}`
      );
    }
  }

  createRepositoryProxy<T extends Record<string, any>>(
    options: RepoOptions<T>
  ): Repository<T> {
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
