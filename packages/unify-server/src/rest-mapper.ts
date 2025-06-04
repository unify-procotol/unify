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
import { FileStorage } from "./file-storage";
import { BuiltinMethods } from "./builtin-methods";

/**
 * REST API 映射器类
 */
export class RestMapper {
  private app: any;
  private sources: Map<string, SourceConfig> = new Map();
  private options: RestMapperOptions;
  private storage: FileStorage;
  private builtinMethods: BuiltinMethods;

  constructor(app?: any, options: RestMapperOptions = {}) {
    this.options = {
      enableBuiltinRoutes: true,
      rootMessage: "REST API Server",
      ...options,
    };

    // 初始化文件存储和内置方法
    this.storage = new FileStorage(options.dataDir || "./data");
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
    this.setupRoutes(config);
  }

  /**
   * 获取 Hono 应用实例
   */
  getApp(): any {
    return this.app;
  }

  /**
   * 为源配置设置路由
   */
  private setupRoutes(config: SourceConfig): void {
    const { id: sourceId, entities, middleware = [] } = config;

    // 应用中间件
    middleware.forEach((mw) => {
      this.app.use(`/${sourceId}/*`, mw);
    });

    // 为每个实体设置路由
    Object.entries(entities).forEach(([entityName, entityConfig]) => {
      this.setupEntityRoutes(sourceId, entityName, entityConfig);
    });
  }

  /**
   * 为实体设置路由
   */
  private setupEntityRoutes(
    sourceId: string,
    entityName: string,
    entityConfig: EntityConfig
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
        this.setupRoute(mapping.method, path, handler as any, methodName);
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
    methodName: string
  ): void {
    const routeHandler = async (c: any) => {
      try {
        // 解析请求参数
        const args = await parseRequestArgs(c);

        // 添加路径参数
        const pathParams = c.req.param();
        Object.assign(args, pathParams);

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

    this.sources.forEach((config, sourceId) => {
      Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
        // 生成内置方法
        const builtinMethods = this.builtinMethods.generateBuiltinMethods(
          sourceId,
          entityName,
          entityConfig
        );

        // 合并用户自定义方法和内置方法
        const allMethods = { ...builtinMethods, ...entityConfig };

        Object.entries(allMethods).forEach(([methodName, handler]) => {
          // 跳过table配置
          if (methodName === "table") {
            return;
          }

          const mapping = this.getMethodMapping(methodName);
          if (mapping && typeof handler === "function") {
            const path = buildRestPath(
              sourceId,
              entityName,
              mapping.pathSuffix
            );
            routes.push({
              method: mapping.method as any,
              path,
              handler: handler as any,
            });
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
}
