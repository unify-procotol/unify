import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handleError, parseQueryParams, validateSource } from "./utils";
import { registerAdapter, getRepo, getRepoRegistry } from "@unilab/urpc-core";
import {
  DataSourceAdapter,
  generateSchemas,
  Repository,
  SchemaObject,
  Middleware,
  Plugin,
  AdapterRegistration,
  useGlobalMiddleware,
} from "@unilab/urpc-core";
import { URPCConfig } from "../type";

type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<{ urpc: string[] }> }
) => Promise<NextResponse>;

export interface URPCAPI {
  GET: RouteHandler;
  POST: RouteHandler;
  PATCH: RouteHandler;
  DELETE: RouteHandler;
}

export class URPC {
  private static entitySchemas: Record<string, SchemaObject> = {};
  private static entitySources: Record<string, string[]> = {};
  private static initialized = false;

  static init(config: URPCConfig): URPCAPI {
    if (!this.initialized) {
      if (config.plugins) {
        this.initFromPlugins(config.plugins);
      }

      if (config.middleware) {
        this.applyMiddlewareToRepos(config.middleware);
      }

      this.initialized = true;
    }

    return {
      GET: this.handler,
      POST: this.handler,
      PATCH: this.handler,
      DELETE: this.handler,
    };
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

  private static applyMiddlewareToRepos(middleware: Middleware<any>[]) {
    middleware.forEach((m) => useGlobalMiddleware(m));
    console.log(
      `✅ Registered middleware: ${middleware.map((m) => m.name).join(", ")}`
    );
  }

  static repo<T extends Record<string, any>>({
    entity,
    source,
    adapter,
  }: {
    entity: string;
    source: string;
    adapter: DataSourceAdapter<T>;
  }) {
    try {
      const repo = getRepo(entity, source) as Repository<T>;
      return repo;
    } catch (error) {
      return registerAdapter(entity, source, adapter);
    }
  }

  private static async resolveParams(
    params: Promise<{ urpc: string[] }>
  ): Promise<{ urpc: string[] }> {
    return await params;
  }

  static async handler(
    request: NextRequest,
    { params }: { params: Promise<{ urpc: string[] }> }
  ): Promise<NextResponse> {
    try {
      const method = request.method;
      const resolvedParams = await URPC.resolveParams(params);
      const [entity, action] = resolvedParams.urpc;

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

      const repo = getRepo(entity, source!);

      switch (`${method}:${action}`) {
        case "GET:list":
          return await URPC.handleFindMany(request, repo, entity, source!);
        case "GET:find_one":
          return await URPC.handleFindOne(request, repo, entity, source!);
        case "POST:create":
          return await URPC.handleCreate(request, repo, entity, source!);
        case "PATCH:update":
          return await URPC.handleUpdate(request, repo, entity, source!);
        case "DELETE:delete":
          return await URPC.handleDelete(request, repo, entity, source!);
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
