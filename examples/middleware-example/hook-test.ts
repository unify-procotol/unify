import { Repository } from "@unilab/core";
import {
  createHookMiddleware,
  createHookBuilder,
} from "@unilab/core/middleware";
import type { 
  DataSourceAdapter, 
  CreationArgs, 
  UpdateArgs, 
  DeletionArgs 
} from "@unilab/core";

// 示例实体
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

// 纯净的 Adapter - 只负责数据访问
class UserAdapter implements DataSourceAdapter<User> {
  private users: User[] = [];

  async findMany() {
    return [...this.users];
  }

  async findOne(args: any) {
    return this.users.find((user) => user.id === args.where.id) || null;
  }

  async create(args: any) {
    const user: User = {
      id: `user_${Date.now()}`,
      ...args.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async update(args: any) {
    const index = this.users.findIndex((user) => user.id === args.where.id);
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...args.data,
        updatedAt: new Date(),
      };
      return this.users[index];
    }
    throw new Error("User not found");
  }

  async delete(args: any) {
    const index = this.users.findIndex((user) => user.id === args.where.id);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}

// 业务逻辑服务 - 独立于 Adapter
class UserService {
  static validateUser(data: Partial<User>) {
    if (!data.name || data.name.length < 2) {
      throw new Error("Name must be at least 2 characters long");
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error("Invalid email format");
    }
    if (data.age !== undefined && (data.age < 0 || data.age > 150)) {
      throw new Error("Age must be between 0 and 150");
    }
  }

  static normalizeUser(data: Partial<User>) {
    if (data.name) {
      data.name = data.name.trim();
    }
    if (data.email) {
      data.email = data.email.toLowerCase();
    }
  }

  static async sendWelcomeEmail(user: User) {
    console.log(`📧 Sending welcome email to ${user.email}`);
    // 实际的邮件发送逻辑
  }

  static async logUserCreation(user: User) {
    console.log(`📝 User created: ${user.id} - ${user.name}`);
    // 实际的日志记录逻辑
  }

  static async indexUserForSearch(user: User) {
    console.log(`🔍 Indexing user for search: ${user.id}`);
    // 实际的搜索索引逻辑
  }

  static async cleanupUserData(userId: string) {
    console.log(`🧹 Cleaning up data for user: ${userId}`);
    // 清理相关数据
  }

  static async removeUserFromCache(userId: string) {
    console.log(`🗑️ Removing user from cache: ${userId}`);
    // 缓存清理逻辑
  }
}

// 方式一：使用工厂函数创建 Hook 中间件
export function createUserRepositoryWithHooks() {
  const adapter = new UserAdapter();
  const repo = new Repository<User>(adapter);

  // 使用工厂函数创建 Hook 中间件
  const hookMiddleware = createHookMiddleware<User>((hookManager) => {
    // 注册 beforeCreate 钩子
    hookManager.beforeCreate(async (args: CreationArgs<User>, _, context) => {
      console.log(
        "🚀 Before Create Hook: Validating and normalizing user data"
      );

      // 数据验证
      UserService.validateUser(args.data);

      // 数据标准化
      UserService.normalizeUser(args.data);

      // 访问 adapter 信息
      console.log(`Using adapter: ${context?.adapter.constructor.name}`);
    });

    // 注册 afterCreate 钩子
    hookManager.afterCreate(async (args: CreationArgs<User>, result, context) => {
      console.log("✨ After Create Hook: User created successfully");

      if (result) {
        // 发送欢迎邮件
        await UserService.sendWelcomeEmail(result);

        // 记录日志
        await UserService.logUserCreation(result);

        // 索引搜索
        await UserService.indexUserForSearch(result);
      }

      console.log(
        `Operation: ${context?.operation}, Adapter: ${context?.adapter.constructor.name}`
      );
    });

    // 注册 beforeDelete 钩子
    hookManager.beforeDelete(async (args: DeletionArgs<User>, _, context) => {
      console.log("🗑️ Before Delete Hook: Preparing to delete user");
      // 可以在这里检查权限等
    });

    // 注册 afterDelete 钩子
    hookManager.afterDelete(async (args: DeletionArgs<User>, result, context) => {
      if (result) {
        console.log("💀 After Delete Hook: User deleted successfully");

        // 提取用户 ID (处理复杂的查询条件)
        const userId =
          typeof args.where.id === "string"
            ? args.where.id
            : args.where.id?.$eq;
        if (userId) {
          await UserService.cleanupUserData(userId);
          await UserService.removeUserFromCache(userId);
        }
      }
    });

    // 注册通用钩子
    hookManager.beforeAny(async (args: any, _, context) => {
      console.log(
        `🔄 Before Any Hook: ${context?.operation} operation starting`
      );
    });

    hookManager.afterAny(async (args: any, result: any, context) => {
      console.log(
        `✅ After Any Hook: ${context?.operation} operation completed`
      );
    });
  });

  // 安装 Hook 中间件
  repo.use(hookMiddleware, {
    name: "userHooks",
    position: "around",
    priority: 20,
  });

  return repo;
}

// 方式二：使用构建器模式创建 Hook 中间件
export function createUserRepositoryWithBuilder() {
  const adapter = new UserAdapter();
  const repo = new Repository<User>(adapter);

  // 使用构建器模式
  const hookMiddleware = createHookBuilder<User>()
    .beforeCreate(async (args: CreationArgs<User>, _, context) => {
      console.log("🚀 Builder: Before Create Hook");
      UserService.validateUser(args.data);
      UserService.normalizeUser(args.data);
    })
    .afterCreate(async (args: CreationArgs<User>, result, context) => {
      console.log("✨ Builder: After Create Hook");
      if (result) {
        await UserService.sendWelcomeEmail(result);
        await UserService.logUserCreation(result);
        await UserService.indexUserForSearch(result);
      }
    })
    .beforeUpdate(async (args: UpdateArgs<User>, _, context) => {
      console.log("🔄 Builder: Before Update Hook");
      if (args.data) {
        UserService.validateUser(args.data);
        UserService.normalizeUser(args.data);
      }
    })
    .afterUpdate(async (args: UpdateArgs<User>, result, context) => {
      console.log("✅ Builder: After Update Hook");
      if (result) {
        console.log(`Updated user: ${result.id}`);
      }
    })
    .beforeDelete(async (args: DeletionArgs<User>, _, context) => {
      console.log("🗑️ Builder: Before Delete Hook");
      // 权限检查等
    })
    .afterDelete(async (args: DeletionArgs<User>, result, context) => {
      if (result) {
        console.log("💀 Builder: After Delete Hook");
        const userId =
          typeof args.where.id === "string"
            ? args.where.id
            : args.where.id?.$eq;
        if (userId) {
          await UserService.cleanupUserData(userId);
          await UserService.removeUserFromCache(userId);
        }
      }
    })
    .beforeAny(async (args: any, _, context) => {
      console.log(`🔄 Builder: Before Any - ${context?.operation}`);
    })
    .afterAny(async (args: any, result: any, context) => {
      console.log(`✅ Builder: After Any - ${context?.operation}`);
    })
    .build();

  // 安装 Hook 中间件
  repo.use(hookMiddleware, {
    name: "userHooksBuilder",
    position: "around",
    priority: 20,
  });

  return repo;
}

// 演示函数
export async function demonstrateHookMiddleware() {
  console.log("🚀 Starting Hook Middleware Demonstration...\n");

  // 测试工厂函数方式
  console.log("=== FACTORY FUNCTION APPROACH ===");
  const factoryRepo = createUserRepositoryWithHooks();

  try {
    const user1 = await factoryRepo.create({
      data: {
        name: "  张三  ",
        email: "ZHANGSAN@EXAMPLE.COM",
        age: 25,
      },
    });
    console.log("User created:", user1);

    const updatedUser = await factoryRepo.update({
      where: { id: user1.id },
      data: { age: 26 },
    });
    console.log("User updated:", updatedUser);

    await factoryRepo.delete({ where: { id: user1.id } });
    console.log("User deleted");
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
  }

  console.log("\n=== BUILDER PATTERN APPROACH ===");
  const builderRepo = createUserRepositoryWithBuilder();

  try {
    const user2 = await builderRepo.create({
      data: {
        name: "李四",
        email: "lisi@example.com",
        age: 30,
      },
    });
    console.log("User created:", user2);

    await builderRepo.delete({ where: { id: user2.id } });
    console.log("User deleted");
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
  }

  console.log("\n✨ Hook Middleware demonstration completed!");

  console.log("\n📝 Benefits of this approach:");
  console.log("• Complete separation of concerns");
  console.log("• Business logic independent of data layer");
  console.log("• Highly testable and reusable hooks");
  console.log("• Access to adapter and context information");
  console.log("• Flexible hook registration and management");
  console.log("• Support for both generic and specific hooks");
}

demonstrateHookMiddleware();
