import {
  Middleware,
  MiddlewareContext,
  MiddlewareNext,
  OperationCacheConfig,
} from "../types";
import { getGlobalMiddlewareManager } from "../middleware-manager";
import crypto from "crypto";

export interface CacheOptions {
  bentocache: any; // BentoCache instance
}

export function cache<T extends Record<string, any>>({
  bentocache,
}: CacheOptions): Middleware<T> {
  const fn = async (context: MiddlewareContext<T>, next: MiddlewareNext<T>) => {
    const metadata = context.metadata;
    const entityName = metadata?.entity;
    const operation = context.operation;

    if (!entityName || !bentocache) {
      return await next();
    }

    const entityConfigs = getGlobalMiddlewareManager().entityConfigs;
    const entityConfig = entityConfigs[entityName];

    const cacheConfig = entityConfig?.cache;
    let operationConfig: OperationCacheConfig | undefined;
    if (cacheConfig) {
      operationConfig = cacheConfig[operation];
    }

    // Generate cache key based on entity, operation, and args
    const cacheKey = generateCacheKey(entityName, operation, context.args);

    try {
      const result = await bentocache.getOrSet({
        key: cacheKey,
        factory: async () => {
          return await next();
        },
        ttl: operationConfig?.ttl,
        grace: operationConfig?.grace,
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
