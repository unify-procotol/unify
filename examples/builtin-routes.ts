import { createSource, QueryArgs } from "unify-server";

// 简单的数据
const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

// 示例1：使用默认内置路由
const sourceWithDefaults = createSource({
  id: "api",
  entities: {
    user: {
      findMany: async (args?: QueryArgs) => {
        return users;
      },
      findOne: async (args?: QueryArgs) => {
        const userId = parseInt(args?.id as string);
        const user = users.find((u) => u.id === userId);
        if (!user) {
          throw { status: 404, message: "User not found" };
        }
        return user;
      },
    },
  },
});

// 示例2：自定义根路径信息
const sourceWithCustomMessage = createSource(
  {
    id: "custom",
    entities: {
      user: {
        findMany: async () => users,
      },
    },
  },
  {
    enableBuiltinRoutes: true,
    rootMessage: "My Custom API Server",
  }
);

// 示例3：禁用内置路由
const sourceWithoutBuiltins = createSource(
  {
    id: "minimal",
    entities: {
      user: {
        findMany: async () => users,
      },
    },
  },
  {
    enableBuiltinRoutes: false,
  }
);

// 使用默认配置的应用
console.log("=== 默认配置示例 ===");
const app1 = sourceWithDefaults.getApp();
console.log(
  "可用路由:",
  sourceWithDefaults.getRoutes().map((r) => `${r.method} ${r.path}`)
);

// 使用自定义配置的应用
console.log("\n=== 自定义配置示例 ===");
const app2 = sourceWithCustomMessage.getApp();

// 禁用内置路由的应用
console.log("\n=== 禁用内置路由示例 ===");
const app3 = sourceWithoutBuiltins.getApp();
// 可以手动添加自定义的根路径
app3.get("/", (c: any) => {
  return c.json({ message: "Custom root endpoint" });
});

// 导出不同配置的应用以供测试
export const defaultApp = {
  port: 3001,
  fetch: app1.fetch,
};

export const customApp = {
  port: 3002,
  fetch: app2.fetch,
};

export const minimalApp = {
  port: 3003,
  fetch: app3.fetch,
};

// 默认导出第一个应用
export default defaultApp;
