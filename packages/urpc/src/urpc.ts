import { BaseURPC } from "@unilab/urpc-core";
import type {
  HttpClientConfig,
  HybridConfig,
  URPCConfig,
  RepoOptions,
  JoinRepoOptions,
  ProxyRepo,
  LocalConfig,
} from "./types";
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

export class URPC extends BaseURPC {
  private static globalInstance: URPC | null = null;
  private static httpConfig: HttpClientConfig | null = null;
  private static mode: Mode = Mode.Local;

  constructor(config: URPCConfig) {
    super();
    if (isHybridConfig(config)) {
      URPC.setupHybridMode(config);
    } else if (isHttpClientConfig(config)) {
      URPC.setupHttpMode(config);
    } else if (isLocalConfig(config)) {
      URPC.setupLocalMode(config);
    }
  }

  static init(config: URPCConfig): void {
    if (!URPC.globalInstance) {
      URPC.globalInstance = new URPC(config);
    }
  }

  static setHeaders(headers: Record<string, string>): void {
    if (!this.httpConfig) {
      throw new Error(
        "URPC not initialized in HTTP mode. Call URPC.init() with HTTP config first."
      );
    }

    this.httpConfig.headers = {
      ...this.httpConfig.headers,
      ...headers,
    };
  }

  private static setupHybridMode(config: HybridConfig): void {
    this.mode = Mode.Hybrid;
    super.init({
      plugins: config.plugins,
      middlewares: config.middlewares,
      entityConfigs: config.entityConfigs,
      globalAdapters: config.globalAdapters,
    });
    this.httpConfig = {
      baseUrl: config.baseUrl,
      timeout: config.timeout || 5000,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    };
  }

  private static setupHttpMode(config: HttpClientConfig): void {
    this.mode = Mode.Http;
    this.httpConfig = {
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
      ...config,
    };
  }

  private static setupLocalMode(config: LocalConfig): void {
    this.mode = Mode.Local;
    super.init({
      plugins: config.plugins,
      middlewares: config.middlewares,
      entityConfigs: config.entityConfigs,
      globalAdapters: config.globalAdapters,
    });
  }

  private static createRepositoryProxy<T extends Record<string, any>>(
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

  static getGlobalInstance(): URPC {
    if (!URPC.globalInstance) {
      throw new Error("URPC not initialized. Call URPC.init() first.");
    }
    return URPC.globalInstance;
  }

  static repo<T extends Record<string, any>>(
    options: RepoOptions<T>
  ): ProxyRepo<T> {
    return this.createRepositoryProxy<T>(options);
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
}

export function repo<T extends Record<string, any>>(
  options: RepoOptions<T>
): ProxyRepo<T> {
  return URPC.repo<T>(options);
}

export function joinRepo<
  F extends Record<string, any> = Record<string, any>,
  L extends Record<string, any> = Record<string, any>
>(options: JoinRepoOptions<F, L>): ProxyRepo<F> {
  return URPC.joinRepo<F, L>(options);
}
