# UniRender Storybook

这是一个展示 UniRender 组件各种用法的 Storybook 实现。

## 🚀 快速开始

1. 启动开发服务器：
```bash
cd packages/client/studio
npm run dev
# 或
bun dev
```

2. 在浏览器中访问：
- 主应用：`http://localhost:5173/`
- Storybook：`http://localhost:5173/story`

## 📚 Story 列表

### 用户实体示例
- **User Table** - 基础表格布局展示用户数据
- **User Cards** - 卡片布局展示用户信息
- **User Grid** - 网格布局紧凑显示用户
- **User List** - 列表布局用于用户浏览
- **User Form** - 表单布局详细查看用户
- **User Dashboard** - 仪表盘布局显示用户分析数据

### 产品实体示例
- **Product Table** - 产品目录的表格格式
- **Product Cards** - 产品展示的卡片格式

### 状态示例
- **Loading State** - 加载状态展示
- **Error State** - 错误状态展示
- **Empty State** - 空数据状态展示

## 🎨 特性

### 📱 响应式设计
- 侧边栏可折叠
- 支持移动端浏览
- 自适应布局

### 🛠️ 交互式界面
- 实时切换不同 Story
- 代码预览功能
- 复制代码功能

### 🎯 功能齐全
- 支持所有 UniRender 布局模式
- 自定义字段配置展示
- 不同数据类型渲染

## 💡 使用方法

### 基础用法
```tsx
<UniRender
  entity={userEntity}
  data={userData}
  layout="table"
/>
```

### 高级配置
```tsx
<UniRender
  entity={userEntity}
  data={userData}
  layout="card"
  config={{
    name: { order: 1, label: 'Full Name' },
    email: { 
      order: 2, 
      render: (value) => <a href={`mailto:${value}`}>{value}</a> 
    },
    age: { 
      order: 3, 
      render: (value) => (
        <span className={value >= 18 ? 'text-green-400' : 'text-yellow-400'}>
          {value} {value >= 18 ? '(Adult)' : '(Minor)'}
        </span>
      )
    }
  }}
/>
```

## 🏗️ 添加新的 Story

要添加新的 Story，在 `StoryPage.tsx` 中的 `stories` 数组添加新对象：

```tsx
const stories = [
  // ... 现有 stories
  {
    id: 'new-story',
    title: 'New Story',
    description: 'Description of the new story',
    entity: yourEntity,
    data: yourData,
    layout: 'table' as LayoutType,
    config: yourFieldConfig
  }
];
```

## 🔧 字段配置选项

### 基础选项
- `order`: 字段显示顺序
- `label`: 自定义字段标签
- `hidden`: 隐藏字段
- `width`: 列宽度
- `align`: 文本对齐方式

### 高级选项
- `render`: 自定义渲染函数
- `editable`: 字段是否可编辑
- `required`: 字段是否必填

## 📁 文件结构
```
src/
├── components/
│   ├── UniRender.tsx          # 主组件
│   ├── StoryPage.tsx          # Storybook 页面
│   └── UniRender.example.tsx  # 使用示例
├── Router.tsx                 # 路由组件
└── App.tsx                   # 主应用
```

## 🚀 部署

要部署 Storybook：

1. 构建项目：
```bash
npm run build
```

2. 部署 `dist` 目录到你的静态文件服务器

3. 确保服务器支持客户端路由（SPA）

## 🤝 贡献

欢迎提交 PR 来添加更多 Story 示例或改进现有功能！ 