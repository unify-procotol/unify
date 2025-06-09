import {
  SourceConfig,
  RestMethodMapping,
  DEFAULT_METHOD_MAPPING,
  RestMapperOptions,
  EntityConfig,
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
  register(config: SourceConfig): void {
    this.sources.set(config.id, config);
    // this.setupRoutes(config);
    this.setupUnifiedRoutes();
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
   * 为源配置设置路由
   */
  private setupRoutes(config: SourceConfig): void {
    // 现在路由设置被延迟到 setupUnifiedRoutes 中
    // 这里只是存储配置，不直接设置路由
  }

  /**
   * 为实体设置路由
   */
  private setupEntityRoutes(
    sourceId: string,
    entityName: string,
    entityConfig: EntityConfig,
    middleware: any[] = []
  ): void {
    // 生成内置方法
    const builtinMethods = this.builtinMethods.generateBuiltinMethods(
      sourceId,
      entityName,
      entityConfig
    );

    // 合并用户自定义方法和内置方法，用户方法优先
    const allMethods = { ...builtinMethods, ...entityConfig };

    // 为所有方法设置路由
    Object.entries(allMethods).forEach(([methodName, handler]) => {
      // 跳过table配置
      if (methodName === "table") {
        return;
      }

      const mapping = this.getMethodMapping(methodName);
      if (mapping && typeof handler === "function") {
        const path = buildRestPath(sourceId, entityName, mapping.pathSuffix);
        this.setupRoute(
          mapping.method,
          path,
          handler as any,
          methodName,
          sourceId,
          entityName,
          middleware
        );
      }
    });
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
   * 设置单个路由
   */
  private setupRoute(
    method: string,
    path: string,
    handler: any,
    methodName: string,
    sourceId: string,
    entityName: string,
    middleware: any[] = []
  ): void {
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

        // 验证sourceId是否匹配
        if (requestedSourceId !== sourceId) {
          // 不处理，让其他路由处理器处理
          return null;
        }

        // 应用中间件
        for (const mw of middleware) {
          const next = () => Promise.resolve();
          const result = await mw(c, next);
          if (result) {
            return result;
          }
        }

        // 调用实体方法
        const result = await handler(args, c);

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
        // 使用 process.stdout 替代 console 以避免类型错误
        if (typeof process !== "undefined" && process.stdout) {
          process.stdout.write(
            `Warning: Unsupported HTTP method: ${method} for ${path}\n`
          );
        }
    }
  }

  /**
   * 获取所有注册的路由信息
   */
  getRoutes(): RestMethodMapping[] {
    const routes: RestMethodMapping[] = [];
    const addedRoutes = new Set<string>();

    this.sources.forEach((config, sourceId) => {
      Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
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
          Object.getOwnPropertyNames(
            Object.getPrototypeOf(entityConfig)
          ).forEach((methodName) => {
            if (
              methodName !== "constructor" &&
              typeof (entityConfig as any)[methodName] === "function"
            ) {
              allMethods[methodName] = (entityConfig as any)[methodName].bind(
                entityConfig
              );
            }
          });

          // 也检查实例自身的方法
          Object.getOwnPropertyNames(entityConfig).forEach((methodName) => {
            if (typeof (entityConfig as any)[methodName] === "function") {
              allMethods[methodName] = (entityConfig as any)[methodName].bind(
                entityConfig
              );
            }
          });
        } else {
          // 如果是普通对象，直接合并
          Object.assign(allMethods, entityConfig);
        }

        Object.entries(allMethods).forEach(([methodName, handler]) => {
          // 跳过table配置
          if (methodName === "table") {
            return;
          }

          const mapping = this.getMethodMapping(methodName);
          if (mapping && typeof handler === "function") {
            const path = buildRestPath(
              "", // 不再使用sourceId作为路径前缀
              entityName,
              mapping.pathSuffix
            );
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
   * 禁用内置路由
   */
  disableBuiltinRoutes(): void {
    // 注意：Hono 没有直接的路由删除方法，这里我们可以覆盖路由
    this.app.get("/", (c: any) => {
      return c.json({ message: "Root endpoint disabled" }, 404);
    });

    this.app.get("/api-doc", (c: any) => {
      return c.json({ message: "API documentation disabled" }, 404);
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

        // 生成内置方法
        const builtinMethods = this.builtinMethods.generateBuiltinMethods(
          config.id,
          entityName,
          entityConfig
        );

        // 合并用户自定义方法和内置方法
        const allMethods = { ...builtinMethods };

        // 如果entityConfig是实体实例，提取其方法
        if (typeof entityConfig === "object" && entityConfig !== null) {
          Object.getOwnPropertyNames(
            Object.getPrototypeOf(entityConfig)
          ).forEach((methodName) => {
            if (
              methodName !== "constructor" &&
              typeof (entityConfig as any)[methodName] === "function"
            ) {
              allMethods[methodName] = (entityConfig as any)[methodName].bind(
                entityConfig
              );
            }
          });

          // 也检查实例自身的方法
          Object.getOwnPropertyNames(entityConfig).forEach((methodName) => {
            if (typeof (entityConfig as any)[methodName] === "function") {
              allMethods[methodName] = (entityConfig as any)[methodName].bind(
                entityConfig
              );
            }
          });
        } else {
          // 如果是普通对象，直接合并
          Object.assign(allMethods, entityConfig);
        }

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
        if (mapping) {
          const path = buildRestPath("", entityName, mapping.pathSuffix);
          const routeKey = `${mapping.method}:${path}`;

          // 避免重复设置相同的路由
          if (!this.setupEntityPaths.has(routeKey)) {
            this.setupUnifiedRoute(
              mapping.method,
              path,
              entityName,
              methodName
            );
            this.setupEntityPaths.add(routeKey);
          }
        }
      });
    });
  }

  /**
   * 设置统一路由处理器
   */
  private setupUnifiedRoute(
    method: string,
    path: string,
    entityName: string,
    methodName: string
  ): void {
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

        // 找到对应的source配置
        const sourceConfig = this.sources.get(requestedSourceId);
        if (!sourceConfig) {
          return c.json(
            { error: `Source '${requestedSourceId}' not found` },
            404
          );
        }

        // 找到对应的实体配置
        const entityConfig = sourceConfig.entities[entityName];
        if (!entityConfig) {
          return c.json(
            {
              error: `Entity '${entityName}' not found in source '${requestedSourceId}'`,
            },
            404
          );
        }

        // 应用中间件
        const middleware = sourceConfig.middleware || [];
        for (const mw of middleware) {
          let middlewareResult: any = null;
          const next = () => Promise.resolve();
          middlewareResult = await mw(c, next);
          if (middlewareResult) {
            return middlewareResult;
          }
        }

        // 生成内置方法
        const builtinMethods = this.builtinMethods.generateBuiltinMethods(
          requestedSourceId,
          entityName,
          entityConfig
        );

        // 合并用户自定义方法和内置方法
        const allMethods = { ...builtinMethods };

        // 如果entityConfig是实体实例，提取其方法
        if (typeof entityConfig === "object" && entityConfig !== null) {
          Object.getOwnPropertyNames(
            Object.getPrototypeOf(entityConfig)
          ).forEach((methodName) => {
            if (
              methodName !== "constructor" &&
              typeof (entityConfig as any)[methodName] === "function"
            ) {
              allMethods[methodName] = (entityConfig as any)[methodName].bind(
                entityConfig
              );
            }
          });

          // 也检查实例自身的方法
          Object.getOwnPropertyNames(entityConfig).forEach((methodName) => {
            if (typeof (entityConfig as any)[methodName] === "function") {
              allMethods[methodName] = (entityConfig as any)[methodName].bind(
                entityConfig
              );
            }
          });
        } else {
          // 如果是普通对象，直接合并
          Object.assign(allMethods, entityConfig);
        }

        // 找到对应的方法处理器
        const handler = allMethods[methodName];
        if (!handler || typeof handler !== "function") {
          return c.json(
            {
              error: `Method '${methodName}' not found for entity '${entityName}' in source '${requestedSourceId}'`,
            },
            404
          );
        }

        // 调用实体方法
        const result = await handler(args, c);

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
