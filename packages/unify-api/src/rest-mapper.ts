import {
  SourceConfig,
  RestMethodMapping,
  DEFAULT_METHOD_MAPPING,
  RestMapperOptions,
} from "./types";
import {
  parseRequestArgs,
  buildRestPath,
  normalizeResponse,
  handleError,
} from "./utils";
import { Storage } from "./storage/interface";
import { FileStorage } from "./storage/file";
import { BuiltinMethods } from "./builtin-methods";
import { PGStorage } from "./storage/pg";

interface RouteCache {
  sourceConfig: SourceConfig;
  entityConfig: any;
  handler: Function;
  middleware: Array<(c: any, next: () => Promise<void>) => Promise<void>>;
}

/**
 * REST API 映射器类
 */
export class RestMapper {
  private app: any;
  private sources: Map<string, SourceConfig> = new Map();
  private options: RestMapperOptions;
  private storage: Storage;
  private builtinMethods: BuiltinMethods;
  private setupEntityPaths: Set<string> = new Set();
  private routeCache: Map<string, Map<string, RouteCache>> = new Map();

  constructor(app?: any, options: RestMapperOptions = {}) {
    this.options = {
      enableBuiltinRoutes: true,
      rootMessage: "REST API Server",
      ...options,
    };

    // 初始化存储实例
    switch (options.storageOptions?.type) {
      case "pg":
        this.storage = new PGStorage(options.storageOptions.config);
        break;
      default:
        this.storage = new FileStorage(
          options.storageOptions?.dataDir || "./data"
        );
    }

    this.builtinMethods = new BuiltinMethods(this.storage);

    // 使用动态导入避免编译时的 hono 依赖问题
    if (app) {
      this.app = app;
    } else {
      // 在运行时动态创建 Hono 实例
      try {
        const { Hono } = require("hono");
        this.app = new Hono();
      } catch (error) {
        throw new Error(
          "Hono is required. Please install hono: npm install hono"
        );
      }
    }

    // 根据配置决定是否启用内置路由
    if (this.options.enableBuiltinRoutes) {
      this.setupBuiltinRoutes();
    }
  }

  /**
   * 注册源配置
   */
  register(config: SourceConfig | SourceConfig[]): void {
    // 如果传入的是数组，逐一注册
    if (Array.isArray(config)) {
      config.forEach((cfg) => this.registerSingle(cfg));
      // 批量注册完成后只执行一次路由设置
      this.setupUnifiedRoutes();
      return;
    }

    // 单个配置的注册
    this.registerSingle(config);
    this.setupUnifiedRoutes();
  }

  /**
   * 注册单个源配置
   */
  private registerSingle(config: SourceConfig): void {
    // 如果是重新注册，先清理旧缓存
    if (this.sources.has(config.id)) {
      this.clearRouteCache(config.id);
    }

    this.sources.set(config.id, config);
    this.buildRouteCache(config);
  }

  /**
   * 构建路由缓存
   */
  private buildRouteCache(config: SourceConfig): void {
    const sourceCache = new Map<string, RouteCache>();

    Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
      // 获取所有方法
      const allMethods = this.getAllEntityMethods(
        config.id,
        entityName,
        entityConfig
      );

      Object.entries(allMethods).forEach(([methodName, handler]) => {
        // 跳过table配置
        if (methodName === "table") {
          return;
        }

        if (typeof handler === "function") {
          const methodKey = `${entityName}:${methodName}`;
          sourceCache.set(methodKey, {
            sourceConfig: config,
            entityConfig,
            handler,
            middleware: config.middleware || [],
          });
        }
      });
    });

    this.routeCache.set(config.id, sourceCache);
  }

  /**
   * 清理指定源的缓存
   */
  private clearRouteCache(sourceId: string): void {
    this.routeCache.delete(sourceId);
  }

  /**
   * 清理所有缓存
   */
  public clearAllCache(): void {
    this.routeCache.clear();
  }

  /**
   * 获取 Hono 应用实例
   */
  getApp(): any {
    return this.app;
  }

  /**
   * 获取存储实例
   */
  getStorage(): Storage {
    return this.storage;
  }

  /**
   * 获取方法映射配置
   */
  private getMethodMapping(
    methodName: string
  ): { method: string; pathSuffix?: string } | null {
    return DEFAULT_METHOD_MAPPING[methodName] || null;
  }

  /**
   * 获取实体的所有方法（内置方法 + 用户自定义方法）
   */
  private getAllEntityMethods(
    sourceId: string,
    entityName: string,
    entityConfig: any
  ): Record<string, Function> {
    // 生成内置方法
    const builtinMethods = this.builtinMethods.generateBuiltinMethods(
      sourceId,
      entityName,
      entityConfig
    );

    // 合并用户自定义方法和内置方法
    const allMethods = { ...builtinMethods };

    // 如果entityConfig是实体实例，提取其方法
    if (typeof entityConfig === "object" && entityConfig !== null) {
      Object.getOwnPropertyNames(Object.getPrototypeOf(entityConfig)).forEach(
        (methodName) => {
          if (
            methodName !== "constructor" &&
            typeof (entityConfig as any)[methodName] === "function"
          ) {
            allMethods[methodName] = (entityConfig as any)[methodName].bind(
              entityConfig
            );
          }
        }
      );

      // 也检查实例自身的方法
      Object.getOwnPropertyNames(entityConfig).forEach((methodName) => {
        if (typeof (entityConfig as any)[methodName] === "function") {
          allMethods[methodName] = (entityConfig as any)[methodName].bind(
            entityConfig
          );
        }
      });
    }

    return allMethods;
  }

  /**
   * 获取所有注册的路由信息
   */
  getRoutes(): RestMethodMapping[] {
    const routes: RestMethodMapping[] = [];
    const addedRoutes = new Set<string>();

    this.sources.forEach((config, sourceId) => {
      Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
        // 获取所有方法
        const allMethods = this.getAllEntityMethods(
          sourceId,
          entityName,
          entityConfig
        );

        Object.entries(allMethods).forEach(([methodName, handler]) => {
          // 跳过table配置
          if (methodName === "table") {
            return;
          }

          const mapping = this.getMethodMapping(methodName);
          if (mapping && typeof handler === "function") {
            const path = buildRestPath({
              entityName,
              pathSuffix: mapping.pathSuffix,
            });
            const routeKey = `${mapping.method}:${path}`;

            // 避免重复添加相同的路由
            if (!addedRoutes.has(routeKey)) {
              routes.push({
                method: mapping.method as any,
                path,
                handler: handler as any,
              });
              addedRoutes.add(routeKey);
            }
          }
        });
      });
    });

    return routes;
  }

  /**
   * 获取 API 文档
   */
  getApiDoc(): any {
    const routes = this.getRoutes();
    const apiDoc = {
      openapi: "3.0.0",
      info: {
        title: "REST API",
        version: "1.0.0",
        description: "Auto-generated REST API from entity configurations",
      },
      paths: {} as any,
    };

    routes.forEach((route) => {
      if (!apiDoc.paths[route.path]) {
        apiDoc.paths[route.path] = {};
      }

      apiDoc.paths[route.path][route.method.toLowerCase()] = {
        summary: `${route.method} ${route.path}`,
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
              },
            },
          },
        },
      };
    });

    return apiDoc;
  }

  /**
   * 设置内置路由（根路径和API文档）
   */
  private setupBuiltinRoutes(): void {
    // 根路径 - 返回API服务器信息
    this.app.get("/", (c: any) => {
      return c.json({
        message: this.options.rootMessage,
        routes: this.getRoutes().map((r) => `${r.method} ${r.path}`),
        apiDoc: "/api-doc",
      });
    });

    // API文档端点
    this.app.get("/api-doc", (c: any) => {
      return c.json(this.getApiDoc());
    });
  }

  /**
   * 设置统一路由，支持通过sourceId参数路由到不同的source
   */
  private setupUnifiedRoutes(): void {
    // 收集所有实体和方法的组合
    const entityMethods = new Map<string, Set<string>>();

    this.sources.forEach((config) => {
      Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
        if (!entityMethods.has(entityName)) {
          entityMethods.set(entityName, new Set());
        }

        // 获取所有方法
        const allMethods = this.getAllEntityMethods(
          config.id,
          entityName,
          entityConfig
        );

        Object.keys(allMethods).forEach((methodName) => {
          if (
            methodName !== "table" &&
            typeof allMethods[methodName] === "function"
          ) {
            entityMethods.get(entityName)!.add(methodName);
          }
        });
      });
    });

    // 为每个实体的每个方法设置统一路由
    entityMethods.forEach((methods, entityName) => {
      methods.forEach((methodName) => {
        const mapping = this.getMethodMapping(methodName);
        if (mapping && mapping.method) {
          const path = buildRestPath({
            entityName,
            pathSuffix: mapping.pathSuffix,
          });
          const routeKey = `${mapping.method}:${path}`;

          // 避免重复设置相同的路由
          if (!this.setupEntityPaths.has(routeKey)) {
            this.setupUnifiedRoute({
              method: mapping.method,
              path,
              entityName,
              methodName,
            });
            this.setupEntityPaths.add(routeKey);
          }
        }
      });
    });
  }

  /**
   * 设置统一路由处理器
   */
  private setupUnifiedRoute({
    method,
    path,
    entityName,
    methodName,
  }: {
    method: string;
    path: string;
    entityName: string;
    methodName: string;
  }): void {
    const routeHandler = async (c: any) => {
      try {
        // 解析请求参数
        const args = await parseRequestArgs(c);

        // 添加路径参数
        const pathParams = c.req.param();
        Object.assign(args, pathParams);

        // 检查sourceId参数
        const requestedSourceId = args.sourceId || c.req.query("sourceId");
        if (!requestedSourceId) {
          return c.json({ error: "sourceId parameter is required" }, 400);
        }

        // 从缓存中获取路由信息
        const sourceCache = this.routeCache.get(requestedSourceId);
        if (!sourceCache) {
          return c.json(
            { error: `Source '${requestedSourceId}' not found` },
            404
          );
        }

        const methodKey = `${entityName}:${methodName}`;
        const routeCache = sourceCache.get(methodKey);
        if (!routeCache) {
          return c.json(
            {
              error: `Method '${methodName}' not found for entity '${entityName}' in source '${requestedSourceId}'`,
            },
            404
          );
        }

        // 应用中间件（从缓存中获取）
        for (const mw of routeCache.middleware) {
          let middlewareResult: any = null;
          const next = () => Promise.resolve();
          middlewareResult = await mw(c, next);
          if (middlewareResult) {
            return middlewareResult;
          }
        }

        // 调用实体方法（从缓存中获取的处理器）
        const result = await routeCache.handler(args, c);

        // 标准化响应
        const response = normalizeResponse(result);

        return c.json(response);
      } catch (error) {
        const errorResponse = handleError(error);
        return c.json(errorResponse, errorResponse.status);
      }
    };

    // 根据 HTTP 方法注册路由
    switch (method.toUpperCase()) {
      case "GET":
        this.app.get(path, routeHandler);
        break;
      case "POST":
        this.app.post(path, routeHandler);
        break;
      case "PUT":
        this.app.put(path, routeHandler);
        break;
      case "PATCH":
        this.app.patch(path, routeHandler);
        break;
      case "DELETE":
        this.app.delete(path, routeHandler);
        break;
      default:
        if (typeof process !== "undefined" && process.stdout) {
          process.stdout.write(
            `Warning: Unsupported HTTP method: ${method} for ${path}\n`
          );
        }
    }
  }
}
