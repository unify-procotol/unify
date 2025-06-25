import { Middleware, MiddlewareContext, MiddlewareOptions } from "../types";

export class MiddlewareManager<T extends Record<string, any>>
  implements MiddlewareManager<T>
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
