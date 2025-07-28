# React Todo Demo - UniRender Example

这是一个使用 UniRender 和 URPC 构建的 React Todo 应用示例，展示了如何使用不同的布局和数据管理功能。

## 功能特性

- 🎨 **多种布局**: 支持 Table、Card、Form、Grid、List、Dashboard 等多种布局
- ✏️ **可编辑表格**: 支持内联编辑功能
- 📱 **响应式设计**: 适配移动端和桌面端
- 🔄 **实时更新**: 基于 URPC 的数据管理
- 🎯 **状态管理**: 展示 Loading、Error、Empty 状态
- 🛠️ **类型安全**: 完整的 TypeScript 支持

## 技术栈

- **React 18** - 前端框架
- **Vite** - 构建工具
- **TypeScript** - 类型检查
- **UniRender** - 通用渲染组件
- **URPC** - 统一 RPC 框架
- **Tailwind CSS** - 样式框架

## 快速开始

### 1. 安装依赖

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install

# 使用 bun
bun install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 3. 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── components/
│   └── TodoExample.tsx    # Todo 示例组件
├── entities/
│   └── todo.ts           # Todo 实体定义
├── App.tsx               # 主应用组件
├── main.tsx              # 应用入口点
└── App.css               # 样式文件
```

## 布局示例

### 1. Basic Table
基础表格布局，显示待办事项列表和操作按钮。

### 2. Editable Table
可编辑表格，支持内联编辑各个字段。

### 3. Card Layout
卡片式布局，适合展示详细信息。

### 4. Form Layout
表单布局，用于单个项目的详细查看。

### 5. Grid Layout
网格布局，紧凑型显示。

### 6. List Layout
列表布局，带有详细信息。

### 7. Dashboard Layout
仪表板布局，适合数据展示。

### 8. 状态示例
- Loading State - 数据加载状态
- Error State - 错误处理状态
- Empty State - 空数据状态

## 实体定义

Todo 实体包含以下字段：
- `id` - 唯一标识符
- `title` - 标题
- `description` - 描述
- `completed` - 完成状态
- `priority` - 优先级 (low, medium, high)
- `category` - 分类 (personal, work, shopping, etc.)
- `createdAt` - 创建时间
- `updatedAt` - 更新时间
- `dueDate` - 截止日期

## 自定义操作

Todo 实体支持以下自定义操作：
- `toggleComplete()` - 切换完成状态
- `updatePriority(priority)` - 更新优先级
- `setDueDate(date)` - 设置截止日期

## 配置说明

### URPC 配置
```typescript
URPC.init({
  plugins: [TodoPlugin],
  middlewares: [logging()],
  entityConfigs: {
    todo: {
      defaultSource: "mock",
    },
  },
  globalAdapters: [MockAdapter],
});
```

### UniRender 配置
每个布局都有自己的配置，包括：
- 字段定义和标签
- 渲染函数
- 编辑权限
- 操作按钮

## 开发指南

### 添加新字段
1. 在 `src/entities/todo.ts` 中添加新的 `@Fields` 装饰器
2. 在 `TodoExample.tsx` 中更新配置
3. 重新启动开发服务器

### 添加新布局
1. 在 `examples` 对象中添加新的布局配置
2. 更新 `ExampleType` 类型定义
3. 在 `App.tsx` 中添加到示例列表

## 许可证

MIT License 