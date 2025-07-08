import { Hono } from "hono";
import { handleError, parseQueryParams, validateSource } from "./utils";
import {
  registerAdapter,
  getRepo,
  getRepoRegistry,
  RepoOptions,
} from "@unilab/urpc-core";
import {
  generateSchemas,
  Repository,
  SchemaObject,
  Middleware,
  Plugin,
  AdapterRegistration,
  useGlobalMiddleware,
} from "@unilab/urpc-core";
import { BuiltinPlugin } from "@unilab/builtin-plugin";

export interface URPCConfig {
  app?: Hono;
  plugins?: Plugin[];
  middlewares?: Middleware<any>[];
}

export class URPC {
  private static app: Hono;
  private static entitySchemas: Record<string, SchemaObject> = {};
  private static entitySources: Record<string, string[]> = {};

  static init(config: URPCConfig) {
    if (config.app) {
      this.app = config.app;
    } else {
      this.app = new Hono();
      this.app.onError((err, c) => handleError(err, c));
    }

    if (config.plugins) {
      this.initFromPlugins([...config.plugins, BuiltinPlugin(this)]);
    }

    if (config.middlewares) {
      this.applyMiddlewareToRepos(config.middlewares);
    }

    this.setupRoutes();

    return this.app;
  }

  private static initFromPlugins(plugins: Plugin[]) {
    const entities = plugins.flatMap((p) => p.entities || []);
    const adapters = plugins.flatMap((p) => p.adapters || []);

    if (entities.length > 0) {
      this.entitySchemas = generateSchemas(entities);
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

  private static applyMiddlewareToRepos(middlewares: Middleware<any>[]) {
    middlewares.forEach((m) => useGlobalMiddleware(m));
    console.log(
      `✅ Registered middlewares: ${middlewares.map((m) => m.name).join(", ")}`
    );
  }

  static repo<T extends Record<string, any>>(options: RepoOptions) {
    return getRepo(options.entity, options.source) as Repository<T>;
  }

  private static setupRoutes() {
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

  static getEntitySources(): Record<string, string[]> {
    return this.entitySources;
  }

  private static analyzeEntitySources(
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
}
