import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  AdapterRegistration,
  adapterRegistry,
  getAdapter,
  handleError,
  loadRelations,
  parseQueryParams,
  registerAdapter,
  validateSource,
} from "./utils";

export interface UnifyConfig {
  app?: Hono;
}

export class Unify {
  private static app: Hono;

  // 静态初始化方法
  static init(config: UnifyConfig = {}) {
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

    return this.app;
  }

  // 静态注册适配器方法
  static register(adapters: AdapterRegistration[]) {
    // 如果 app 未初始化，使用默认配置初始化
    if (!this.app) {
      this.init();
    }

    adapters.forEach(({ source, adapter }) => {
      registerAdapter(source, () => adapter);
    });

    // 创建 Unify 服务器路由
    this.setupRoutes();

    console.log(
      `✅ Registered adapters: ${adapters.map((a) => a.source).join(", ")}`
    );

    return this.app;
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

        if (result && result.length > 0 && params.include) {
          // 获取实体类名，首字母大写
          const entityClassName = entity.charAt(0).toUpperCase() + entity.slice(1) + 'Entity';
          const enrichedResult = await Promise.all(
            result.map(item => loadRelations(item, entityClassName, params.include))
          );
          return c.json({ data: enrichedResult, entity, source });
        }

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

        if (result && params.include) {
          // 获取实体类名，首字母大写
          const entityClassName = entity.charAt(0).toUpperCase() + entity.slice(1) + 'Entity';
          const enrichedResult = await loadRelations(result, entityClassName, params.include);
          return c.json({ data: enrichedResult, entity, source });
        }

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
}
