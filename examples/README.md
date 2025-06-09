# Unify Server Examples

本目录包含了 unify-api 的使用示例，展示了如何使用不同功能构建REST API服务器。

## 安装

在运行示例之前，需要先安装依赖：

```bash
npm install
# 或
yarn install
# 或
pnpm install
# 或
bun install
```

## 示例文件说明

### 完整示例

#### `blog-server.ts` - 博客系统API服务器 (推荐)
这是最完整的示例，展示了如何构建一个带认证的博客系统API服务器：

**特性：**
- 使用表配置自动生成CRUD方法
- 认证中间件集成
- 多数据源支持（blog + github）
- 完整的API端点列表输出

**可用端点：**
- `GET /user?sourceId=blog` - 获取用户列表
- `GET /user/:id?sourceId=blog` - 获取指定用户
- `POST /user?sourceId=blog` - 创建用户（需要认证）
- `PUT /user/:id?sourceId=blog` - 更新用户（需要认证）
- `DELETE /user/:id?sourceId=blog` - 删除用户（需要认证）
- `GET /post?sourceId=blog` - 获取发布的文章列表
- `GET /post/:id?sourceId=blog` - 获取指定文章
- `POST /post?sourceId=blog` - 创建文章（需要认证）
- `PUT /post/:id?sourceId=blog` - 更新文章（需要认证）
- `DELETE /post/:id?sourceId=blog` - 删除文章（需要认证）
- `GET /comment?sourceId=blog` - 获取评论列表
- `POST /comment?sourceId=blog` - 创建评论（需要认证）
- `GET /user?sourceId=test-api` - 获取test-api的用户列表
- `GET /user/:id?sourceId=test-api` - 获取指定test-api的用户
- `POST /user?sourceId=test-api` - 创建test-api的用户

### 基础示例

#### `basic-usage.ts` - 基本使用示例
展示unify-api的基本使用方法，包括：
- 创建简单的REST API
- 基本的CRUD操作
- 自定义方法实现

#### `builtin-routes.ts` - 内置路由示例
展示内置路由功能，包括：
- 自动生成的API文档
- 根路径信息展示
- 内置路由配置选项

### 配置文件示例

#### `blog-config.ts` - 博客系统配置
完整的博客系统表配置，包含：
- 用户表（users）
- 文章表（posts）
- 评论表（comments）
- 字段约束和关系定义
- 自定义业务逻辑

## 运行示例

### 运行博客服务器示例 (推荐)

```bash
# 运行完整的博客API服务器
npm run dev

# 或者直接运行
bun run blog-server.ts
```

服务器启动后，你可以：

1. **访问根路径**：`http://localhost:3000/`
   - 查看所有可用的API端点

2. **测试API端点**：
   ```bash
   # 获取用户列表（无需认证）
   curl http://localhost:3000/github/user
   
   # 获取博客用户（需要认证头）
   curl -H "Authorization: Bearer your-token" http://localhost:3000/blog/user
   
   # 创建新用户（需要认证头）
   curl -X POST -H "Authorization: Bearer your-token" \
        -H "Content-Type: application/json" \
        -d '{"name":"Alice","email":"alice@example.com"}' \
        http://localhost:3000/blog/user
   ```

3. **访问API文档**：`http://localhost:3000/api-doc`

### 运行其他示例

```bash
# 基本使用示例
npm run basic

# 内置路由示例
npm run builtin-routes

# 表配置示例
npm run table-config
```

## 认证说明

`blog-server.ts` 示例中包含了一个简单的认证中间件。要访问 `/blog/*` 端点，需要在请求头中包含 `Authorization` 字段：

```bash
# 正确的请求
curl -H "Authorization: Bearer any-token" http://localhost:3000/blog/user

# 错误的请求（会返回401）
curl http://localhost:3000/blog/user
```

## 自定义配置

### 修改端口

在相应的示例文件中修改端口配置：

```typescript
export default {
  port: 3001, // 修改为你想要的端口
  fetch: app.fetch,
};
```

### 修改认证逻辑

在 `blog-server.ts` 中修改 `requireAuth` 中间件：

```typescript
const requireAuth = async (c: any, next: () => Promise<void>) => {
  const token = c.req.header("Authorization");
  
  // 这里可以添加真实的token验证逻辑
  if (!token || !isValidToken(token)) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  await next();
};
```

### 添加新的数据源

你可以在 `blog-server.ts` 中添加更多数据源：

```typescript
source.register({
  id: "my-api",
  entities: {
    product: {
      findMany: async () => {
        return [/* your products */];
      },
      // ... 其他方法
    },
  },
});
```

## 开发提示

1. **热重载**：使用 `bun --watch` 或 `nodemon` 实现热重载
2. **调试**：在代码中添加 `console.log` 或使用调试器
3. **测试**：使用 `curl`、Postman 或其他HTTP客户端测试API
4. **数据持久化**：示例使用JSON文件存储，生产环境建议使用真实数据库

## 注意事项

- 确保已经安装了 unify-api 包
- TypeScript 示例需要 Bun 或 ts-node 支持
- 示例中的认证是模拟的，生产环境需要实现真实的认证逻辑
- 数据存储使用JSON文件，重启服务器后数据会重置 