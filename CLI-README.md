# Unify Server CLI 工具详细说明

## 概述

Unify Server CLI 工具用于预先初始化表结构和生成内置方法，提高运行时性能。现在支持 **JSON** 和 **TypeScript** 两种配置文件格式。

## 安装

```bash
# 全局安装
npm install -g unify-server

# 或在项目中使用
npx unify-server --help
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
            default: "auto_increment",
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
            default: "now()",
          },
        },
      },
    },
  },
};
```

**TypeScript 配置文件要求：**

1. **安装 ts-node**：`npm install -D ts-node`
2. **导出配置对象**，支持以下方式：
   - `export const config = {...}`
   - `export const sourceConfig = {...}`
   - `export default {...}`
3. **避免导入依赖**：配置文件应该是自包含的，不要导入 `unify-server` 模块

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

## CLI 命令

### 验证配置文件

```bash
# 验证 TypeScript 配置
unify-server validate-config blog-config.ts

# 验证 JSON 配置
unify-server validate-config blog-config.json
```

### 初始化表结构

```bash
unify-server init-tables blog-config.ts
```

预先创建表结构定义，避免运行时初始化开销。

### 生成 TypeScript 类型定义

```bash
unify-server generate-types blog-config.ts

# 自定义输出路径
unify-server generate-types blog-config.ts -o ./types/blog.ts
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
  created_at?: Date | string;
}
```

### 生成方法文档

```bash
unify-server generate-methods blog-config.ts

# 自定义输出路径
unify-server generate-methods blog-config.ts -o ./docs/methods.json
```

生成包含所有可用内置方法的文档。

### 一键完整设置 (推荐)

```bash
unify-server setup blog-config.ts
```

执行完整的设置流程：
1. 验证配置文件
2. 初始化表结构
3. 生成方法文档
4. 生成 TypeScript 类型定义

## 高级选项

### 自定义数据目录

```bash
unify-server init-tables blog-config.ts --data-dir ./custom-data
```

### 自定义输出路径

```bash
unify-server setup blog-config.ts \
  --methods-output ./docs/api-methods.json \
  --types-output ./types/api-types.ts
```

## 预初始化模式

使用 CLI 预初始化后，可以在运行时跳过初始化步骤：

```typescript
import { RestMapper } from 'unify-server';
import { config } from './blog-config';

// 使用预初始化模式
const mapper = new RestMapper(undefined, {
  skipRuntimeInit: true, // 跳过运行时初始化
  dataDir: './data'
});

mapper.register(config);
```

## 故障排除

### TypeScript 配置文件问题

**问题**: `Cannot find module 'unify-server'`

**解决方案**: 
1. 不要在配置文件中导入 `unify-server` 模块
2. 使用本地类型定义或 `as const` 断言

**问题**: `ts-node is not available`

**解决方案**:
```bash
npm install -D ts-node
```

或者编译 TypeScript 文件为 JavaScript：
```bash
tsc blog-config.ts
unify-server setup blog-config.js
```

### 配置导出问题

**问题**: `Could not find config object in TypeScript file`

**解决方案**: 确保正确导出配置对象：

```typescript
// ✅ 正确
export const config = { id: "blog", entities: {...} };

// ✅ 正确
export default { id: "blog", entities: {...} };

// ❌ 错误 - 没有导出配置
const config = { id: "blog", entities: {...} };
```

## 示例配置文件

项目中提供了完整的示例配置文件：

- `examples/blog-config.ts` - 简洁的 TypeScript 配置示例
- `examples/table-config-example.ts` - 包含自定义方法的完整示例

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
    "setup": "unify-server setup blog-config.ts",
    "validate": "unify-server validate-config blog-config.ts",
    "build": "npm run setup && tsc"
  }
}
```

这样可以在构建过程中自动执行预初始化。 