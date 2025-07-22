import { Hono } from "hono";
import { handleError, parseQueryParams, validateSource } from "./utils";
import {
  getRepo,
  BaseURPC,
  BaseURPCConfig,
  MethodsForGet,
  MethodsForPost,
  Repository,
} from "@unilab/urpc-core";

export interface URPCConfig extends BaseURPCConfig {
  app?: Hono;
}

export class URPC extends BaseURPC {
  private static app: Hono;

  static init(config: URPCConfig) {
    super.init(config);

    if (config.app) {
      this.app = config.app;
    } else {
      this.app = new Hono();
      this.app.onError((err, c) => handleError(err, c));
    }

    this.setupRoutes();

    return this.app;
  }

  static getApp() {
    return this.app;
  }

  static repo<T extends Record<string, any>>(options: {
    entity: string;
    source: string;
  }) {
    return getRepo(options.entity, options.source) as Repository<T>;
  }

  private static setupRoutes() {
    MethodsForGet.forEach((funcName) => {
      this.app.get(`/:entity/${funcName}`, async (c) => {
        return this.handleRequest(c, funcName);
      });
    });

    this.app.post("/:entity/:funcName", async (c) => {
      const funcName = c.req.param("funcName");
      return this.handleRequest(c, funcName);
    });
  }

  private static async handleRequest(c: any, funcName: string) {
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
      if (MethodsForGet.includes(funcName)) {
        const params = parseQueryParams(c);
        // @ts-ignore
        const result = await repo[funcName](params, {
          entity,
          source,
          context,
        });
        return c.json({ data: result }, 200);
      }

      if (MethodsForPost.includes(funcName)) {
        const body = await c.req.json();
        if (funcName === "call") {
          const result = await repo.call(
            body.data,
            { entity, source, context },
            { honoCtx: c, stream: context?.stream }
          );
          if (result instanceof Response) {
            return result;
          }
          return c.json({ data: result }, 200);
        } else {
          // @ts-ignore
          const result = await repo[funcName](body, {
            entity,
            source,
            context,
          });
          return c.json({ data: result }, 200);
        }
      }

      // custom method
      const body = await c.req.json();
      const result = repo.customMethod(funcName, body, {
        entity,
        source,
        context,
      });
      return c.json({ data: result }, 200);
    } catch (error: any) {
      return handleError(error, c);
    }
  }
}

export function repo<T extends Record<string, any>>(options: {
  entity: string;
  source: string;
}): Repository<T> {
  return URPC.repo<T>(options);
}
