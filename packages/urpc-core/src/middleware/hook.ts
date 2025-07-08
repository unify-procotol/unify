import type {
  Middleware,
  MiddlewareContext,
  MiddlewareNext,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  DataSourceAdapter,
} from "../types";

export type HookFunction<
  T extends Record<string, any>,
  TArgs = any,
  TResult = any
> = (
  args: TArgs,
  result?: TResult,
  context?: {
    adapter: DataSourceAdapter<T>;
    operation: string;
    metadata?: Record<string, any>;
  }
) => Promise<void> | void;

export interface HookRegistry<T extends Record<string, any>> {
  beforeCreate: HookFunction<T, CreationArgs<T>>[];
  afterCreate: HookFunction<T, CreationArgs<T>, T>[];

  beforeUpdate: HookFunction<T, UpdateArgs<T>>[];
  afterUpdate: HookFunction<T, UpdateArgs<T>, T>[];

  beforeDelete: HookFunction<T, DeletionArgs<T>>[];
  afterDelete: HookFunction<T, DeletionArgs<T>, boolean>[];

  beforeAny: HookFunction<T, any>[];
  afterAny: HookFunction<T, any, any>[];
}

export class HookManager<T extends Record<string, any>> {
  private hooks: HookRegistry<T> = {
    beforeCreate: [],
    afterCreate: [],
    beforeUpdate: [],
    afterUpdate: [],
    beforeDelete: [],
    afterDelete: [],
    beforeAny: [],
    afterAny: [],
  };

  beforeCreate(hook: HookFunction<T, CreationArgs<T>>): this {
    this.hooks.beforeCreate.push(hook);
    return this;
  }

  afterCreate(hook: HookFunction<T, CreationArgs<T>, T>): this {
    this.hooks.afterCreate.push(hook);
    return this;
  }

  beforeUpdate(hook: HookFunction<T, UpdateArgs<T>>): this {
    this.hooks.beforeUpdate.push(hook);
    return this;
  }

  afterUpdate(hook: HookFunction<T, UpdateArgs<T>, T>): this {
    this.hooks.afterUpdate.push(hook);
    return this;
  }

  beforeDelete(hook: HookFunction<T, DeletionArgs<T>>): this {
    this.hooks.beforeDelete.push(hook);
    return this;
  }

  afterDelete(hook: HookFunction<T, DeletionArgs<T>, boolean>): this {
    this.hooks.afterDelete.push(hook);
    return this;
  }

  beforeAny(hook: HookFunction<T, any>): this {
    this.hooks.beforeAny.push(hook);
    return this;
  }

  afterAny(hook: HookFunction<T, any, any>): this {
    this.hooks.afterAny.push(hook);
    return this;
  }

  async executeBefore(
    operation: string,
    args: any,
    adapter: DataSourceAdapter<T>
  ): Promise<void> {
    const context = { adapter, operation };

    for (const hook of this.hooks.beforeAny) {
      await hook(args, undefined, context);
    }

    switch (operation) {
      case "create":
        for (const hook of this.hooks.beforeCreate) {
          await hook(args, undefined, context);
        }
        break;
      case "update":
        for (const hook of this.hooks.beforeUpdate) {
          await hook(args, undefined, context);
        }
        break;
      case "delete":
        for (const hook of this.hooks.beforeDelete) {
          await hook(args, undefined, context);
        }
        break;
    }
  }

  async executeAfter(
    operation: string,
    args: any,
    result: any,
    adapter: DataSourceAdapter<T>
  ): Promise<void> {
    const context = { adapter, operation };

    switch (operation) {
      case "create":
        for (const hook of this.hooks.afterCreate) {
          await hook(args, result, context);
        }
        break;
      case "update":
        for (const hook of this.hooks.afterUpdate) {
          await hook(args, result, context);
        }
        break;
      case "delete":
        for (const hook of this.hooks.afterDelete) {
          await hook(args, result, context);
        }
        break;
    }

    for (const hook of this.hooks.afterAny) {
      await hook(args, result, context);
    }
  }

  clear(): void {
    this.hooks = {
      beforeCreate: [],
      afterCreate: [],
      beforeUpdate: [],
      afterUpdate: [],
      beforeDelete: [],
      afterDelete: [],
      beforeAny: [],
      afterAny: [],
    };
  }

  clearType(type: keyof HookRegistry<T>): void {
    this.hooks[type] = [];
  }
}

export function createHookMiddleware<T extends Record<string, any>>(
  setupHooks?: (hookManager: HookManager<T>) => void
): Middleware<T> {
  const hookManager = new HookManager<T>();

  if (setupHooks) {
    setupHooks(hookManager);
  }

  const middleware = async (
    context: MiddlewareContext<T>,
    next: MiddlewareNext<T>
  ) => {
    await hookManager.executeBefore(
      context.operation,
      context.args,
      context.adapter
    );

    const result = await next();

    await hookManager.executeAfter(
      context.operation,
      context.args,
      result,
      context.adapter
    );

    return result;
  };

  // The name attribute needs to be set
  Object.defineProperty(middleware, "name", {
    value: "HookMiddleware",
    writable: false,
    enumerable: false,
    configurable: true,
  });

  return middleware;
}
