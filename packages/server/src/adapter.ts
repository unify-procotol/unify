import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  AdapterRegistration,
  adapterRegistry,
  getAdapter,
  handleError,
  parseQueryParams,
  registerAdapter,
  validateSource,
} from "./utils";
import {
  DataSourceAdapter,
  generateSchemas,
  Repository,
  SchemaObject,
} from "@unilab/core";

export interface UnifyConfig {
  app?: Hono;
  entities?: Record<string, any>[];
  adapters: AdapterRegistration[];
}

export class Unify {
  private static app: Hono;
  private static entitySchemas: Record<string, SchemaObject> = {};
  private static entitySources: Record<string, string[]> = {};

  // 静态初始化方法
  static init(config: UnifyConfig) {
    // 如果传入了外部 app，使用它；否则创建新的 app
    if (config.app) {
      this.app = config.app;
    } else {
      this.app = new Hono();
      // 只在使用内部 app 时才添加默认中间件
      this.app.use("*", cors());
      this.app.use("*", logger());
      this.app.onError((err, c) => handleError(err, c));
    }

    if (config.entities) {
      this.entitySchemas = generateSchemas(config.entities);
    }

    // Analyze entity-source mapping from adapters configuration
    this.entitySources = this.analyzeEntitySources(config.adapters, config.entities || []);

    config.adapters.forEach(({ source, adapter }) => {
      registerAdapter(source, () => adapter);
    });

    // 创建 Unify 服务器路由
    this.setupRoutes();

    console.log(
      `✅ Registered adapters: ${config.adapters
        .map((a) => a.source)
        .join(", ")}`
    );

    return this.app;
  }

  static repo<T extends Record<string, any>>({
    source,
    adapter,
  }: {
    source: string;
    adapter: DataSourceAdapter<T>;
  }): Repository<T> {
    if (!adapterRegistry.has(source)) {
      registerAdapter(source, () => adapter);
    }
    return new Repository<T>(adapter);
  }

  // 静态设置路由方法
  private static setupRoutes() {
    // GET /{entity}/list - Find multiple records
    this.app.get("/:entity/list", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source = c.req.query("source");

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const adapter = getAdapter(source!);
        const params = parseQueryParams(c);
        const result = await adapter.findMany(params);

        return c.json({ data: result, entity, source });
      } catch (error) {
        return handleError(error, c);
      }
    });

    // GET /{entity}/find_one - Find single record
    this.app.get("/:entity/find_one", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source = c.req.query("source");

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const params = parseQueryParams(c);
        if (!params.where) {
          return c.json({ error: "where parameter is required" }, 400);
        }

        const adapter = getAdapter(source!);
        const result = await adapter.findOne({
          where: params.where,
        });

        return c.json({ data: result, entity, source });
      } catch (error) {
        return handleError(error, c);
      }
    });

    // POST /{entity}/create - Create new record
    this.app.post("/:entity/create", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source = c.req.query("source");

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const body = await c.req.json();
        if (!body.data) {
          return c.json({ error: "data field is required" }, 400);
        }

        const adapter = getAdapter(source!);
        const result = await adapter.create({
          data: body.data,
        });

        return c.json({ data: result, entity, source }, 201);
      } catch (error) {
        return handleError(error, c);
      }
    });

    // PATCH /{entity}/update - Update record
    this.app.patch("/:entity/update", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source = c.req.query("source");

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const body = await c.req.json();
        if (!body.where || !body.data) {
          return c.json({ error: "where and data fields are required" }, 400);
        }

        const adapter = getAdapter(source!);
        const result = await adapter.update({
          where: body.where,
          data: body.data,
        });

        return c.json({ data: result, entity, source });
      } catch (error) {
        return handleError(error, c);
      }
    });

    // DELETE /{entity}/delete - Delete record
    this.app.delete("/:entity/delete", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source = c.req.query("source");

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const params = parseQueryParams(c);
        if (!params.where) {
          return c.json({ error: "where parameter is required" }, 400);
        }

        const adapter = getAdapter(source!);
        const result = await adapter.delete({
          where: params.where,
        });

        return c.json({ data: { success: result }, entity, source });
      } catch (error) {
        return handleError(error, c);
      }
    });

    // 健康检查端点
    this.app.get("/health", (c) => {
      return c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        adapters: Array.from(adapterRegistry.keys()),
      });
    });
  }

  // 静态获取 app 实例方法
  static getApp() {
    return this.app;
  }

  // 静态获取实体模式方法
  static getEntitySchemas(): Record<string, SchemaObject> {
    return this.entitySchemas;
  }

  // 静态获取适配器信息方法
  static getAdapters(): string[] {
    return Array.from(adapterRegistry.keys());
  }

  // 静态获取实体源映射方法
  static getEntitySources(): Record<string, string[]> {
    return this.entitySources;
  }

  // 分析实体和源的映射关系
  private static analyzeEntitySources(
    adapters: AdapterRegistration[],
    entities: Record<string, any>[]
  ): Record<string, string[]> {
    const entitySources: Record<string, string[]> = {};
    
    // 创建adapter类名到entity名的映射
    const adapterToEntity: Record<string, string> = {};
    
    // 分析每个adapter对应的entity
    adapters.forEach(({ source, adapter }) => {
      const adapterClassName = adapter.constructor.name;
      
      // 跳过特殊的adapters (如EntityAdapter for _global)
      if (adapterClassName === 'EntityAdapter' || source === '_global') {
        return;
      }
      
      // 根据adapter类名推断entity名 约定大于配置
      // 例如: UserAdapter -> UserEntity, PostAdapter -> PostEntity
      const entityName = adapterClassName.replace('Adapter', 'Entity');
      
      if (!entitySources[entityName]) {
        entitySources[entityName] = [];
      }
      entitySources[entityName].push(source);
    });
    
    return entitySources;
  }
}
