import type { NextApiRequest, NextApiResponse } from "next";
import {
  handleError,
  parseQueryParams,
  validateSource,
  getSourceFromQuery,
} from "./utils";
import {
  registerAdapter,
  getRepo,
  EntityConfigs,
  getGlobalMiddlewareManager,
  simplifyEntityName,
  DataSourceAdapter,
  extractAdapterName,
  extractEntityClassName,
} from "@unilab/urpc-core";
import {
  generateSchemas,
  Repository,
  SchemaObject,
  Middleware,
  Plugin,
  useGlobalMiddleware,
} from "@unilab/urpc-core";
import { URPCConfig } from "../type";
import { BuiltinPlugin } from "@unilab/builtin-plugin";

export class URPC {
  private static entitySchemas: Record<string, SchemaObject> = {};
  private static entitySources: Record<string, string[]> = {};
  private static entityConfigs: EntityConfigs = {};
  private static initialized = false;

  static init(config: URPCConfig) {
    if (this.initialized) {
      return;
    }

    const plugins = [...config.plugins, BuiltinPlugin(this)];
    this.registerPluginAdapters(plugins);
    this.registerGlobalAdapters({
      plugins,
      globalAdapters: config.globalAdapters,
    });

    if (config.entityConfigs) {
      this.entityConfigs = config.entityConfigs;
      getGlobalMiddlewareManager().setEntityConfigs(this.entityConfigs);
    }

    if (config.middlewares) {
      this.applyMiddlewareToRepos({
        plugins,
        middlewares: config.middlewares,
      });
    }

    this.analyzeEntities({
      plugins: plugins,
      globalAdapters: config.globalAdapters,
    });

    this.initialized = true;

    return async function handler(req: NextApiRequest, res: NextApiResponse) {
      return await URPC.handler(req, res);
    };
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

  static async handler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const method = req.method || "GET";

      const routeParams = req.query.urpc;
      const route = Array.isArray(routeParams)
        ? (routeParams as string[])
        : [routeParams as string].filter(Boolean);

      const [entity, action] = route;

      if (!entity || !action) {
        return res.status(400).json({
          error: "Entity and action are required",
        });
      }

      const source =
        getSourceFromQuery(req) || this.entityConfigs[entity]?.defaultSource;

      if (!validateSource(source, res)) {
        return;
      }

      const repo = getRepo(entity, source!);
      if (!repo) {
        return res.status(404).json({ error: "Repository not found" });
      }

      switch (`${method}:${action}`) {
        case "GET:list":
          return await this.handleFindMany(req, res, repo, entity, source!);
        case "GET:find_one":
          return await this.handleFindOne(req, res, repo, entity, source!);
        case "POST:create":
          return await this.handleCreate(req, res, repo, entity, source!);
        case "PATCH:update":
          return await this.handleUpdate(req, res, repo, entity, source!);
        case "DELETE:delete":
          return await this.handleDelete(req, res, repo, entity, source!);
        case "POST:call":
          return await this.handleCall(req, res, repo, entity, source!);
        default:
          return res.status(400).json({
            error: `Unsupported operation: ${method}:${action}`,
          });
      }
    } catch (error) {
      return handleError(error, res);
    }
  }

  private static async handleFindMany(
    req: NextApiRequest,
    res: NextApiResponse,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<void> {
    try {
      const { context, ...params } = parseQueryParams(req);
      const result = await repo.findMany(params, {
        entity,
        source,
        context,
      });

      return res.status(200).json({ data: result });
    } catch (error) {
      return handleError(error, res);
    }
  }

  private static async handleFindOne(
    req: NextApiRequest,
    res: NextApiResponse,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<void> {
    try {
      const { context, ...params } = parseQueryParams(req);
      if (!params.where) {
        return res.status(400).json({
          error: "where parameter is required",
        });
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

      return res.status(200).json({ data: result });
    } catch (error) {
      return handleError(error, res);
    }
  }

  private static async handleCreate(
    req: NextApiRequest,
    res: NextApiResponse,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<void> {
    try {
      const body = req.body as { data?: any };
      if (!body || !body.data) {
        return res.status(400).json({
          error: "data field is required",
        });
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

      return res.status(201).json({ data: result });
    } catch (error) {
      return handleError(error, res);
    }
  }

  private static async handleUpdate(
    req: NextApiRequest,
    res: NextApiResponse,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<void> {
    try {
      const body = req.body as { where?: any; data?: any };
      if (!body || !body.where || !body.data) {
        return res.status(400).json({
          error: "where and data fields are required",
        });
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

      return res.status(200).json({ data: result });
    } catch (error) {
      return handleError(error, res);
    }
  }

  private static async handleDelete(
    req: NextApiRequest,
    res: NextApiResponse,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<void> {
    try {
      const params = parseQueryParams(req);
      if (!params.where) {
        return res.status(400).json({
          error: "where parameter is required",
        });
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

      return res
        .status(200)
        .json({ data: { success: result }, entity, source });
    } catch (error) {
      return handleError(error, res);
    }
  }

  private static async handleCall(
    req: NextApiRequest,
    res: NextApiResponse,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<void> {
    try {
      const body = req.body as { data?: any };
      if (!body || !body.data) {
        return res.status(400).json({
          error: "data field is required",
        });
      }

      const { context } = parseQueryParams(req);

      const result = await repo.call(
        body.data,
        {
          entity,
          source,
          context,
        },
        {
          nextApiRequest: req,
          stream: context?.stream,
        }
      );

      // Check if result is a Pages Router stream response from adapter
      if (
        result &&
        typeof result === "object" &&
        (result as any).__isPageRouterStream
      ) {
        const streamResult = result as any;
        await streamResult.streamHandler(res);
        return;
      }

      if (result instanceof Response) {
        // TODO: stream response, not supported yet
        return res
          .status(200)
          .json({ data: null, message: "stream response not supported yet" });
      }

      return res.status(200).json({ data: result });
    } catch (error) {
      return handleError(error, res);
    }
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
