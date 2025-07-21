import { Hono } from "hono";
import { handleError, parseQueryParams, validateSource } from "./utils";
import {
  registerAdapter,
  getRepo,
  EntityConfigs,
  getGlobalMiddlewareManager,
  simplifyEntityName,
  DataSourceAdapter,
  extractEntityClassName,
  extractAdapterName,
} from "@unilab/urpc-core";
import {
  generateSchemas,
  Repository,
  SchemaObject,
  Middleware,
  Plugin,
  useGlobalMiddleware,
} from "@unilab/urpc-core";
import { BuiltinPlugin } from "@unilab/builtin-plugin";

export interface URPCConfig {
  app?: Hono;
  plugins: Plugin[];
  middlewares?: Middleware<any>[];
  entityConfigs?: EntityConfigs;
  globalAdapters?: (new () => DataSourceAdapter<any>)[];
}

export class URPC {
  private static app: Hono;
  private static entitySchemas: Record<string, SchemaObject> = {};
  private static entitySources: Record<string, string[]> = {};
  private static entityConfigs: EntityConfigs = {};

  static init(config: URPCConfig) {
    if (config.app) {
      this.app = config.app;
    } else {
      this.app = new Hono();
      this.app.onError((err, c) => handleError(err, c));
    }

    const plugins = [...(config.plugins || []), BuiltinPlugin(this)];
    this.registerPluginAdapters(plugins);
    this.registerGlobalAdapters({
      plugins: plugins,
      globalAdapters: config.globalAdapters,
    });

    if (config.entityConfigs) {
      this.entityConfigs = config.entityConfigs;
      getGlobalMiddlewareManager().setEntityConfigs(this.entityConfigs);
    }

    if (config.middlewares) {
      this.applyMiddlewareToRepos({
        plugins: plugins,
        middlewares: config.middlewares,
      });
    }

    this.analyzeEntities({
      plugins: plugins,
      globalAdapters: config.globalAdapters,
    });

    this.setupRoutes();

    return this.app;
  }

  private static registerPluginAdapters(plugins: Plugin[]) {
    const adapters = plugins.flatMap((p) => p.adapters || []);
    if (adapters.length) {
      adapters.forEach(({ entity, source, adapter }) =>
        registerAdapter(entity, source, adapter)
      );
    }
  }

  private static registerGlobalAdapters({
    plugins,
    globalAdapters = [],
  }: {
    plugins: Plugin[];
    globalAdapters?: (new () => DataSourceAdapter<any>)[];
  }): void {
    if (globalAdapters.length > 0) {
      const entities = plugins.flatMap((p) => p.entities || []);
      globalAdapters.forEach((Adapter) => {
        const source = extractAdapterName(Adapter)
          .toLowerCase()
          .replace("adapter", "");
        entities.forEach((entity) => {
          const entityName = extractEntityClassName(entity);
          registerAdapter(entityName, source, new Adapter());
        });
      });
    }
  }

  private static applyMiddlewareToRepos({
    plugins,
    middlewares,
  }: {
    plugins: Plugin[];
    middlewares: Middleware<any>[];
  }) {
    const entities = plugins.flatMap((p) => p.entities || []);
    middlewares.forEach((m) => {
      const requiredEntities = m.required?.entities;
      if (requiredEntities) {
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

  private static analyzeEntities({
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

  static repo<T extends Record<string, any>>(options: {
    entity: string;
    source: string;
  }) {
    return getRepo(options.entity, options.source) as Repository<T>;
  }

  private static setupRoutes() {
    this.app.get("/:entity/list", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source =
          c.req.query("source") || this.entityConfigs[entity]?.defaultSource;
        const contextStr = c.req.query("context");
        const context = contextStr ? JSON.parse(contextStr) : undefined;

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const repo = getRepo(entity, source!);
        if (!repo) {
          return c.json({ error: "Repository not found" }, 404);
        }

        const params = parseQueryParams(c);
        const result = await repo.findMany(params, {
          entity,
          source,
          context,
        });

        return c.json({ data: result });
      } catch (error) {
        return handleError(error, c);
      }
    });

    this.app.get("/:entity/find_one", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source =
          c.req.query("source") || this.entityConfigs[entity]?.defaultSource;
        const contextStr = c.req.query("context");
        const context = contextStr ? JSON.parse(contextStr) : undefined;

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const params = parseQueryParams(c);
        if (!params.where) {
          return c.json({ error: "where parameter is required" }, 400);
        }

        const repo = getRepo(entity, source!);
        if (!repo) {
          return c.json({ error: "Repository not found" }, 404);
        }

        const result = await repo.findOne(
          {
            where: params.where,
          },
          {
            entity,
            source,
            context,
          }
        );

        return c.json({ data: result });
      } catch (error) {
        return handleError(error, c);
      }
    });

    this.app.post("/:entity/create", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source =
          c.req.query("source") || this.entityConfigs[entity]?.defaultSource;

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const body = await c.req.json();
        if (!body.data) {
          return c.json({ error: "data field is required" }, 400);
        }

        const repo = getRepo(entity, source!);
        if (!repo) {
          return c.json({ error: "Repository not found" }, 404);
        }

        const result = await repo.create(
          {
            data: body.data,
          },
          {
            entity,
            source,
          }
        );

        return c.json({ data: result }, 201);
      } catch (error) {
        return handleError(error, c);
      }
    });

    this.app.post("/:entity/create_many", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source =
          c.req.query("source") || this.entityConfigs[entity]?.defaultSource;

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const body = await c.req.json();
        if (!body.data || !Array.isArray(body.data)) {
          return c.json({ error: "data field is required and must be an array" }, 400);
        }

        const repo = getRepo(entity, source!);
        if (!repo) {
          return c.json({ error: "Repository not found" }, 404);
        }

        const result = await repo.createMany(
          {
            data: body.data,
          },
          {
            entity,
            source,
          }
        );

        return c.json({ data: result }, 201);
      } catch (error) {
        return handleError(error, c);
      }
    });

    this.app.patch("/:entity/update", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source =
          c.req.query("source") || this.entityConfigs[entity]?.defaultSource;

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const body = await c.req.json();
        if (!body.where || !body.data) {
          return c.json({ error: "where and data fields are required" }, 400);
        }

        const repo = getRepo(entity, source!);
        if (!repo) {
          return c.json({ error: "Repository not found" }, 404);
        }

        const result = await repo.update(
          {
            where: body.where,
            data: body.data,
          },
          {
            entity,
            source,
          }
        );

        return c.json({ data: result });
      } catch (error) {
        return handleError(error, c);
      }
    });

    this.app.patch("/:entity/update_many", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source =
          c.req.query("source") || this.entityConfigs[entity]?.defaultSource;

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const body = await c.req.json();
        if (!body.where || !body.data) {
          return c.json({ error: "where and data fields are required" }, 400);
        }

        const repo = getRepo(entity, source!);
        if (!repo) {
          return c.json({ error: "Repository not found" }, 404);
        }

        const result = await repo.updateMany(
          {
            where: body.where,
            data: body.data,
          },
          {
            entity,
            source,
          }
        );

        return c.json({ data: result });
      } catch (error) {
        return handleError(error, c);
      }
    });

    this.app.post("/:entity/upsert", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source =
          c.req.query("source") || this.entityConfigs[entity]?.defaultSource;

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const body = await c.req.json();
        if (!body.where || !body.update || !body.create) {
          return c.json({ error: "where, update, and create fields are required" }, 400);
        }

        const repo = getRepo(entity, source!);
        if (!repo) {
          return c.json({ error: "Repository not found" }, 404);
        }

        const result = await repo.upsert(
          {
            where: body.where,
            update: body.update,
            create: body.create,
          },
          {
            entity,
            source,
          }
        );

        return c.json({ data: result }, 201);
      } catch (error) {
        return handleError(error, c);
      }
    });

    this.app.delete("/:entity/delete", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source =
          c.req.query("source") || this.entityConfigs[entity]?.defaultSource;

        const sourceError = validateSource(source, c);
        if (sourceError) return sourceError;

        const params = parseQueryParams(c);
        if (!params.where) {
          return c.json({ error: "where parameter is required" }, 400);
        }

        const repo = getRepo(entity, source!);
        if (!repo) {
          return c.json({ error: "Repository not found" }, 404);
        }

        const result = await repo.delete(
          {
            where: params.where,
          },
          {
            entity,
            source,
          }
        );

        return c.json({ data: { success: result } });
      } catch (error) {
        return handleError(error, c);
      }
    });

    this.app.post("/:entity/call", async (c) => {
      try {
        const entity = c.req.param("entity");
        const source =
          c.req.query("source") || this.entityConfigs[entity]?.defaultSource;
        const contextStr = c.req.query("context");
        const context = contextStr ? JSON.parse(contextStr) : undefined;

        if (!source) {
          return c.json({ error: "source parameter is required" }, 400);
        }

        const body = await c.req.json();
        if (!body.data) {
          return c.json({ error: "data field is required" }, 400);
        }

        const repo = getRepo(entity, source!);
        if (!repo) {
          return c.json({ error: "Repository not found" }, 404);
        }

        const result = await repo.call(
          body.data,
          {
            entity,
            source,
            context,
          },
          {
            honoCtx: c,
            stream: context?.stream,
          }
        );

        // If the result is a Response object (stream), return it directly
        if (result instanceof Response) {
          return result;
        }

        // Otherwise, wrap it in a JSON response
        return c.json({ data: result });
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

  static getEntitySources(): Record<string, string[]> {
    return this.entitySources;
  }

  static getEntityConfigs(): EntityConfigs {
    return this.entityConfigs;
  }
}
