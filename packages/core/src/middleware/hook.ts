import type {
  Middleware,
  MiddlewareContext,
  MiddlewareNext,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  DataSourceAdapter,
} from "../types";

// Hook 函数类型定义
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

// Hook 注册表类型
export interface HookRegistry<T extends Record<string, any>> {
  // Create 相关钩子
  beforeCreate: HookFunction<T, CreationArgs<T>>[];
  afterCreate: HookFunction<T, CreationArgs<T>, T>[];

  // Update 相关钩子
  beforeUpdate: HookFunction<T, UpdateArgs<T>>[];
  afterUpdate: HookFunction<T, UpdateArgs<T>, T>[];

  // Delete 相关钩子
  beforeDelete: HookFunction<T, DeletionArgs<T>>[];
  afterDelete: HookFunction<T, DeletionArgs<T>, boolean>[];

  // 通用钩子
  beforeAny: HookFunction<T, any>[];
  afterAny: HookFunction<T, any, any>[];
}

// Hook 管理器
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

  // 注册 beforeCreate 钩子
  beforeCreate(hook: HookFunction<T, CreationArgs<T>>): this {
    this.hooks.beforeCreate.push(hook);
    return this;
  }

  // 注册 afterCreate 钩子
  afterCreate(hook: HookFunction<T, CreationArgs<T>, T>): this {
    this.hooks.afterCreate.push(hook);
    return this;
  }

  // 注册 beforeUpdate 钩子
  beforeUpdate(hook: HookFunction<T, UpdateArgs<T>>): this {
    this.hooks.beforeUpdate.push(hook);
    return this;
  }

  // 注册 afterUpdate 钩子
  afterUpdate(hook: HookFunction<T, UpdateArgs<T>, T>): this {
    this.hooks.afterUpdate.push(hook);
    return this;
  }

  // 注册 beforeDelete 钩子
  beforeDelete(hook: HookFunction<T, DeletionArgs<T>>): this {
    this.hooks.beforeDelete.push(hook);
    return this;
  }

  // 注册 afterDelete 钩子
  afterDelete(hook: HookFunction<T, DeletionArgs<T>, boolean>): this {
    this.hooks.afterDelete.push(hook);
    return this;
  }

  // 注册通用 before 钩子
  beforeAny(hook: HookFunction<T, any>): this {
    this.hooks.beforeAny.push(hook);
    return this;
  }

  // 注册通用 after 钩子
  afterAny(hook: HookFunction<T, any, any>): this {
    this.hooks.afterAny.push(hook);
    return this;
  }

  // 执行 before 钩子
  async executeBefore(
    operation: string,
    args: any,
    adapter: DataSourceAdapter<T>,
    metadata?: Record<string, any>
  ): Promise<void> {
    const context = { adapter, operation, metadata };

    // 执行通用 before 钩子
    for (const hook of this.hooks.beforeAny) {
      await hook(args, undefined, context);
    }

    // 执行具体操作的 before 钩子
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

  // 执行 after 钩子
  async executeAfter(
    operation: string,
    args: any,
    result: any,
    adapter: DataSourceAdapter<T>,
    metadata?: Record<string, any>
  ): Promise<void> {
    const context = { adapter, operation, metadata };

    // 执行具体操作的 after 钩子
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

    // 执行通用 after 钩子
    for (const hook of this.hooks.afterAny) {
      await hook(args, result, context);
    }
  }

  // 清除所有钩子
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

  // 清除特定类型的钩子
  clearType(type: keyof HookRegistry<T>): void {
    this.hooks[type] = [];
  }
}

// 创建 Hook 中间件的工厂函数
export function createHookMiddleware<T extends Record<string, any>>(
  adapter: DataSourceAdapter<T>,
  setupHooks?: (hookManager: HookManager<T>) => void
): Middleware<T> {
  const hookManager = new HookManager<T>();

  // 如果提供了钩子设置函数，则执行
  if (setupHooks) {
    setupHooks(hookManager);
  }

  return async (context: MiddlewareContext<T>, next: MiddlewareNext<T>) => {
    // 执行 before 钩子
    await hookManager.executeBefore(
      context.operation,
      context.args,
      adapter,
      context.metadata
    );

    // 执行主操作
    const result = await next();

    // 执行 after 钩子
    await hookManager.executeAfter(
      context.operation,
      context.args,
      result,
      adapter,
      context.metadata
    );

    return result;
  };
}

// 便捷的钩子构建器
export class HookBuilder<T extends Record<string, any>> {
  private setupFunctions: Array<(hookManager: HookManager<T>) => void> = [];

  // 添加 beforeCreate 钩子
  beforeCreate(hook: HookFunction<T, CreationArgs<T>>): this {
    this.setupFunctions.push((manager) => manager.beforeCreate(hook));
    return this;
  }

  // 添加 afterCreate 钩子
  afterCreate(hook: HookFunction<T, CreationArgs<T>, T>): this {
    this.setupFunctions.push((manager) => manager.afterCreate(hook));
    return this;
  }

  // 添加 beforeUpdate 钩子
  beforeUpdate(hook: HookFunction<T, UpdateArgs<T>>): this {
    this.setupFunctions.push((manager) => manager.beforeUpdate(hook));
    return this;
  }

  // 添加 afterUpdate 钩子
  afterUpdate(hook: HookFunction<T, UpdateArgs<T>, T>): this {
    this.setupFunctions.push((manager) => manager.afterUpdate(hook));
    return this;
  }

  // 添加 beforeDelete 钩子
  beforeDelete(hook: HookFunction<T, DeletionArgs<T>>): this {
    this.setupFunctions.push((manager) => manager.beforeDelete(hook));
    return this;
  }

  // 添加 afterDelete 钩子
  afterDelete(hook: HookFunction<T, DeletionArgs<T>, boolean>): this {
    this.setupFunctions.push((manager) => manager.afterDelete(hook));
    return this;
  }

  // 添加通用 before 钩子
  beforeAny(hook: HookFunction<T, any>): this {
    this.setupFunctions.push((manager) => manager.beforeAny(hook));
    return this;
  }

  // 添加通用 after 钩子
  afterAny(hook: HookFunction<T, any, any>): this {
    this.setupFunctions.push((manager) => manager.afterAny(hook));
    return this;
  }

  // 构建中间件
  build(adapter: DataSourceAdapter<T>): Middleware<T> {
    return createHookMiddleware(adapter, (hookManager) => {
      for (const setupFn of this.setupFunctions) {
        setupFn(hookManager);
      }
    });
  }
}

// 创建钩子构建器的便捷函数
export function createHookBuilder<
  T extends Record<string, any>
>(): HookBuilder<T> {
  return new HookBuilder<T>();
}
