# Cloudflare Pages部署指南

## 前置条件

1. 安装Cloudflare CLI工具 (wrangler)
2. 拥有Cloudflare账号
3. 配置好Cloudflare身份验证

## 部署步骤

### 1. 登录Cloudflare
```bash
npx wrangler login
```

### 2. 构建项目
```bash
pnpm run pages:build
```

### 3. 本地预览
```bash
pnpm run preview
```

### 4. 部署到Cloudflare Pages
```bash
pnpm run deploy
```

或使用指定项目名称：
```bash
pnpm run cf:deploy
```

## 配置说明

### 静态导出配置
- 项目配置为静态导出模式 (`output: 'export'`)
- 图片优化已禁用以兼容Cloudflare Pages
- 已移除搜索功能以简化部署

### 构建产物
- 静态文件输出到 `.vercel/output/static/` 目录
- 所有页面都预渲染为静态HTML
- 支持客户端路由

## 环境变量

如果需要环境变量，请在Cloudflare Dashboard中的Pages设置中添加。

## 故障排除

1. 如果构建失败，请检查Next.js版本兼容性
2. 如果部署失败，请确认已正确登录Cloudflare
3. 如果页面加载异常，请检查静态资源路径
4. 如果需要搜索功能，请考虑使用客户端搜索解决方案

## 配置文件

- `wrangler.toml`: Cloudflare Pages配置
- `_headers`: HTTP头配置
- `next.config.mjs`: Next.js静态导出配置 