# 表配置和内置CRUD方法

## 概述

unify-server 现在支持基于表配置的自动CRUD方法生成。你可以定义表结构，SDK会自动生成对应的数据存储和CRUD操作。

## 主要特性

1. **表配置定义** - 定义表结构和字段约束
2. **文件存储** - 使用JSON文件模拟数据库表
3. **内置CRUD方法** - 自动生成标准的增删改查操作
4. **用户方法优先** - 用户自定义方法优先于内置方法
5. **字段验证** - 基于表配置进行数据验证

## 表配置结构

```typescript
interface EntityConfig {
  table?: {
    name: string;           // 表名
    schema: string;         // 模式名
    columns: {
      [fieldName: string]: {
        type: DatabaseColumnType;       // 字段类型
        nullable?: boolean;  // 是否可为空
        unique?: boolean;    // 是否唯一
        default?: any;       // 默认值
      };
    };
  };
  // 可选的自定义方法
  findMany?: EntityMethod;
  findOne?: EntityMethod;
  create?: EntityMethod;
  update?: EntityMethod;
  delete?: EntityMethod;
}
```

## 使用示例

### 1. 完全使用内置CRUD方法

```typescript
import { createSource } from "unify-server";

const source = createSource({
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
            default: "auto_increment"
          },
          name: {
            type: "varchar",
            nullable: false,
            unique: false,
            default: undefined
          },
          email: {
            type: "varchar",
            nullable: false,
            unique: true,
            default: undefined
          },
          age: {
            type: "integer",
            nullable: true,
            unique: false,
            default: null
          }
        }
      }
      // 没有定义任何方法，将使用内置CRUD
    }
  }
});
```

这将自动生成以下API端点：
- `GET /blog/user` - 查询用户列表
- `GET /blog/user/:id` - 查询单个用户
- `POST /blog/user` - 创建用户
- `PUT /blog/user/:id` - 更新用户
- `DELETE /blog/user/:id` - 删除用户

### 2. 混合使用内置和自定义方法

```typescript
const source = createSource({
  id: "blog",
  entities: {
    post: {
      table: {
        name: "posts",
        schema: "public",
        columns: {
          id: { type: "integer", nullable: false, unique: true, default: "auto_increment" },
          title: { type: "varchar", nullable: false, unique: false, default: undefined },
          content: { type: "text", nullable: true, unique: false, default: null },
          status: { type: "varchar", nullable: false, unique: false, default: "draft" }
        }
      },

      // 自定义create方法，添加业务逻辑
      create: async (args) => {
        if (!args?.title || args.title.trim().length === 0) {
          throw { status: 400, message: "Title is required" };
        }
        
        // 设置默认状态
        const postData = {
          ...args,
          status: args.status || "draft"
        };

        // 调用内置存储方法（需要通过context获取storage实例）
        return storage.create("blog", "posts", postData);
      }

      // findMany, findOne, update, delete 将使用内置实现
    }
  }
});
```

### 3. 完全自定义方法

```typescript
const source = createSource({
  id: "blog",
  entities: {
    comment: {
      table: {
        name: "comments",
        schema: "public",
        columns: {
          id: { type: "integer", nullable: false, unique: true, default: "auto_increment" },
          content: { type: "text", nullable: false, unique: false, default: undefined }
        }
      },

      // 完全自定义所有CRUD方法
      findMany: async (args) => {
        // 自定义查询逻辑
        return [];
      },

      findOne: async (args) => {
        // 自定义单个查询逻辑
        return null;
      },

      create: async (args) => {
        // 自定义创建逻辑
        return { id: Date.now(), ...args };
      },

      update: async (args) => {
        // 自定义更新逻辑
        return { id: args.id, ...args };
      },

      delete: async (args) => {
        // 自定义删除逻辑
        return { success: true };
      }
    }
  }
});
```

## 内置CRUD方法功能

### findMany
- 支持分页：`limit`, `offset`
- 支持过滤：`where`
- 支持排序：`order_by`
- 支持字段选择：`select`

### findOne
- 根据ID查询单条记录
- 记录不存在时返回404错误

### create
- 自动生成ID（如果未提供）
- 自动添加 `created_at` 和 `updated_at` 时间戳
- 基于表配置进行字段验证

### update
- 根据ID更新记录
- 自动更新 `updated_at` 时间戳
- 记录不存在时返回404错误

### delete
- 根据ID删除记录
- 记录不存在时返回404错误

## 字段验证

内置方法会根据表配置进行字段验证：

```typescript
columns: {
  name: {
    type: "varchar",
    nullable: false,    // 必填字段
    unique: false,
    default: undefined  // 没有默认值
  },
  age: {
    type: "integer",
    nullable: true,     // 可选字段
    unique: false,
    default: null       // 有默认值
  }
}
```

- `nullable: false` 且 `default: undefined` 的字段在创建时必须提供
- 验证失败时返回400错误和详细的错误信息

## 数据存储

数据以JSON文件形式存储在 `./data` 目录下：

```
data/
├── sourceId_tableName.json
└── ...
```

每个文件包含：
```json
{
  "records": [
    {
      "id": 1,
      "name": "Test",
      "created_at": "2025-06-04T09:29:07.059Z",
      "updated_at": "2025-06-04T09:29:07.059Z"
    }
  ],
  "autoIncrement": 2
}
```

## 配置选项

```typescript
const source = createSource(config, {
  dataDir: './custom-data',  // 自定义数据存储目录
  enableBuiltinRoutes: true, // 启用内置路由
  rootMessage: "My API"      // 自定义根路径消息
});
```

## API文档

内置的API文档端点会自动包含所有生成的路由：

- `GET /` - API服务器信息和路由列表
- `GET /api-doc` - OpenAPI格式的API文档

## 最佳实践

1. **表设计**：合理设计表结构，明确字段约束
2. **方法优先级**：只在需要特殊业务逻辑时才自定义方法
3. **错误处理**：自定义方法中要正确抛出HTTP错误
4. **数据验证**：利用表配置进行数据验证，减少重复代码
5. **存储访问**：在自定义方法中需要访问存储时，通过context获取storage实例

## 示例项目

查看 `examples/table-config-example.ts` 和 `test-table-config.js` 了解完整的使用示例。 