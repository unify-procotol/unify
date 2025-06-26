import {
  Middleware,
  MiddlewareContext,
  MiddlewareManagerInterface,
  MiddlewareOptions,
} from "./types";

class MiddlewareManager<T extends Record<string, any>>
  implements MiddlewareManagerInterface<T>
{
  private middlewares: Array<{
    middleware: Middleware<T>;
    options: MiddlewareOptions;
  }> = [];

  use(middleware: Middleware<T>, options: MiddlewareOptions = {}): void {
    const middlewareConfig = {
      middleware,
      options: {
        position: options.position || "around",
        priority: options.priority || 0,
        name: options.name || `middleware_${Date.now()}`,
      },
    };

    this.middlewares.push(middlewareConfig);

    // Sort by priority (higher priority first)
    this.middlewares.sort(
      (a, b) => (b.options.priority || 0) - (a.options.priority || 0)
    );
  }

  remove(name: string): boolean {
    const initialLength = this.middlewares.length;
    this.middlewares = this.middlewares.filter((m) => m.options.name !== name);
    return this.middlewares.length < initialLength;
  }

  clear(): void {
    this.middlewares = [];
  }

  async execute(
    context: MiddlewareContext<T>,
    operation: () => Promise<any>
  ): Promise<any> {
    if (this.middlewares.length === 0) {
      return operation();
    }

    // Filter middlewares based on position
    const beforeMiddlewares = this.middlewares.filter(
      (m) => m.options.position === "before"
    );
    const afterMiddlewares = this.middlewares.filter(
      (m) => m.options.position === "after"
    );
    const aroundMiddlewares = this.middlewares.filter(
      (m) => m.options.position === "around"
    );

    // Execute before middlewares
    for (const { middleware } of beforeMiddlewares) {
      await middleware(context, async () => {});
    }

    // Execute around middlewares with the operation
    let finalOperation = operation;

    // Wrap the operation with around middlewares (in reverse order to create proper nesting)
    for (let i = aroundMiddlewares.length - 1; i >= 0; i--) {
      const { middleware } = aroundMiddlewares[i];
      const currentOperation = finalOperation;
      finalOperation = async () => {
        return middleware(context, currentOperation);
      };
    }

    // Execute the final wrapped operation
    const result = await finalOperation();
    context.result = result;

    // Execute after middlewares
    for (const { middleware } of afterMiddlewares) {
      await middleware(context, async () => result);
    }

    return result;
  }
}

// 全局中间件管理器
const globalMiddlewareManager = new MiddlewareManager<any>();

/**
 * 全局中间件管理器
 * 提供统一的中间件注册和管理功能
 */
export class GlobalMiddleware {
  /**
   * 注册全局中间件
   * @param middleware 中间件函数
   * @param options 中间件选项
   */
  static use<T extends Record<string, any>>(
    middleware: Middleware<T>,
    options?: MiddlewareOptions
  ): void {
    globalMiddlewareManager.use(middleware, options);
  }

  /**
   * 移除指定名称的全局中间件
   * @param name 中间件名称
   * @returns 是否成功移除
   */
  static remove(name: string): boolean {
    return globalMiddlewareManager.remove(name);
  }

  /**
   * 清空所有全局中间件
   */
  static clear(): void {
    globalMiddlewareManager.clear();
  }

  /**
   * 获取全局中间件管理器实例
   * @returns 中间件管理器实例
   */
  static getManager() {
    return globalMiddlewareManager;
  }

  /**
   * 获取当前注册的中间件数量
   * @returns 中间件数量
   */
  static getCount(): number {
    return (globalMiddlewareManager as any).middlewares?.length || 0;
  }
}

/**
 * 获取全局中间件管理器实例
 * @returns 全局中间件管理器
 */
export function getGlobalMiddlewareManager() {
  return globalMiddlewareManager;
}

/**
 * 注册全局中间件的便捷函数
 * @param middleware 中间件函数
 * @param options 中间件选项
 */
export function useGlobalMiddleware<T extends Record<string, any>>(
  middleware: Middleware<T>,
  options?: MiddlewareOptions
): void {
  GlobalMiddleware.use(middleware, options);
}

/**
 * 移除全局中间件的便捷函数
 * @param name 中间件名称
 * @returns 是否成功移除
 */
export function removeGlobalMiddleware(name: string): boolean {
  return GlobalMiddleware.remove(name);
}

/**
 * 清空全局中间件的便捷函数
 */
export function clearGlobalMiddlewares(): void {
  GlobalMiddleware.clear();
}
