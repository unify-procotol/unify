import {
  SourceConfig,
  DEFAULT_METHOD_MAPPING,
  EntityConfig,
  ORPCProcedure,
  EntityFunction,
  EntityFunctionName,
  Storage,
} from "@unify/core";
import {
  parseRequestArgs,
  buildRestPath,
  normalizeResponse,
  handleError,
} from "@unify/core";
import { BuiltinMethods } from "./builtin-methods";
import type { Context } from "hono";
import { AdapterOptions, App } from "./types";

interface RouteCache {
  sourceConfig: SourceConfig;
  entityConfig: EntityConfig;
  handler: EntityFunction;
  middleware: Array<(c: Context, next: () => Promise<void>) => Promise<void>>;
}

export class Adapter {
  private app: App;
  private storage?: Storage;
  private builtinMethods?: BuiltinMethods;
  private sources: Map<string, SourceConfig> = new Map();
  private setupEntityPaths: Set<string> = new Set();
  private routeCache: Map<string, Map<string, RouteCache>> = new Map();

  constructor(app?: App, options: AdapterOptions = {}) {
    if (options.storage) {
      this.storage = options.storage;
      this.builtinMethods = new BuiltinMethods(this.storage);
    }

    if (app) {
      this.app = app;
    } else {
      try {
        const { Hono } = require("hono");
        this.app = new Hono();
      } catch (error) {
        throw new Error(
          "Hono is required. Please install hono: npm install hono"
        );
      }
    }
  }

  register(config: SourceConfig | SourceConfig[]): void {
    if (Array.isArray(config)) {
      config.forEach((cfg) => this.registerSingle(cfg));
      this.setupUnifiedRoutes();
      return;
    }

    this.registerSingle(config);
    this.setupUnifiedRoutes();
  }

  private registerSingle(config: SourceConfig): void {
    if (this.sources.has(config.id)) {
      this.clearRouteCache(config.id);
    }

    this.sources.set(config.id, config);
    this.buildRouteCache(config);
  }

  private buildRouteCache(config: SourceConfig): void {
    const sourceCache = new Map<string, RouteCache>();

    Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
      const allMethods = this.getAllEntityMethods(
        config.id,
        entityName,
        entityConfig
      );
      Object.entries(allMethods).forEach(([methodName, handler]) => {
        const methodKey = `${entityName}:${methodName}`;
        sourceCache.set(methodKey, {
          sourceConfig: config,
          entityConfig,
          handler: handler,
          middleware: config.middleware || [],
        });
      });

      const orpcProcedures = this.getAllORPCProcedures(entityConfig);
      Object.entries(orpcProcedures).forEach(([methodName, procedure]) => {
        const methodKey = `${entityName}:${methodName}`;
        sourceCache.set(methodKey, {
          sourceConfig: config,
          entityConfig,
          handler: procedure.callable(),
          middleware: config.middleware || [],
        });
      });
    });

    this.routeCache.set(config.id, sourceCache);
  }

  private isORPCProcedure(handler: any): boolean {
    return (
      handler &&
      typeof handler === "object" &&
      handler.constructor?.name === "DecoratedProcedure" &&
      "~orpc" in handler &&
      typeof handler["~orpc"]?.handler === "function"
    );
  }

  private clearRouteCache(sourceId: string): void {
    this.routeCache.delete(sourceId);
  }

  public clearAllCache(): void {
    this.routeCache.clear();
  }

  getApp() {
    return this.app;
  }

  getStorage(): Storage | undefined {
    return this.storage;
  }

  private getMethodMapping(
    methodName: string
  ): { method: string; pathSuffix?: string } | null {
    return DEFAULT_METHOD_MAPPING[methodName] || null;
  }

  private getAllEntityMethods(
    sourceId: string,
    entityName: string,
    entityConfig: EntityConfig
  ) {
    const builtinMethods = this.builtinMethods
      ? this.builtinMethods.generateBuiltinMethods(
          sourceId,
          entityName,
          entityConfig
        )
      : {};

    const allMethods = { ...builtinMethods };

    if (typeof entityConfig === "object" && entityConfig !== null) {
      Object.getOwnPropertyNames(entityConfig).forEach((methodName) => {
        if (
          methodName !== "constructor" &&
          typeof entityConfig[methodName as keyof EntityConfig] === "function"
        ) {
          allMethods[methodName] =
            // @ts-ignore
            entityConfig[methodName].bind(entityConfig);
        }
      });
    }

    return allMethods;
  }

  private getAllORPCProcedures(entityConfig: EntityConfig) {
    const procedures: Record<string, ORPCProcedure> = {};
    Object.getOwnPropertyNames(entityConfig).forEach((methodName) => {
      const entityProcedure = entityConfig[methodName as keyof EntityConfig];
      if (this.isORPCProcedure(entityProcedure)) {
        procedures[methodName] = entityProcedure as ORPCProcedure;
      }
    });
    return procedures;
  }

  private setupUnifiedRoutes(): void {
    const entityMethods = new Map<string, Set<string>>();

    this.sources.forEach((config) => {
      Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
        if (!entityMethods.has(entityName)) {
          entityMethods.set(entityName, new Set());
        }
        const allMethods = this.getAllEntityMethods(
          config.id,
          entityName,
          entityConfig
        );
        Object.keys(allMethods).forEach((methodName) => {
          if (typeof allMethods[methodName] === "function") {
            entityMethods.get(entityName)!.add(methodName);
          }
        });

        const orpcProcedures = this.getAllORPCProcedures(entityConfig);
        Object.keys(orpcProcedures).forEach((methodName) => {
          entityMethods.get(entityName)!.add(methodName);
        });
      });
    });

    entityMethods.forEach((methods, entityName) => {
      methods.forEach((methodName) => {
        const mapping = this.getMethodMapping(methodName);
        if (mapping && mapping.method) {
          const path = buildRestPath({
            entityName,
            pathSuffix: mapping.pathSuffix,
          });
          const routeKey = `${mapping.method}:${path}`;

          if (!this.setupEntityPaths.has(routeKey)) {
            this.setupUnifiedRoute({
              method: mapping.method,
              path,
              entityName,
              entityFunctionName: methodName as EntityFunctionName,
            });
            this.setupEntityPaths.add(routeKey);
          }
        }
      });
    });
  }

  private setupUnifiedRoute({
    method,
    path,
    entityName,
    entityFunctionName,
  }: {
    method: string;
    path: string;
    entityName: string;
    entityFunctionName: EntityFunctionName;
  }): void {
    const routeHandler = async (c: Context) => {
      try {
        const args = await parseRequestArgs(c, entityFunctionName);

        // const pathParams = c.req.param();
        // Object.assign(args, pathParams);

        const sourceId = args.source_id;
        if (!sourceId) {
          return c.json({ error: "source_id parameter is required" }, 400);
        }

        const sourceCache = this.routeCache.get(sourceId);
        if (!sourceCache) {
          return c.json({ error: `Source '${sourceId}' not found` }, 404);
        }

        const methodKey = `${entityName}:${entityFunctionName}`;
        const routeCache = sourceCache.get(methodKey);
        if (!routeCache) {
          return c.json(
            {
              error: `Method '${entityFunctionName}' not found for entity '${entityName}' in source '${sourceId}'`,
            },
            404
          );
        }

        for (const mw of routeCache.middleware) {
          let middlewareResult: any = null;
          const next = () => Promise.resolve();
          middlewareResult = await mw(c, next);
          if (middlewareResult) {
            return middlewareResult;
          }
        }

        const result = await routeCache.handler(args, c);

        const response = normalizeResponse(result);

        return c.json(response);
      } catch (error) {
        const errorResponse = handleError(error);
        // @ts-ignore
        return c.json(errorResponse, errorResponse.status);
      }
    };

    switch (method.toUpperCase()) {
      case "GET":
        this.app.get(path, routeHandler);
        break;
      case "POST":
        this.app.post(path, routeHandler);
        break;
      case "PUT":
        this.app.put(path, routeHandler);
        break;
      case "PATCH":
        this.app.patch(path, routeHandler);
        break;
      case "DELETE":
        this.app.delete(path, routeHandler);
        break;
      default:
        if (typeof process !== "undefined" && process.stdout) {
          process.stdout.write(
            `Warning: Unsupported HTTP method: ${method} for ${path}\n`
          );
        }
    }
  }
}
