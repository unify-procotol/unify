# Unify Server CLI 工具详细说明

## 概述

Unify Server CLI 工具用于预先初始化表结构和生成内置方法，提高运行时性能。现在支持 **JSON** 和 **TypeScript** 两种配置文件格式。

## 安装

```bash
bun install @unifycli
```

## 配置文件格式

### 1. TypeScript 配置文件 (推荐)

TypeScript 配置文件提供更好的类型安全和开发体验：

```typescript
// blog-config.ts
export const config = {
  id: "blog",
  entities: {
    user: {
      table: {
        name: "users",
        schema: "public",
        columns: {
          id: {
            type: "integer" as const,
            nullable: false,
            unique: true,
            default: "AUTO_INCREMENT",
          },
          name: {
            type: "varchar" as const,
            nullable: false,
          },
          email: {
            type: "varchar" as const,
            nullable: false,
            unique: true,
          },
          created_at: {
            type: "timestamp" as const,
            nullable: false,
            default: "NOW()",
          },
        },
      },
    },
    post: {
      table: {
        name: "posts",
        schema: "public",
        columns: {
          id: {
            type: "integer" as const,
            nullable: false,
            unique: true,
            default: "AUTO_INCREMENT",
          },
          title: {
            type: "varchar" as const,
            nullable: false,
          },
          content: {
            type: "text" as const,
            nullable: true,
          },
          author_id: {
            type: "integer" as const,
            nullable: false,
          },
          status: {
            type: "varchar" as const,
            nullable: false,
            default: "draft",
          },
          created_at: {
            type: "timestamp" as const,
            nullable: false,
            default: "NOW()",
          },
        },
      },
      // 自定义业务逻辑
      findMany: async (args: any) => {
        // 只返回已发布的文章
        return storage.findMany("blog", "posts", {
          ...args,
          where: { ...args?.where, status: "published" }
        });
      },
    },
  },
};

export default config;
```

**TypeScript 配置文件要求：**

1. **安装 ts-node**：`npm install -D ts-node`
2. **导出配置对象**，支持以下方式：
   - `export const config = {...}`
   - `export const sourceConfig = {...}`
   - `export default {...}`
3. **避免导入依赖**：配置文件应该是自包含的，不要导入 `@unify` 模块

### 2. JSON 配置文件

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
            "default": "AUTO_INCREMENT"
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

## CLI 命令

### 验证配置文件

```bash
# 验证 TypeScript 配置
@unifycli validate-config blog-config.ts

# 验证 JSON 配置
@unifycli validate-config blog-config.json
```

### 初始化表结构

```bash
@unifycli init-tables blog-config.ts
```

预先创建表结构定义，避免运行时初始化开销。

### 生成 TypeScript 类型定义

```bash
@unifycli generate-types blog-config.ts

# 自定义输出路径
@unifycli generate-types blog-config.ts -o ./types/blog.ts
```

生成的类型文件示例：

```typescript
// Auto-generated types for blog

export interface user {
  id?: number;
  name: string;
  email: string;
  created_at?: Date | string;
}

export interface post {
  id?: number;
  title: string;
  content?: string;
  author_id: number;
  status?: string;
  created_at?: Date | string;
}

export interface comment {
  id?: number;
  content: string;
  post_id: number;
  author_id: number;
  created_at?: Date | string;
}
```

### 生成方法文档

```bash
@unifycli generate-methods blog-config.ts

# 自定义输出路径
@unifycli generate-methods blog-config.ts -o ./docs/methods.json
```

生成包含所有可用内置方法的文档。

### 一键完整设置 (推荐)

```bash
@unifycli setup blog-config.ts
```

执行完整的设置流程：
1. 验证配置文件
2. 初始化表结构
3. 生成方法文档
4. 生成 TypeScript 类型定义

## 高级选项

### 自定义数据目录

```bash
@unifycli init-tables blog-config.ts --data-dir ./custom-data
```

### 自定义输出路径

```bash
@unifycli setup blog-config.ts \
  --methods-output ./docs/api-methods.json \
  --types-output ./types/api-types.ts
```

## 与 createSource 集成

使用 CLI 预初始化的配置文件可以直接在 `createSource` 中使用：

### 基本集成

```typescript
import { createSource } from "@unify/server";
import blogConfig from "./blog-config.ts";

const source = createSource();

// 直接使用CLI预初始化的配置
source.register(blogConfig);

const app = source.getApp();

export default {
  port: 3000,
  fetch: app.fetch,
};
```

### 带中间件的集成

```typescript
import { createSource } from "@unify/server";
import blogConfig from "./blog-config.ts";

// 认证中间件
const requireAuth = async (c: any, next: () => Promise<void>) => {
  const token = c.req.header("Authorization");
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
};

const source = createSource();

// 注册配置时添加中间件
source.register({
  ...blogConfig,
  middleware: [requireAuth],
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

## 实际项目工作流

### 1. 开发阶段

```bash
# 1. 创建配置文件
# 编辑 blog-config.ts

# 2. 验证配置
@unifycli validate-config blog-config.ts

# 3. 初始化开发环境
@unifycli setup blog-config.ts

# 4. 生成类型文件（可选，用于开发时的类型提示）
@unifycli generate-types blog-config.ts -o ./types/blog.ts
```

### 2. 在服务器中使用

```typescript
// blog-server.ts
import { createSource } from "@unify/server";
import blogConfig from "./blog-config.ts";

const source = createSource();
source.register(blogConfig);

// 运行服务器
export default {
  port: 3000,
  fetch: source.getApp().fetch,
};
```

### 3. 部署阶段

```bash
# 预构建优化（可选）
@unifycli setup blog-config.ts --data-dir ./production-data

# 部署应用
npm start
```

## 完整示例参考

查看 `examples/blog-server.ts` 了解如何将 CLI 工具生成的配置文件与 `createSource` 完整集成，包括：

- 表配置和内置CRUD方法
- 认证中间件集成
- 多数据源支持
- API端点列表展示

## 性能优化

使用 CLI 预初始化的优势：

1. **启动速度提升**: 避免运行时表结构初始化
2. **类型安全**: 自动生成的 TypeScript 类型定义
3. **开发体验**: 提前发现配置错误
4. **部署优化**: 预构建所需的数据结构

## 集成到构建流程

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "setup": "@unifycli setup blog-config.ts",
    "validate": "@unifycli validate-config blog-config.ts",
    "build": "npm run setup && tsc"
  }
}
```

这样可以在构建过程中自动执行预初始化。 