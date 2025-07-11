import { Hono } from "hono";
import { cors } from "hono/cors";
import { handleError, parseQueryParams, validateSource } from "./utils";
import {
  registerAdapter,
  getRepo,
  getRepoRegistry,
  EntityConfigs,
  getGlobalMiddlewareManager,
  simplifyEntityName,
  DataSourceAdapter,
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
  entityConfigs?: EntityConfigs;
  globalAdapters?: (new () => DataSourceAdapter<any>)[];
}

export class URPC {
  private static app: Hono;
  private static entitySchemas: Record<string, SchemaObject> = {};
  private static entitySources: Record<string, string[]> = {};
  private static entityConfigs: EntityConfigs = {};
  private static entityNames: string[] = [];

  static init(config: URPCConfig) {
    if (config.app) {
      this.app = config.app;
    } else {
      this.app = new Hono();
      this.app.onError((err, c) => handleError(err, c));
    }

    // Configure CORS for all routes
    this.app.use(
      "*",
      cors({
        origin: "*", // Allow all origins in development
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
        maxAge: 600,
        credentials: true,
      })
    );

    if (config.plugins) {
      this.initFromPlugins([...config.plugins, BuiltinPlugin(this)]);
    }

    if (config.globalAdapters) {
      this.registerGlobalAdapters(config.globalAdapters);
    }

    if (config.entityConfigs) {
      this.entityConfigs = config.entityConfigs;
      getGlobalMiddlewareManager().setEntityConfigs(this.entityConfigs);
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
      this.entityNames = entities.map((e) => simplifyEntityName(e.name));
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

  private static registerGlobalAdapters(
    globalAdapters: (new () => DataSourceAdapter<any>)[] = []
  ) {
    if (globalAdapters.length > 0) {
      globalAdapters.forEach((Adapter) => {
        const source = Adapter.name;
        this.entityNames.forEach((entityName) => {
          registerAdapter(entityName, source, new Adapter());
        });
      });
      console.log(
        `✅ Registered global adapters: ${globalAdapters
          .map((a) => {
            return `${a.name}`;
          })
          .join(", ")}`
      );
    }
  }

  private static applyMiddlewareToRepos(middlewares: Middleware<any>[]) {
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
