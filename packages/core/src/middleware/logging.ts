import { Middleware, MiddlewareContext, MiddlewareNext } from "../types";

export function Logging<T extends Record<string, any>>(
  logger: (message: string, context?: any) => void = console.log
): Middleware<T> {
  const middleware = async (
    context: MiddlewareContext<T>,
    next: MiddlewareNext<T>
  ) => {
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

  // 使用Object.defineProperty正确设置name属性
  Object.defineProperty(middleware, "name", {
    value: "LoggingMiddleware",
    writable: false,
    enumerable: false,
    configurable: true,
  });

  return middleware;
}
