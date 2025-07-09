import type { Middleware, MiddlewareContext, MiddlewareNext } from "../types";

export type HookFunction<T extends Record<string, any>> = (
  context: MiddlewareContext<T>
) => Promise<void> | void;

export interface HookRegistry<T extends Record<string, any>> {
  beforeCreate: HookFunction<T>[];
  afterCreate: HookFunction<T>[];

  beforeUpdate: HookFunction<T>[];
  afterUpdate: HookFunction<T>[];

  beforeDelete: HookFunction<T>[];
  afterDelete: HookFunction<T>[];

  beforeAny: HookFunction<T>[];
  afterAny: HookFunction<T>[];
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

  beforeCreate(hook: HookFunction<T>): this {
    this.hooks.beforeCreate.push(hook);
    return this;
  }

  afterCreate(hook: HookFunction<T>): this {
    this.hooks.afterCreate.push(hook);
    return this;
  }

  beforeUpdate(hook: HookFunction<T>): this {
    this.hooks.beforeUpdate.push(hook);
    return this;
  }

  afterUpdate(hook: HookFunction<T>): this {
    this.hooks.afterUpdate.push(hook);
    return this;
  }

  beforeDelete(hook: HookFunction<T>): this {
    this.hooks.beforeDelete.push(hook);
    return this;
  }

  afterDelete(hook: HookFunction<T>): this {
    this.hooks.afterDelete.push(hook);
    return this;
  }

  beforeAny(hook: HookFunction<T>): this {
    this.hooks.beforeAny.push(hook);
    return this;
  }

  afterAny(hook: HookFunction<T>): this {
    this.hooks.afterAny.push(hook);
    return this;
  }

  async executeBefore(context: MiddlewareContext<T>): Promise<void> {
    for (const hook of this.hooks.beforeAny) {
      await hook(context);
    }

    switch (context.operation) {
      case "create":
        for (const hook of this.hooks.beforeCreate) {
          await hook(context);
        }
        break;
      case "update":
        for (const hook of this.hooks.beforeUpdate) {
          await hook(context);
        }
        break;
      case "delete":
        for (const hook of this.hooks.beforeDelete) {
          await hook(context);
        }
        break;
    }
  }

  async executeAfter(context: MiddlewareContext<T>): Promise<void> {
    switch (context.operation) {
      case "create":
        for (const hook of this.hooks.afterCreate) {
          await hook(context);
        }
        break;
      case "update":
        for (const hook of this.hooks.afterUpdate) {
          await hook(context);
        }
        break;
      case "delete":
        for (const hook of this.hooks.afterDelete) {
          await hook(context);
        }
        break;
    }

    for (const hook of this.hooks.afterAny) {
      await hook(context);
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
    await hookManager.executeBefore(context);

    const result = await next();

    context.result = result;
    
    await hookManager.executeAfter(context);

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
