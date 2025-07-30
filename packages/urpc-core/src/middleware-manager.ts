import {
  EntityConfigs,
  Middleware,
  MiddlewareContext,
  MiddlewareManagerInterface,
  MiddlewareOptions,
  OperationContext,
} from "./types";

class MiddlewareManager implements MiddlewareManagerInterface {
  entityConfigs: EntityConfigs = {};

  private middlewares: Array<{
    middleware: Middleware;
    options: MiddlewareOptions;
  }> = [];

  setEntityConfigs(entityConfigs: EntityConfigs): void {
    this.entityConfigs = entityConfigs;
  }

  use(middleware: Middleware, options: MiddlewareOptions = {}): void {
    this.middlewares.push({
      middleware,
      options: {
        name: options?.name || middleware.name,
        required: options?.required || middleware.required,
      },
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
    context: MiddlewareContext,
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

let _middlewareManagerInstance: MiddlewareManager;
export function getMiddlewareManager() {
  if (!_middlewareManagerInstance) {
    _middlewareManagerInstance = new MiddlewareManager();
  }
  return _middlewareManagerInstance;
}
