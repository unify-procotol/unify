import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { handleError, parseQueryParams, validateSource } from "./utils";
import { registerAdapter, getRepo, getRepoRegistry } from "@unilab/core";
import {
  DataSourceAdapter,
  generateSchemas,
  Repository,
  SchemaObject,
  Middleware,
  Plugin,
  AdapterRegistration,
  useGlobalMiddleware,
} from "@unilab/core";

export interface UnifyConfig {
  app?: Hono;
  plugins?: Plugin[];
  middleware?: Middleware<any>[];
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

    if (config.plugins) {
      this.initFromPlugins(config.plugins);
    }

    if (config.middleware) {
      this.applyMiddlewareToRepos(config.middleware);
    }

    this.setupRoutes();

    return this.app;
  }

  // Initialize from plugins configuration
  private static initFromPlugins(plugins: Plugin[]) {
    // Collect all configuration from plugins using flatMap
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
  private static applyMiddlewareToRepos(middleware: Middleware<any>[]) {
    middleware.forEach((m) => useGlobalMiddleware(m));
    console.log(
      `✅ Registered middleware: ${middleware.map((m) => m.name).join(", ")}`
    );
  }

  static repo<T extends Record<string, any>>({
    entityName,
    source,
    adapter,
  }: {
    entityName: string;
    source: string;
    adapter: DataSourceAdapter<T>;
  }) {
    try {
      const repo = getRepo(entityName, source) as Repository<T>;
      return repo;
    } catch (error) {
      return registerAdapter(entityName, source, adapter);
    }
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

        const repo = getRepo(entity, source!);
        const params = parseQueryParams(c);
        const result = await repo.findMany(params);

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

        const repo = getRepo(entity, source!);
        const result = await repo.findOne({
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

        const repo = getRepo(entity, source!);
        const result = await repo.create({
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

        const repo = getRepo(entity, source!);
        const result = await repo.update({
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

        const repo = getRepo(entity, source!);
        const result = await repo.delete({
          where: params.where,
        });

        return c.json({ data: { success: result }, entity, source });
      } catch (error) {
        return handleError(error, c);
      }
    });
  }

  static getApp() {
    return this.app;
  }

  static getEntitySchemas(): Record<string, SchemaObject> {
    return this.entitySchemas;
  }

  static getAdapters(): string[] {
    return Array.from(getRepoRegistry().keys());
  }

  // 静态获取实体源映射方法
  static getEntitySources(): Record<string, string[]> {
    return this.entitySources;
  }

  // 分析实体和源的映射关系
  private static analyzeEntitySources(
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
}
