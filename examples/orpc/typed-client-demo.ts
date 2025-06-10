import { createClientFromSource } from "../../packages/client/src/typed-client";
import { os } from "@orpc/server";
import { z } from "zod";

// 示例1：基于表配置的类型推断
const tableBasedConfig = {
  id: "blog-api",
  entities: {
    user: {
      table: {
        name: "users",
        schema: "public",
        columns: {
          id: { type: "integer" as const, nullable: false },
          name: { type: "varchar" as const, nullable: false },
          email: { type: "varchar" as const, nullable: true },
          age: { type: "integer" as const, nullable: true },
          created_at: { type: "timestamp" as const, nullable: false },
        },
      },
    },
    post: {
      table: {
        name: "posts",
        schema: "public",
        columns: {
          id: { type: "integer" as const, nullable: false },
          title: { type: "varchar" as const, nullable: false },
          content: { type: "text" as const, nullable: true },
          user_id: { type: "integer" as const, nullable: false },
          published: {
            type: "boolean" as const,
            nullable: false,
            default: false,
          },
        },
      },
    },
  },
} as const;

// 示例2：基于 oRPC 的类型推断
const orpcBasedConfig = {
  id: "orpc-api",
  entities: {
    user: {
      findOne: os
        .input(
          z.object({
            id: z.coerce.number().int().min(1),
            includeProfile: z.boolean().optional(),
          })
        )
        .handler(({ input }) => {
          return {
            id: input.id,
            name: "User " + input.id,
            profile: input.includeProfile ? { bio: "User bio" } : null,
          };
        }),
      create: os
        .input(
          z.object({
            name: z.string().min(1),
            email: z.string().email(),
            age: z.number().int().min(0).max(120).optional(),
          })
        )
        // .output(
        //   z.object({
        //     id: z.number(),
        //     name: z.string(),
        //     email: z.string(),
        //   })
        // )
        .handler(({ input }) => {
          return {
            id: Math.floor(Math.random() * 1000),
            ...input,
          };
        }),
    },
  },
} as const;

// 创建类型化客户端
const tableClient = createClientFromSource(tableBasedConfig, {
  baseURL: "http://localhost:3000",
});

const orpcClient = createClientFromSource(orpcBasedConfig, {
  baseURL: "http://localhost:3000",
});

// 使用示例 - 展示类型推断的改进

async function demonstrateTypedClient() {
  console.log("=== 基于表配置的类型推断 ===");

  // findOne 方法 - 需要 id 参数
  const user1 = await tableClient.user.findOne({
    id: 123, // ✅ 类型安全：id 是必需的
  });

  // create 方法 - 基于表结构推断参数类型
  const newUser = await tableClient.user.create({
    name: "张三", // ✅ 必需字段
    email: "zhangsan@example.com", // ✅ 可选字段
    age: 25, // ✅ 可选字段
    // created_at 会自动生成，不需要传入
  });

  // update 方法 - 部分更新
  const updatedUser = await tableClient.user.update(123, {
    name: "李四", // ✅ 可以更新任意字段
    age: 30,
  });

  console.log("=== 基于 oRPC 的类型推断 ===");

  // findOne 方法 - 使用 oRPC 定义的输入 schema
  const user2 = await orpcClient.user.findOne({
    id: 456, // ✅ 必需参数，类型为 number
    includeProfile: true, // ✅ 可选参数，类型为 boolean
  });

  // create 方法 - 使用 oRPC 定义的输入 schema
  const newUser2 = await orpcClient.user.create({
    name: "王五", // ✅ 必需参数，最少1个字符
    email: "wangwu@example.com", // ✅ 必需参数，必须是有效邮箱
    age: 28, // ✅ 可选参数，0-120之间的整数
  });

  console.log("类型推断演示完成！");
}

// 类型检查示例（这些会在编译时报错）
async function typeCheckingExamples() {
  // ❌ 编译错误：缺少必需的 id 参数
  // const user = await tableClient.user.findOne({});
  // ❌ 编译错误：id 类型错误
  // const user = await tableClient.user.findOne({ id: "invalid" });
  // ❌ 编译错误：oRPC 参数类型不匹配
  // const user = await orpcClient.user.findOne({ id: "not-a-number" });
  // ❌ 编译错误：email 格式不正确（运行时会验证）
  // const user = await orpcClient.user.create({
  //   name: "测试",
  //   email: "invalid-email"
  // });
}

export { demonstrateTypedClient, typeCheckingExamples };
