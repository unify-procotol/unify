# URPC Agent - Intelligent Data Operations Assistant

An intelligent data operations assistant built with **Mastra + URPC** that can understand natural language and execute corresponding database CRUD operations.

## 🚀 Project Features

- **🤖 Intelligent Understanding**: Uses Mastra AI Agent to understand natural language requests
- **🔧 Direct Operations**: Removes traditional tools layer, Agent directly masters URPC SDK usage
- **📊 Real-time Feedback**: Displays actual executed URPC code and operation results
- **🎨 Modern Interface**: Beautiful interface based on Next.js + Tailwind CSS
- **⚡ High Performance**: Uses URPC unified data access layer for efficient data operations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, URPC SDK
- **AI**: Mastra Core, OpenRouter
- **Data**: Memory data storage (Memory Adapter)
- **Styling**: Tailwind CSS, Lucide Icons

## 📦 Install Dependencies

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

## 🔑 Environment Configuration

Create a `.env.local` file and configure the following environment variables:

```env
# OpenRouter API Key
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Next.js environment variables
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development mode
NODE_ENV=development
```

## 🚀 Start Project

```bash
# Development mode
npm run dev

# Build project
npm run build

# Start production environment
npm run start

# Run tests
npm run test
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Feature Demo

### Supported Operation Types

1. **Query Operations (READ)**
   - `Find all users`
   - `Find user with ID 1`
   - `Show information for user John`

2. **Create Operations (CREATE)**
   - `Create a new user named Tom with email tom@example.com`
   - `Add a post with title "Test Post" and content "This is test content"`

3. **Update Operations (UPDATE)**
   - `Update user 1's name to "John Smith"`
   - `Modify post 2's title to "New Title"`

4. **Delete Operations (DELETE)**
   - `Delete user with ID 3`
   - `Delete post with title "Test Post"`

### Intelligent Understanding Examples

The Agent can understand various natural language expressions:

```
User Input: "Help me view all users"
Agent Understanding: Execute findMany operation to query users
URPC Code: repo({entity: "user", source: "memory"}).findMany()

User Input: "Create a user named Mary"
Agent Understanding: Execute create operation to create user
URPC Code: repo({entity: "user", source: "memory"}).create({data: {...}})
```

## 🏗️ Project Structure

```
dev/urpc-agent/
├── app/                    # Next.js App Router
│   ├── api/agent/         # Agent API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── src/                   # Source code
│   ├── core/             # Core functionality
│   │   └── agent.ts      # URPC Agent core implementation
│   ├── entities/         # Data entities
│   │   ├── user.ts       # User entity
│   │   └── post.ts       # Post entity
│   └── test/             # Test files
│       └── agent-test.ts  # Agent tests
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind configuration
└── README.md             # Project documentation
```

## 🔧 Core Implementation

### URPCAgent Class

```typescript
export class URPCAgent {
  private agent: Agent;

  constructor() {
    this.agent = new Agent({
      name: "URPC Intelligent Data Assistant",
      description: "URPC-based intelligent data operations assistant",
      instructions: this.generateInstructions(),
      model: openrouter("gpt-4o-mini"),
    });
  }

  async processRequest(userMessage: string): Promise<any> {
    // Process user request, return structured response
  }
}
```

### Data Entities

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

## 🧪 Testing

Run built-in tests:

```bash
npm run test
```

Tests cover:
- User query, create, update, delete
- Post query, create, update, delete
- Natural language understanding capabilities
- URPC code generation

## 🎨 Interface Features

- **Responsive Design**: Adapts to various device sizes
- **Real-time Chat**: ChatGPT-like conversation interface
- **Code Display**: Real-time display of executed URPC code
- **Data Visualization**: Structured display of operation results
- **Animation Effects**: Smooth interaction animations

## 📚 Technical Highlights

1. **Tool-less Design**: Agent directly understands URPC SDK, no traditional tools needed
2. **Intelligent Code Generation**: Generates accurate URPC operation code from natural language
3. **Real-time Code Display**: Users can see the actual executed code
4. **Unified Data Access**: Uses URPC to unify access to different data sources
5. **Type Safety**: Complete TypeScript type support

## 🤝 Contributing

1. Fork this project
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mastra](https://mastra.ai) - AI Agent framework
- [URPC](https://urpc.io) - Unified Remote Procedure Call
- [OpenRouter](https://openrouter.ai) - AI model API provider
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - CSS framework

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the [Documentation](https://docs.urpc.io)
2. Search [Issues](https://github.com/your-org/urpc-agent/issues)
3. Create a new issue if needed
4. Join our [Discord](https://discord.gg/urpc) community

---

**Built with ❤️ by URPC Team** 