import type {
  Middleware,
  MiddlewareContext,
  MiddlewareNext,
} from "@unilab/core";

// Logging Middleware - 记录所有操作
export function createLoggingMiddleware<T extends Record<string, any>>(
  logger: (message: string, context?: any) => void = console.log
): Middleware<T> {
  return async (context: MiddlewareContext<T>, next: MiddlewareNext<T>) => {
    const startTime = Date.now();
    logger(`[${context.operation}] Starting operation`, { args: context.args });

    try {
      const result = await next();
      const duration = Date.now() - startTime;
      logger(`[${context.operation}] Operation completed in ${duration}ms`, {
        result,
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger(`[${context.operation}] Operation failed after ${duration}ms`, {
        error,
      });
      throw error;
    }
  };
}

// Validation Middleware - 验证输入数据
export function createValidationMiddleware<T extends Record<string, any>>(
  validators: Partial<Record<keyof T, (value: any) => boolean | string>>
): Middleware<T> {
  return async (context: MiddlewareContext<T>, next: MiddlewareNext<T>) => {
    if (context.operation === "create" || context.operation === "update") {
      const data = context.args.data;

      for (const [field, validator] of Object.entries(validators)) {
        if (data && field in data && validator) {
          const result = validator(data[field]);
          if (result !== true) {
            throw new Error(
              `Validation failed for field '${field}': ${
                result || "Invalid value"
              }`
            );
          }
        }
      }
    }

    return next();
  };
}

// Caching Middleware - 缓存查询结果
export function createCachingMiddleware<T extends Record<string, any>>(
  cache: Map<string, { data: any; timestamp: number }> = new Map(),
  ttl: number = 60000 // 60 seconds
): Middleware<T> {
  return async (context: MiddlewareContext<T>, next: MiddlewareNext<T>) => {
    if (context.operation === "findMany" || context.operation === "findOne") {
      const cacheKey = `${context.operation}:${JSON.stringify(context.args)}`;
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < ttl) {
        console.log(`Cache hit for ${context.operation}`);
        return cached.data;
      }

      const result = await next();
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      console.log(`Cache set for ${context.operation}`);
      return result;
    }

    // For write operations, clear relevant cache entries
    if (
      context.operation === "create" ||
      context.operation === "update" ||
      context.operation === "delete"
    ) {
      cache.clear(); // Simple cache invalidation
      console.log("Cache cleared due to write operation");
    }

    return next();
  };
}

// Timing Middleware - 性能监控
export function createTimingMiddleware<T extends Record<string, any>>(
  onTiming: (
    operation: string,
    duration: number,
    args?: any
  ) => void = console.log
): Middleware<T> {
  return async (context: MiddlewareContext<T>, next: MiddlewareNext<T>) => {
    const startTime = process.hrtime.bigint();

    try {
      const result = await next();
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      onTiming(`${context.operation} completed`, duration, context.args);
      return result;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;

      onTiming(`${context.operation} failed`, duration, context.args);
      throw error;
    }
  };
}

// Rate Limiting Middleware - 限流
export function createRateLimitingMiddleware<T extends Record<string, any>>(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): Middleware<T> {
  const requests: number[] = [];

  return async (context: MiddlewareContext<T>, next: MiddlewareNext<T>) => {
    const now = Date.now();

    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] <= now - windowMs) {
      requests.shift();
    }

    if (requests.length >= maxRequests) {
      throw new Error(
        `Rate limit exceeded: ${maxRequests} requests per ${windowMs}ms`
      );
    }

    requests.push(now);
    return next();
  };
}

// Transform Middleware - 数据转换
export function createTransformMiddleware<T extends Record<string, any>>(
  transformInput?: (args: any, operation: string) => any,
  transformOutput?: (result: any, operation: string) => any
): Middleware<T> {
  return async (context: MiddlewareContext<T>, next: MiddlewareNext<T>) => {
    // Transform input
    if (transformInput) {
      context.args = transformInput(context.args, context.operation);
    }

    const result = await next();

    // Transform output
    if (transformOutput) {
      return transformOutput(result, context.operation);
    }

    return result;
  };
}

// Audit Middleware - 审计日志
export function createAuditMiddleware<T extends Record<string, any>>(
  auditLog: (entry: {
    operation: string;
    args: any;
    result?: any;
    timestamp: Date;
    userId?: string;
  }) => void
): Middleware<T> {
  return async (context: MiddlewareContext<T>, next: MiddlewareNext<T>) => {
    const timestamp = new Date();
    const userId = context.metadata?.userId;

    try {
      const result = await next();

      auditLog({
        operation: context.operation,
        args: context.args,
        result,
        timestamp,
        userId,
      });

      return result;
    } catch (error) {
      auditLog({
        operation: context.operation,
        args: context.args,
        result: {
          error: error instanceof Error ? error.message : String(error),
        },
        timestamp,
        userId,
      });

      throw error;
    }
  };
}
