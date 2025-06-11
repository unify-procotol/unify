# Unify Server

A Hono-based SDK that maps entity configurations to REST API endpoints

## 特性

- 🚀 基于 [Hono](https://hono.dev/) 高性能 Web 框架
- 📦 自动将实体方法映射为 REST API 端点
- 🔧 支持查询参数（limit, offset, select, where, order_by）
- 🛡️ 内置错误处理和响应标准化
- 📚 自动生成 OpenAPI 文档
- 🔌 支持自定义中间件
- �� 完整的 TypeScript 支持
- 🗄️ 支持表配置和内置CRUD方法

## 安装

```bash
npm install unify-api
```

## 快速开始

### 基本使用示例

```typescript
import { createSource } from 'unify-api';

// 创建数据源
const source = createSource();

// 注册一个简单的数据源
source.register({
  id: "github",
  entities: {
    user: {
      findMany: async () => {
        return [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ];
      },
      findOne: async (args: any) => {
        const userId = parseInt(args?.id as string);
        const user = [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ].find((u) => u.id === userId);
        if (!user) {
          throw { status: 404, message: "User not found" };
        }
        return user;
      },
      create: async (args: any) => {
        return { id: Date.NOW(), ...args };
      },
    },
  },
});

// 获取 Hono 应用实例
const app = source.getApp();

// 启动服务器（以 Bun 为例）
export default {
  port: 3000,
  fetch: app.fetch,
};
```

### 使用表配置和中间件的完整示例

```typescript
import { createSource } from "unify-api";
import blogConfig from "./blog-config.ts";

// 模拟的认证中间件
const requireAuth = async (c: any, next: () => Promise<void>) => {
  const token = c.req.header("Authorization");
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  // 在实际应用中，这里会验证 token
  await next();
};

const source = createSource();

// 注册基于表配置的数据源（带中间件）
source.register({
  ...blogConfig,
  // 可选：添加中间件
  middleware: [requireAuth],
});

// 注册自定义方法的数据源
source.register({
  id: "github",
  entities: {
    user: {
      findMany: async () => {
        return [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ];
      },
      findOne: async (args: any) => {
        const userId = parseInt(args?.id as string);
        const user = [
          { id: 1, name: "Alice" },
          { id: 2, name: "Bob" },
        ].find((u) => u.id === userId);
        if (!user) {
          throw { status: 404, message: "User not found" };
        }
        return user;
      },
      create: async (args: any) => {
        return { id: 1, name: "Alice" };
      },
    },
  },
});

const app = source.getApp();

console.log("🚀 Server is starting on port 3000...");
console.log(
  app.routes.map((route) => `- ${route.method} ${route.path}`).join("\n")
);

export default {
  port: 3000,
  fetch: app.fetch,
};
```

## API 映射规则

SDK 会自动将实体方法映射为 REST API 端点：

| 方法名 | HTTP 方法 | 路径 | 描述 |
|--------|-----------|------|------|
| `findMany` | GET | `/{entity}?source_id={source_id}` | 查找多个记录 |
| `findOne` | GET | `/{entity}/:id?source_id={source_id}` | 查找单个记录 |
| `create` | POST | `/{entity}?source_id={source_id}` | 创建新记录 |
| `update` | PUT | `/{entity}/:id?source_id={source_id}` | 更新记录 |
| `patch` | PATCH | `/{entity}/:id?source_id={source_id}` | 部分更新记录 |
| `delete` | DELETE | `/{entity}/:id?source_id={source_id}` | 删除记录 |

## 查询参数

支持以下查询参数：

- `limit`: 限制返回记录数量
- `offset`: 跳过指定数量的记录
- `select`: 选择返回的字段，逗号分隔
- `where`: JSON 格式的查询条件
- `order_by`: 排序规则，JSON 格式或 `field:asc/desc` 格式

### 示例请求

```bash
# 获取前10个用户
GET /github/user?limit=10

# 获取指定字段
GET /github/user?select=["id","name","email"]

# 按条件查询
GET /github/user?where={"status":"active"}

# 排序
GET /github/user?order_by={"createdAt":"desc"}

# 组合查询
GET /github/user?limit=5&where={"status":"active"}&order_by=name:asc
```

## 中间件支持

可以为整个源或特定路由添加中间件：

```typescript
const requireAuth = async (c, next) => {
  const token = c.req.header('Authorization');
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
};

source.register({
  id: "api",
  entities: {
    // ... 实体配置
  },
  // 应用到所有 /api/* 路由的中间件
  middleware: [requireAuth]
});
```

## 表配置和内置CRUD

支持基于表配置的自动CRUD方法生成。你可以定义表结构，SDK会自动生成对应的数据存储和CRUD操作：

```typescript
import blogConfig from "./blog-config.ts";

source.register({
  ...blogConfig, // 包含表配置的数据源
  middleware: [requireAuth],
});
```

## API 文档

SDK 自动生成 OpenAPI 3.0 格式的 API 文档：

```typescript
const source = createSource();

// 获取 API 文档
const apiDoc = source.getApiDoc();

// 添加文档端点
const app = source.getApp();
app.get('/api-doc', (c) => c.json(apiDoc));
```

## 内置路由

SDK 默认会自动添加以下内置路由：

- `GET /` - 返回 API 服务器信息和所有可用路由列表
- `GET /api-doc` - 返回 OpenAPI 3.0 格式的 API 文档

### 配置内置路由

可以通过配置选项控制内置路由的行为：

```typescript
// 使用默认内置路由
const source = createSource({
  id: "api",
  entities: { /* ... */ }
});

// 自定义根路径信息
const sourceWithCustomMessage = createSource(
  {
    enableBuiltinRoutes: true,
    rootMessage: "My Custom API Server"
  }
);
sourceWithCustomMessage.register({
  id: "api", 
  entities: { /* ... */ }
})

// 完全禁用内置路由
const sourceWithoutBuiltins = createSource(
  {
    enableBuiltinRoutes: false
  }
);
sourceWithoutBuiltins.register( {
  id: "api",
  entities: { /* ... */ }
})

// 禁用后可以添加自定义路由
```

## CLI 工具

unify-api 提供了 CLI 工具用于预先初始化表结构和生成内置方法，提高运行时性能。

详细的 CLI 使用说明请参考 [CLI-README.md](./CLI-README.md)。

## 示例

更多使用示例请查看 [examples](./examples/) 目录，包括：

- `blog-server.ts` - 完整的博客系统API服务器示例
- `basic-usage.ts` - 基本使用方法
- `builtin-routes.ts` - 内置路由功能
- `blog-config.ts` - 博客系统的表配置

## 运行示例

```bash
cd examples
bun install
bun run blog-server  # 运行 blog-server.ts 示例
```

## License

MIT 