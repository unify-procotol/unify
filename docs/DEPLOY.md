# Cloudflare Pages部署指南

## 前置条件

1. 安装Cloudflare CLI工具 (wrangler)
2. 拥有Cloudflare账号
3. 配置好Cloudflare身份验证

## 部署步骤

### 文档站点部署

#### 1. 登录Cloudflare
```bash
npx wrangler login
```

#### 2. 构建项目
```bash
pnpm run pages:build
```

#### 3. 本地预览
```bash
pnpm run preview
```

#### 4. 部署到Cloudflare Pages
```bash
pnpm run deploy
```

或使用指定项目名称：
```bash
pnpm run cf:deploy
```

### Storybook部署

#### 1. 构建Storybook
```bash
pnpm run storybook:build
```

#### 2. 本地预览Storybook
```bash
pnpm run storybook:preview
```

#### 3. 部署Storybook到Cloudflare Pages
```bash
pnpm run storybook:deploy
```

或使用指定项目名称：
```bash
pnpm run storybook:cf:deploy
```

## 配置说明

### 文档站点配置
- 项目配置为静态导出模式 (`output: 'export'`)
- 图片优化已禁用以兼容Cloudflare Pages
- 已移除搜索功能以简化部署

### Storybook配置
- 直接部署 `storybook-static/` 目录
- 配置了合适的缓存策略和安全头
- 无需额外的wrangler配置文件

### 构建产物
- 文档站点：`.vercel/output/static/` 目录
- Storybook：`storybook-static/` 目录
- 所有页面都预渲染为静态HTML
- 支持客户端路由

## 同时部署两个项目

### 使用一键部署脚本
```bash
./deploy-all.sh
```

### 手动部署
```bash
# 部署文档站点
pnpm run cf:deploy

# 部署Storybook
pnpm run storybook:cf:deploy
```

## 环境变量

如果需要环境变量，请在Cloudflare Dashboard中的Pages设置中添加。

## 故障排除

1. **构建失败**：请检查Next.js版本兼容性
2. **部署失败**：请确认已正确登录Cloudflare
3. **页面加载异常**：请检查静态资源路径
4. **需要搜索功能**：请考虑使用客户端搜索解决方案
5. **Storybook构建失败**：请检查addon版本兼容性
6. **预览命令错误**：确保使用正确的命令格式，避免使用不支持的参数

## 配置文件

### 文档站点
- `wrangler.toml`: Cloudflare Pages配置
- `_headers`: HTTP头配置
- `next.config.mjs`: Next.js静态导出配置

### Storybook
- `storybook-static/_headers`: Storybook HTTP头配置
- `.storybook/main.ts`: Storybook主配置

## 访问部署的站点

部署成功后，你将得到两个URL：
- 文档站点：`https://unify-docs.pages.dev`
- Storybook：`https://unify-storybook.pages.dev`

你也可以在Cloudflare Dashboard的Pages部分查看和管理这些部署。

## 命令参考

### 文档站点
```bash
pnpm run build              # 构建Next.js应用
pnpm run pages:build        # 构建Cloudflare Pages
pnpm run preview            # 本地预览
pnpm run deploy             # 部署
pnpm run cf:deploy          # 部署到指定项目
```

### Storybook
```bash
pnpm run storybook:build    # 构建Storybook
pnpm run storybook:preview  # 本地预览
pnpm run storybook:deploy   # 部署
pnpm run storybook:cf:deploy # 部署到指定项目
``` 