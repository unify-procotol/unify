import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handleError, parseContext, parseQueryParams } from "./utils";
import {
  getRepo,
  BaseURPC,
  MethodsForGet,
  MethodsForPost,
  BaseURPCConfig,
  Repository,
} from "@unilab/urpc-core";

type RouteHandler = (
  request: NextRequest,
  context: { params: Promise<{ urpc: string[] }> }
) => Promise<NextResponse>;

export interface URPCAPI {
  GET: RouteHandler;
  POST: RouteHandler;
}

export class URPC extends BaseURPC {
  static init(config: BaseURPCConfig): URPCAPI {
    super.init(config);

    return {
      GET: this.handler,
      POST: this.handler,
    };
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
      const resolvedParams = await URPC.resolveParams(params);
      const [entity, funcName] = resolvedParams.urpc;

      if (!entity || !funcName) {
        return NextResponse.json(
          { error: "Entity and function name are required" },
          { status: 400 }
        );
      }

      const url = new URL(request.url);
      const source =
        url.searchParams.get("source") ||
        this.entityConfigs[entity]?.defaultSource;
      const context = parseContext(request);

      if (!source) {
        return NextResponse.json(
          { error: "Source is required" },
          { status: 400 }
        );
      }

      const repo = getRepo(entity, source);
      if (!repo) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }

      if (MethodsForGet.includes(funcName)) {
        const params = parseQueryParams(request);
        // @ts-ignore
        const result = await repo[funcName](params, {
          entity,
          source,
          context,
          nextRequest: request,
        });
        return NextResponse.json({ data: result }, { status: 200 });
      }

      if (MethodsForPost.includes(funcName)) {
        const body: any = await request.json();
        // @ts-ignore
        const result = await repo[funcName](body, {
          entity,
          source,
          context,
          nextRequest: request,
        });
        return NextResponse.json({ data: result }, { status: 200 });
      }

      // custom method
      const body: any = await request.json();
      const result = await repo.customMethod(funcName, body, {
        entity,
        source,
        context,
        nextRequest: request,
      });
      return NextResponse.json({ data: result }, { status: 200 });
    } catch (error) {
      return handleError(error);
    }
  }
}

export function repo<T extends Record<string, any>>(options: {
  entity: string;
  source: string;
}): Repository<T> {
  return URPC.repo<T>(options);
}
