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
    this.middlewares.push({
      middleware,
      options,
    });
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
        user: null,
      });
    }

    // Execute around middlewares with the operation
    let finalOperation = operation;

    // Wrap the operation with around middlewares (in reverse order to create proper nesting)
    for (let i = this.middlewares.length - 1; i >= 0; i--) {
      const { middleware } = this.middlewares[i];
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
  GlobalMiddleware.use(middleware, {
    name: options?.name || middleware.name,
    required: options?.required || middleware.required,
  });
}

export function removeGlobalMiddleware(name: string): boolean {
  return GlobalMiddleware.remove(name);
}

export function clearGlobalMiddlewares(): void {
  GlobalMiddleware.clear();
}
