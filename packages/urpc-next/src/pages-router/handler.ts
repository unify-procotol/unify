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
import { URPCConfig } from "../type";
import { BuiltinPlugin } from "@unilab/builtin-plugin";

export class URPC {
  private static entitySchemas: Record<string, SchemaObject> = {};
  private static entitySources: Record<string, string[]> = {};
  private static entityConfigs: EntityConfigs = {};
  private static entityNames: string[] = [];
  private static initialized = false;

  static init(config: URPCConfig) {
    if (this.initialized) {
      return;
    }

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

    this.initialized = true;

    return async function handler(req: NextApiRequest, res: NextApiResponse) {
      return await URPC.handler(req, res);
    };
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

      return res.status(200).json({ data: result, entity, source });
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

      return res.status(200).json({ data: result, entity, source });
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

      return res.status(201).json({ data: result, entity, source });
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

      return res.status(200).json({ data: result, entity, source });
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
