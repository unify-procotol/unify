# Unify Server

A Hono-based SDK that maps entity configurations to REST API endpoints

## 特性

- 🚀 基于 [Hono](https://hono.dev/) 高性能 Web 框架
- 📦 自动将实体方法映射为 REST API 端点
- 🔧 支持查询参数（limit, offset, select, where, order_by）
- 🛡️ 内置错误处理和响应标准化
- 📚 自动生成 OpenAPI 文档
- 🔌 支持自定义中间件
- 💪 完整的 TypeScript 支持

## 安装

```bash
npm install unify-server
```

## 快速开始

```typescript
import { createSource } from 'unify-server';

// 创建源配置
const source = createSource({
  id: "github",
  entities: {
    user: {
      // GET /github/user
      findMany: async (args) => {
        // 实现查找多个用户的逻辑
        return users.filter(user => {
          // 支持 where 查询
          if (args?.where) {
            return Object.entries(args.where).every(([key, value]) => 
              user[key] === value
            );
          }
          return true;
        }).slice(0, args?.limit || 10);
      },
      
      // GET /github/user/:id
      findOne: async (args) => {
        const userId = parseInt(args?.id as string);
        const user = users.find(u => u.id === userId);
        if (!user) {
          throw { status: 404, message: 'User not found' };
        }
        return user;
      },
      
      // POST /github/user
      create: async (args) => {
        const newUser = {
          id: Date.now(),
          name: args?.name,
          email: args?.email
        };
        users.push(newUser);
        return newUser;
      }
    }
  }
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
| `findMany` | GET | `/{sourceId}/{entity}` | 查找多个记录 |
| `findOne` | GET | `/{sourceId}/{entity}/:id` | 查找单个记录 |
| `create` | POST | `/{sourceId}/{entity}` | 创建新记录 |
| `update` | PUT | `/{sourceId}/{entity}/:id` | 更新记录 |
| `patch` | PATCH | `/{sourceId}/{entity}/:id` | 部分更新记录 |
| `delete` | DELETE | `/{sourceId}/{entity}/:id` | 删除记录 |

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
GET /github/user?select=id,name,email

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

const source = createSource({
  id: "api",
  entities: {
    // ... 实体配置
  },
  // 应用到所有 /api/* 路由的中间件
  middleware: [requireAuth]
});
```

## API 文档

SDK 自动生成 OpenAPI 3.0 格式的 API 文档：

```typescript
const source = createSource({...});

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
    id: "api", 
    entities: { /* ... */ }
  },
  {
    enableBuiltinRoutes: true,
    rootMessage: "My Custom API Server"
  }
);

// 完全禁用内置路由
const sourceWithoutBuiltins = createSource(
  {
    id: "api",
    entities: { /* ... */ }
  },
  {
    enableBuiltinRoutes: false
  }
);

// 禁用后可以添加自定义路由
const app = sourceWithoutBuiltins.getApp();
app.get('/', (c) => c.json({ message: 'Custom root endpoint' }));
```

### 内置路由响应示例

访问根路径 `GET /` 的响应：

```json
{
  "message": "REST API Server",
  "routes": [
    "GET /api/user",
    "GET /api/user/:id", 
    "POST /api/user"
  ],
  "apiDoc": "/api-doc"
}
```

## 高级用法

### 自定义错误处理

```typescript
const user = {
  findOne: async (args) => {
    const user = await db.user.findById(args?.id);
    if (!user) {
      // 抛出带状态码的错误
      throw { 
        status: 404, 
        message: 'User not found',
        name: 'NotFoundError'
      };
    }
    return user;
  }
}
```

### 访问 Hono Context

实体方法的第二个参数是 Hono 的 Context 对象：

```typescript
const user = {
  create: async (args, context) => {
    // 获取请求头
    const userAgent = context.req.header('User-Agent');
    
    // 获取IP地址
    const ip = context.req.header('X-Forwarded-For') || 'unknown';
    
    const newUser = {
      ...args,
      createdAt: new Date(),
      createdBy: ip
    };
    
    return await db.user.create(newUser);
  }
}
```

### 多个源

可以注册多个源到同一个应用：

```typescript
import { RestMapper } from 'unify-server';

const mapper = new RestMapper();

// 注册 GitHub 源
mapper.register({
  id: "github",
  entities: { /* GitHub 实体 */ }
});

// 注册 GitLab 源  
mapper.register({
  id: "gitlab",
  entities: { /* GitLab 实体 */ }
});

const app = mapper.getApp();
```

## 类型安全

SDK 提供完整的 TypeScript 类型支持：

```typescript
import { SourceConfig, QueryArgs, EntityMethod } from 'unify-server';

const userMethods: EntityMethod = async (args: QueryArgs) => {
  // args 有完整的类型提示
  return {};
};

const config: SourceConfig = {
  id: "api",
  entities: {
    user: {
      findMany: userMethods
    }
  }
};
```

## CLI 工具

Unify Server 提供了强大的CLI工具，用于预先初始化表结构和生成内置方法，提高运行时性能。

### 安装和使用

```bash
# 全局安装
npm install -g unify-server

# 或在项目中使用
npx unify-server --help
```

### 配置文件格式

CLI工具支持两种配置文件格式：

#### 1. JSON格式 (config.json)
```json
{
  "id": "blog",
  "entities": {
    "user": {
      "table": {
        "name": "users",
        "schema": "public",
        "columns": {
          "id": {
            "type": "integer",
            "nullable": false,
            "unique": true,
            "default": "auto_increment"
          },
          "name": {
            "type": "varchar",
            "nullable": false
          }
        }
      }
    }
  }
}
```

#### 2. TypeScript格式 (config.ts)
```typescript
import { SourceConfig } from 'unify-server';

export const config: SourceConfig = {
  id: "blog",
  entities: {
    user: {
      table: {
        name: "users",
        schema: "public",
        columns: {
          id: {
            type: "integer",
            nullable: false,
            unique: true,
            default: "auto_increment",
          },
          name: {
            type: "varchar",
            nullable: false,
          }
        }
      }
    }
  }
};
```

**注意**: 使用TypeScript配置文件时，需要确保：
1. 安装了 `ts-node`: `npm install -D ts-node`
2. 或者先编译TypeScript文件为JavaScript
3. 配置对象必须通过以下方式之一导出：
   - `export const config = {...}`
   - `export const sourceConfig = {...}`
   - `export default {...}`

### 主要命令

```bash
# 验证配置文件 (支持 .json, .ts, .js)
unify-server validate-config blog-config.ts

# 初始化表结构
unify-server init-tables blog-config.ts

# 生成TypeScript类型定义
unify-server generate-types blog-config.ts

# 生成方法文档
unify-server generate-methods blog-config.ts

# 一键完整设置（推荐）
unify-server setup blog-config.ts
```

### 预初始化模式

使用CLI预初始化后，可以在运行时跳过初始化步骤：

```typescript
import { RestMapper } from 'unify-server';

// 使用预初始化模式
const mapper = new RestMapper(undefined, {
  skipRuntimeInit: true, // 跳过运行时初始化
  dataDir: './data'
});

mapper.register(config);
```

### 优势

- **性能提升**：避免运行时的表结构初始化开销
- **类型安全**：自动生成TypeScript类型定义
- **开发体验**：提供方法文档和配置验证
- **部署优化**：预构建所需的数据结构
- **灵活配置**：支持JSON和TypeScript两种配置格式

详细的CLI使用说明请参考 [CLI-README.md](./CLI-README.md)。

## License

MIT 