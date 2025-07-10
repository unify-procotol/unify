import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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
import { URPCConfig } from "../type";
import { BuiltinPlugin } from "@unilab/builtin-plugin";

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
  private static entityConfigs: EntityConfigs = {};
  private static entityNames: string[] = [];
  private static initialized = false;

  static init(config: URPCConfig): URPCAPI {
    if (!this.initialized) {
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
      const source =
        url.searchParams.get("source") ||
        this.entityConfigs[entity]?.defaultSource;

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
      const { context, ...params } = parseQueryParams(request);
      const result = await repo.findMany(params, {
        entity,
        source,
        context,
      });

      return NextResponse.json({ data: result });
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
      const { context, ...params } = parseQueryParams(request);
      if (!params.where) {
        return NextResponse.json(
          { error: "where parameter is required" },
          { status: 400 }
        );
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

      return NextResponse.json({ data: result });
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

      const result = await repo.create(
        {
          data: body.data,
        },
        {
          entity,
          source,
        }
      );

      return NextResponse.json({ data: result }, { status: 201 });
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

      return NextResponse.json({ data: result });
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

      const result = await repo.delete(
        {
          where: params.where,
        },
        {
          entity,
          source,
        }
      );

      return NextResponse.json({ data: { success: result } });
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
