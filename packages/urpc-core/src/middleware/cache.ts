import { Middleware, MiddlewareContext, MiddlewareNext } from "../types";
import { getMiddlewareManager } from "../middleware-manager";
import crypto from "crypto";

export interface CacheOptions {
  bentocache: any; // BentoCache instance
}

export function cache({ bentocache }: CacheOptions): Middleware {
  const fn = async (context: MiddlewareContext, next: MiddlewareNext) => {
    const metadata = context.metadata;
    const entityName = metadata?.entity;
    const operation = context.operation;

    if (!entityName || !bentocache) {
      return await next();
    }

    const entityConfigs = getMiddlewareManager().entityConfigs;
    const entityConfig = entityConfigs[entityName];

    const cacheConfig = entityConfig?.cache;
    if (!cacheConfig) {
      return await next();
    }

    const operationConfig = cacheConfig[operation];

    if (operationConfig === false || operationConfig === undefined) {
      return await next();
    }

    // Generate cache key based on entity, operation, and args
    const cacheKey = generateCacheKey(entityName, operation, context.args);

    try {
      const result = await bentocache.getOrSet({
        key: cacheKey,
        factory: async () => {
          return await next();
        },
        ttl:
          typeof operationConfig === "object"
            ? operationConfig?.ttl
            : undefined,
        grace:
          typeof operationConfig === "object"
            ? operationConfig?.grace
            : undefined,
      });

      return result;
    } catch (error) {
      // Cache error, falling back to original function
      return await next();
    }
  };

  return {
    fn,
    name: "CacheMiddleware",
  };
}

function generateCacheKey(
  entityName: string,
  operation: string,
  args: any
): string {
  const argsStr = args ? JSON.stringify(args) : "";
  const md5 = crypto.createHash("md5").update(argsStr).digest("hex");
  return `${entityName}-${operation}-${md5}`;
}
