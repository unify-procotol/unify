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

const source = createSource();

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

source.register({
  id: "test",
  entities: {
    user: {
      findMany: async (args) => {
        const { where, select } = args || {};
        let result: any[] = [];
        if (where) {
          // result = users.filter((u) => u.id === where.id);
          result = users.filter((record) =>
            Object.entries(where).every(([key, value]) => record[key] === value)
          );
        } else {
          result = users;
        }
        if (select) {
          result = result.map((u) => select.map((field) => u[field]));
        }
        return result;
      },
      findOne: async (args) => {
        const { where, select } = args || {};
        let result: any = {};
        if (where) {
          result = users.find((record) =>
            Object.entries(where).every(([key, value]) => record[key] === value)
          );
        } else {
          result = users[0];
        }
        if (select) {
          result = select.map((field) => result[field]);
        }
        return result;
      },
      create: async (args) => {
        const { data } = args || {};
        const newUser = {
          id: users.length + 1,
          name: data?.name as string,
        };
        users.push(newUser);
        return newUser;
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

## API 映射规则

SDK 会自动将实体方法映射为 REST API 端点：

| 方法名 | HTTP 方法 | 路径 | 描述 |
|--------|-----------|------|------|
| `findMany` | GET | `/{entity}/list?source_id={source_id}` | 查找多个记录 |
| `findOne` | GET | `/{entity}/find_one?source_id={source_id}` | 查找单个记录 |
| `create` | POST | `/{entity}/create?source_id={source_id}` | 创建新记录 |
| `update` | PATCH | `/{entity}/update?source_id={source_id}` | 更新记录 |
| `delete` | DELETE | `/{entity}/delete?source_id={source_id}` | 删除记录 |

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
GET /user/list?source_id=test&limit=10

# 获取指定字段
GET /user/list?source_id=test&select=["name"]

# 按条件查询
GET /user/list?source_id=test&where={"id":1}

# 排序
GET /user/list?source_id=test&order_by={"id":"desc"}
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

## License

MIT 