import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getRepo,
  getRepoRegistry,
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
  Middleware,
  Plugin,
  AdapterRegistration,
  useGlobalMiddleware,
} from "@unilab/core";

export interface UnifyConfig {
  plugins?: Plugin[];
  middleware?: Middleware<any>[];
}

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
        .map((a) => a.adapter.constructor.name)
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

  // Main handler for Next.js API routes
  static async handler(
    request: NextRequest,
    { params }: { params: { route: string[] } }
  ): Promise<NextResponse> {
    try {
      const method = request.method;
      const [entity, action] = params.route;

      if (!entity || !action) {
        return NextResponse.json(
          { error: "Entity and action are required" },
          { status: 400 }
        );
      }

      const url = new URL(request.url);
      const source = url.searchParams.get("source");

      const sourceError = validateSource(source);
      if (sourceError) {
        return sourceError;
      }

      const repo = getRepo(source!);

      switch (`${method}:${action}`) {
        case "GET:list":
          return await this.handleFindMany(request, repo, entity, source!);
        case "GET:find_one":
          return await this.handleFindOne(request, repo, entity, source!);
        case "POST:create":
          return await this.handleCreate(request, repo, entity, source!);
        case "PATCH:update":
          return await this.handleUpdate(request, repo, entity, source!);
        case "DELETE:delete":
          return await this.handleDelete(request, repo, entity, source!);
        default:
          return NextResponse.json(
            { error: `Unsupported operation: ${method}:${action}` },
            { status: 400 }
          );
      }
    } catch (error) {
      return handleError(error);
    }
  }

  // Handle findMany operation
  private static async handleFindMany(
    request: NextRequest,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<NextResponse> {
    try {
      const params = parseQueryParams(request);
      const result = await repo.findMany(params);

      return NextResponse.json({ data: result, entity, source });
    } catch (error) {
      return handleError(error);
    }
  }

  // Handle findOne operation
  private static async handleFindOne(
    request: NextRequest,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<NextResponse> {
    try {
      const params = parseQueryParams(request);
      if (!params.where) {
        return NextResponse.json(
          { error: "where parameter is required" },
          { status: 400 }
        );
      }

      const result = await repo.findOne({
        where: params.where,
      });

      return NextResponse.json({ data: result, entity, source });
    } catch (error) {
      return handleError(error);
    }
  }

  // Handle create operation
  private static async handleCreate(
    request: NextRequest,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<NextResponse> {
    try {
      const body = (await request.json()) as { data?: any };
      if (!body.data) {
        return NextResponse.json(
          { error: "data field is required" },
          { status: 400 }
        );
      }

      const result = await repo.create({
        data: body.data,
      });

      return NextResponse.json(
        { data: result, entity, source },
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  }

  // Handle update operation
  private static async handleUpdate(
    request: NextRequest,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<NextResponse> {
    try {
      const body = (await request.json()) as { where?: any; data?: any };
      if (!body.where || !body.data) {
        return NextResponse.json(
          { error: "where and data fields are required" },
          { status: 400 }
        );
      }

      const result = await repo.update({
        where: body.where,
        data: body.data,
      });

      return NextResponse.json({ data: result, entity, source });
    } catch (error) {
      return handleError(error);
    }
  }

  // Handle delete operation
  private static async handleDelete(
    request: NextRequest,
    repo: Repository<any>,
    entity: string,
    source: string
  ): Promise<NextResponse> {
    try {
      const params = parseQueryParams(request);
      if (!params.where) {
        return NextResponse.json(
          { error: "where parameter is required" },
          { status: 400 }
        );
      }

      const result = await repo.delete({
        where: params.where,
      });

      return NextResponse.json({ data: { success: result }, entity, source });
    } catch (error) {
      return handleError(error);
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
