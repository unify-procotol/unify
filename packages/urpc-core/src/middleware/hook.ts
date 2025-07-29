import type { Middleware, MiddlewareContext, MiddlewareNext } from "../types";

export type HookFunction = (context: MiddlewareContext) => Promise<void> | void;

export interface HookRegistry {
  beforeCreate: HookFunction[];
  afterCreate: HookFunction[];

  beforeUpdate: HookFunction[];
  afterUpdate: HookFunction[];

  beforeDelete: HookFunction[];
  afterDelete: HookFunction[];

  beforeAny: HookFunction[];
  afterAny: HookFunction[];
}

export class HookManager {
  private hooks: HookRegistry = {
    beforeCreate: [],
    afterCreate: [],
    beforeUpdate: [],
    afterUpdate: [],
    beforeDelete: [],
    afterDelete: [],
    beforeAny: [],
    afterAny: [],
  };

  beforeCreate(hook: HookFunction): this {
    this.hooks.beforeCreate.push(hook);
    return this;
  }

  afterCreate(hook: HookFunction): this {
    this.hooks.afterCreate.push(hook);
    return this;
  }

  beforeUpdate(hook: HookFunction): this {
    this.hooks.beforeUpdate.push(hook);
    return this;
  }

  afterUpdate(hook: HookFunction): this {
    this.hooks.afterUpdate.push(hook);
    return this;
  }

  beforeDelete(hook: HookFunction): this {
    this.hooks.beforeDelete.push(hook);
    return this;
  }

  afterDelete(hook: HookFunction): this {
    this.hooks.afterDelete.push(hook);
    return this;
  }

  beforeAny(hook: HookFunction): this {
    this.hooks.beforeAny.push(hook);
    return this;
  }

  afterAny(hook: HookFunction): this {
    this.hooks.afterAny.push(hook);
    return this;
  }

  async executeBefore(context: MiddlewareContext): Promise<void> {
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

  async executeAfter(context: MiddlewareContext): Promise<void> {
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

  clearType(type: keyof HookRegistry): void {
    this.hooks[type] = [];
  }
}

export function createHookMiddleware(
  setupHooks?: (hookManager: HookManager) => void
): Middleware {
  const hookManager = new HookManager();

  if (setupHooks) {
    setupHooks(hookManager);
  }

  const fn = async (context: MiddlewareContext, next: MiddlewareNext) => {
    await hookManager.executeBefore(context);

    const result = await next();

    context.result = result;

    await hookManager.executeAfter(context);

    return result;
  };

  return {
    fn,
    name: "HookMiddleware",
  };
}
