import {
  EntityConfigs,
  Middleware,
  MiddlewareContext,
  MiddlewareManagerInterface,
  MiddlewareOptions,
  OperationContext,
} from "./types";

class MiddlewareManager<T extends Record<string, any>>
  implements MiddlewareManagerInterface<T>
{
  entityConfigs: EntityConfigs = {};

  private middlewares: Array<{
    middleware: Middleware<T>;
    options: MiddlewareOptions;
  }> = [];

  setEntityConfigs(entityConfigs: EntityConfigs): void {
    this.entityConfigs = entityConfigs;
  }

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
    operation: (ctx: OperationContext) => Promise<any>
  ): Promise<any> {
    if (this.middlewares.length === 0) {
      return operation({
        user: context.user,
      });
    }

    const entity = context.metadata?.entity;
    const entityConfig = entity ? this.entityConfigs[entity] : undefined;
    const hasI18n = entityConfig?.fields
      ? Object.values(entityConfig.fields).some((field) => field.i18n)
      : false;

    const filteredMiddlewares = this.middlewares.filter((m) => {
      if (!hasI18n && m.options.name === "i18nAIMiddleware") {
        return false;
      }
      return true;
    });

    if (filteredMiddlewares.length === 0) {
      return operation({
        user: context.user,
      });
    }

    const beforeMiddlewares = filteredMiddlewares.filter(
      (m) => m.options.position === "before"
    );
    const afterMiddlewares = filteredMiddlewares.filter(
      (m) => m.options.position === "after"
    );
    const aroundMiddlewares = filteredMiddlewares.filter(
      (m) => m.options.position === "around"
    );

    // Execute before middlewares
    for (const { middleware } of beforeMiddlewares) {
      await middleware.fn(context, async () => {});
    }

    // Execute around middlewares with the operation
    let finalOperation = operation;

    // Wrap the operation with around middlewares (in reverse order to create proper nesting)
    for (let i = aroundMiddlewares.length - 1; i >= 0; i--) {
      const { middleware } = aroundMiddlewares[i];
      const currentOperation = finalOperation;
      finalOperation = async () => {
        return middleware.fn(context, async () =>
          currentOperation({
            user: context.user,
          })
        );
      };
    }

    // Execute the final wrapped operation
    const result = await finalOperation({
      user: context.user,
    });
    context.result = result;

    // Execute after middlewares
    for (const { middleware } of afterMiddlewares) {
      await middleware.fn(context, async () => result);
    }

    return result;
  }
}

const globalMiddlewareManager = new MiddlewareManager<any>();

export class GlobalMiddleware {
  static use<T extends Record<string, any>>(
    middleware: Middleware<T>,
    options?: MiddlewareOptions
  ): void {
    globalMiddlewareManager.use(middleware, options);
  }

  static remove(name: string): boolean {
    return globalMiddlewareManager.remove(name);
  }

  static clear(): void {
    globalMiddlewareManager.clear();
  }

  static getManager() {
    return globalMiddlewareManager;
  }

  static getCount(): number {
    return (globalMiddlewareManager as any).middlewares?.length || 0;
  }
}

export function getGlobalMiddlewareManager() {
  return globalMiddlewareManager;
}

export function useGlobalMiddleware<T extends Record<string, any>>(
  middleware: Middleware<T>,
  options?: MiddlewareOptions
): void {
  middleware;
  const middlewareOptions = {
    ...options,
    required: options?.required || middleware.required,
    name: options?.name || middleware.name || `middleware_${Date.now()}`,
  };
  GlobalMiddleware.use(middleware, middlewareOptions);
}

export function removeGlobalMiddleware(name: string): boolean {
  return GlobalMiddleware.remove(name);
}

export function clearGlobalMiddlewares(): void {
  GlobalMiddleware.clear();
}
