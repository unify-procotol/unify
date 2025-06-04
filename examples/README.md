# Unify Server Examples

本目录包含了 unify-server 的使用示例。

## 安装

在运行示例之前，需要先安装依赖：

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

## 示例文件说明

### TypeScript 示例

- `basic-usage.ts` - 基本使用示例，展示如何创建和使用 REST API
- `table-config-example.ts` - 表配置示例
- `builtin-routes-example.ts` - 内置路由示例
- `blog-config.ts` - 博客系统配置示例
- `table-config.ts` - 详细的表配置示例

### 配置文件

- `table-config-example.json` - JSON 格式的表配置示例

### JavaScript 示例

- `usage-with-cli.js` - 使用 CLI 工具的示例

## 运行示例

### 运行 TypeScript 示例

```bash
# 基本使用示例
npm run dev

# 表配置示例
npm run table-config

# 内置路由示例
npm run builtin-routes

# 博客配置示例
npm run blog-config
```

### 运行 CLI 示例

```bash
npm run cli-usage
```

## 注意事项

- 确保已经安装了 unify-server 包
- TypeScript 示例需要 ts-node 支持
- 部分示例可能需要数据库连接配置 