import type { NextApiRequest, NextApiResponse } from "next";
import {
  handleError,
  parseQueryParams,
  getSourceFromQuery,
  parseContext,
} from "./utils";
import {
  getRepo,
  BaseURPC,
  BaseURPCConfig,
  MethodsForGet,
  MethodsForPost,
  Repository,
} from "@unilab/urpc-core";

export class URPC extends BaseURPC {
  static init(config: BaseURPCConfig) {
    super.init(config);

    return async function handler(req: NextApiRequest, res: NextApiResponse) {
      return await URPC.handler(req, res);
    };
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
      const routeParams = req.query.urpc;
      const route = Array.isArray(routeParams)
        ? (routeParams as string[])
        : [routeParams as string].filter(Boolean);

      const [entity, funcName] = route;

      if (!entity || !funcName) {
        return res.status(400).json({
          error: "Entity and function name are required",
        });
      }

      const source =
        getSourceFromQuery(req) || this.entityConfigs[entity]?.defaultSource;

      if (!source) {
        return res.status(400).json({ error: "Source is required" });
      }

      const repo = getRepo(entity, source);
      if (!repo) {
        return res.status(404).json({ error: "Repository not found" });
      }

      const context = parseContext(req);

      const metadata = {
        entity,
        source,
        nextApiRequest: req,
        ...context,
      };

      if (MethodsForGet.includes(funcName)) {
        const params = parseQueryParams(req);
        // @ts-ignore
        const result = await repo[funcName](params, metadata);
        return res.status(200).json({ data: result });
      }

      if (MethodsForPost.includes(funcName)) {
        const body: any = req.body;
        // @ts-ignore
        const result = await repo[funcName](body, metadata);
        return res.status(200).json({ data: result });
      }

      // custom method
      const body: any = req.body;
      const result = await repo.customMethod(funcName, body, metadata);
      return res.status(200).json({ data: result });
    } catch (error) {
      return handleError(error, res);
    }
  }
}

export function repo<T extends Record<string, any>>(options: {
  entity: string;
  source: string;
}): Repository<T> {
  return URPC.repo<T>(options);
}
