import type { NextApiRequest, NextApiResponse } from "next";
import {
  handleError,
  parseQueryParams,
  validateSource,
  getSourceFromQuery,
} from "./utils";
import { registerAdapter, getRepo, getRepoRegistry } from "../repo";
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
import { UnifyConfig } from "../type";

export class Unify {
  private static entitySchemas: Record<string, SchemaObject> = {};
  private static entitySources: Record<string, string[]> = {};
  private static initialized = false;

  // Static initialization method
  static init(config: UnifyConfig) {
    if (this.initialized) {
      return;
    }

    if (config.plugins) {
      this.initFromPlugins(config.plugins);
    }

    if (config.middleware) {
      this.applyMiddlewareToRepos(config.middleware);
    }

    this.initialized = true;

    return async function handler(req: NextApiRequest, res: NextApiResponse) {
      return await Unify.handler(req, res);
    };
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
    adapters.forEach(({ source, adapter }) => registerAdapter(source, adapter));

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
    source,
    adapter,
  }: {
    source: string;
    adapter: DataSourceAdapter<T>;
  }) {
    try {
      const repo = getRepo(source) as Repository<T>;
      return repo;
    } catch (error) {
      return registerAdapter(source, adapter);
    }
  }

  // Main handler for Next.js Pages Router API routes
  static async handler(
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<void> {
    try {
      const method = req.method || "GET";

      // Extract route parameters
      const routeParams = req.query.unify;
      const route = Array.isArray(routeParams)
        ? (routeParams as string[])
        : [routeParams as string].filter(Boolean);

      const [entity, action] = route;

      if (!entity || !action) {
        return res.status(400).json({
          error: "Entity and action are required",
        });
      }

      const source = getSourceFromQuery(req);

      if (!validateSource(source, res)) {
        return;
      }

      const repo = getRepo(source!);

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

  // Handle findMany operation
  private static async handleFindMany(
    req: NextApiRequest,
    res: NextApiResponse,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<void> {
    try {
      const params = parseQueryParams(req);
      const result = await repo.findMany(params);

      return res.status(200).json({ data: result, entity, source });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // Handle findOne operation
  private static async handleFindOne(
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

      const result = await repo.findOne({
        where: params.where,
      });

      return res.status(200).json({ data: result, entity, source });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // Handle create operation
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

      const result = await repo.create({
        data: body.data,
      });

      return res.status(201).json({ data: result, entity, source });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // Handle update operation
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

      const result = await repo.update({
        where: body.where,
        data: body.data,
      });

      return res.status(200).json({ data: result, entity, source });
    } catch (error) {
      return handleError(error, res);
    }
  }

  // Handle delete operation
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

      const result = await repo.delete({
        where: params.where,
      });

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

  // Static method to get entity-source mapping
  static getEntitySources(): Record<string, string[]> {
    return this.entitySources;
  }

  // Analyze entity-source mapping relationships
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
