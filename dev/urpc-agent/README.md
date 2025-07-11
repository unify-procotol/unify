# URPC Agent - 智能数据操作助手

基于 **Mastra + URPC** 构建的智能数据操作助手，能够理解自然语言并执行相应的数据库CRUD操作。

## 🚀 项目特色

- **🤖 智能理解**: 使用 Mastra AI Agent 理解自然语言请求
- **🔧 直接操作**: 移除传统 tools 层，Agent 直接掌握 URPC SDK 使用
- **📊 实时反馈**: 显示实际执行的 URPC 代码和操作结果
- **🎨 现代界面**: 基于 Next.js + Tailwind CSS 的美观界面
- **⚡ 高性能**: 使用 URPC 统一数据访问层，高效处理数据操作

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, Tailwind CSS
- **后端**: Node.js, URPC SDK
- **AI**: Mastra Core, OpenRouter
- **数据**: 内存数据存储 (Memory Adapter)
- **样式**: Tailwind CSS, Lucide Icons

## 📦 安装依赖

```bash
# 安装依赖
npm install
# 或者
yarn install
# 或者
pnpm install
```

## 🔑 环境配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# OpenRouter API密钥
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Next.js环境变量
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 开发模式
NODE_ENV=development
```

## 🚀 启动项目

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 启动生产环境
npm run start

# 运行测试
npm run test
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🎯 功能演示

### 支持的操作类型

1. **查询操作 (READ)**
   - `查找所有用户`
   - `查找ID为1的用户`
   - `显示用户张三的信息`

2. **创建操作 (CREATE)**
   - `创建一个新用户，名字叫小明，邮箱是xiaoming@example.com`
   - `添加一篇文章，标题是"测试文章"，内容是"这是测试内容"`

3. **更新操作 (UPDATE)**
   - `更新用户1的名字为"张三丰"`
   - `修改文章2的标题为"新标题"`

4. **删除操作 (DELETE)**
   - `删除ID为3的用户`
   - `删除标题为"测试文章"的文章`

### 智能理解示例

Agent 能够理解各种自然语言表达：

```
用户输入: "帮我查看所有用户"
Agent理解: 执行 findMany 操作查询用户
URPC代码: repo({entity: "user", source: "memory"}).findMany()

用户输入: "创建一个叫小红的用户"
Agent理解: 执行 create 操作创建用户
URPC代码: repo({entity: "user", source: "memory"}).create({data: {...}})
```

## 🏗️ 项目结构

```
dev/urpc-agent/
├── app/                    # Next.js App Router
│   ├── api/agent/         # Agent API 路由
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── src/                   # 源代码
│   ├── core/             # 核心功能
│   │   └── agent.ts      # URPC Agent 核心实现
│   ├── entities/         # 数据实体
│   │   ├── user.ts       # 用户实体
│   │   └── post.ts       # 文章实体
│   └── test/             # 测试文件
│       └── agent-test.ts  # Agent 测试
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── tailwind.config.js    # Tailwind 配置
└── README.md             # 项目说明
```

## 🔧 核心实现

### URPCAgent 类

```typescript
export class URPCAgent {
  private agent: Agent;

  constructor() {
    this.agent = new Agent({
      name: "URPC智能数据助手",
      description: "基于URPC的智能数据操作助手",
      instructions: this.generateInstructions(),
      model: openrouter("gpt-4o-mini"),
    });
  }

  async processRequest(userMessage: string): Promise<any> {
    // 处理用户请求，返回结构化响应
  }
}
```

### 数据实体

```typescript
export class UserEntity {
  @Fields.string() id = "";
  @Fields.string() name = "";
  @Fields.string() email = "";
  @Fields.string() avatar = "";
  @Fields.array(() => PostEntity, { optional: true }) posts?: PostEntity[];
}

export class PostEntity {
  @Fields.string() id = "";
  @Fields.string() title = "";
  @Fields.string() content = "";
  @Fields.string() userId = "";
  @Fields.record(() => UserEntity, { optional: true }) user?: UserEntity;
}
```

## 🧪 测试

运行内置测试：

```bash
npm run test
```

测试涵盖：
- 用户查询、创建、更新、删除
- 文章查询、创建、更新、删除
- 自然语言理解能力
- URPC 代码生成

## 🎨 界面特色

- **响应式设计**: 适配各种设备尺寸
- **实时聊天**: 类似ChatGPT的对话界面
- **代码展示**: 实时显示执行的URPC代码
- **数据可视化**: 结构化显示操作结果
- **动画效果**: 平滑的交互动画

## 📚 技术亮点

1. **无工具层设计**: Agent直接理解URPC SDK，无需传统tools
2. **智能代码生成**: 从自然语言生成准确的URPC操作代码
3. **实时代码展示**: 用户可以看到实际执行的代码
4. **统一数据访问**: 使用URPC统一不同数据源的访问方式
5. **类型安全**: 完整的TypeScript类型支持

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'feat: add amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Mastra](https://github.com/mastra-ai/mastra) - 强大的AI Agent框架
- [URPC](https://github.com/unifi-lab/unify) - 统一数据访问层
- [Next.js](https://nextjs.org) - 现代React框架
- [Tailwind CSS](https://tailwindcss.com) - 原子化CSS框架

---

**🎯 立即体验**: 运行项目并开始与智能数据助手对话吧！ 