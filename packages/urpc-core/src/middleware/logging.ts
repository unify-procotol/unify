import { Middleware, MiddlewareContext, MiddlewareNext } from "../types";

export function logging(
  logger: (message: string, context?: any) => void = console.log
): Middleware {
  const fn = async (context: MiddlewareContext, next: MiddlewareNext) => {
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

  return {
    fn,
    name: "LoggingMiddleware",
  };
}
