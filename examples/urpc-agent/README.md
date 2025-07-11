# URPC Agent - Intelligent Data Operations Assistant

An intelligent data operations assistant built with **Mastra + URPC** that understands natural language and executes corresponding database CRUD operations.

## Features

- **🤖 AI-Powered**: Uses Mastra AI Agent to understand natural language requests
- **🔧 Direct Operations**: Agent directly uses URPC SDK without traditional tools layer
- **📊 Real-time Feedback**: Shows executed URPC code and operation results
- **🎨 Modern UI**: Next.js + Tailwind CSS interface
- **⚡ High Performance**: URPC unified data access layer

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, URPC SDK
- **AI**: Mastra Core, OpenRouter
- **Data**: Memory data storage (Memory Adapter)

## Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Environment Setup

Create a `.env.local` file:

```env
# OpenRouter API Key
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Next.js environment variables
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development mode
NODE_ENV=development
```

## Usage

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start

# Test
npm run test
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Supported Operations

1. **Query**: `Find all users`, `Find user with ID 1`
2. **Create**: `Create a new user named Tom with email tom@example.com`
3. **Update**: `Update user 1's name to "John Smith"`
4. **Delete**: `Delete user with ID 3`

## Project Structure

```
examples/urpc-agent/
├── app/                    # Next.js App Router
│   ├── api/agent/         # Agent API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── core/                  # Core functionality
│   ├── agent.ts          # URPC Agent implementation
│   └── entity-schema-to-markdown.ts  # Schema utilities
├── entities/             # Data entities
│   ├── user.ts           # User entity
│   └── post.ts           # Post entity
├── test/                 # Test files
│   └── agent-test.ts     # Agent tests
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind configuration
└── README.md             # Project documentation
```

## Core Implementation

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

## Example Usage

```
User Input: "Help me view all users"
Agent Understanding: Execute findMany operation to query users
URPC Code: repo({entity: "user", source: "memory"}).findMany()

User Input: "Create a user named Mary"
Agent Understanding: Execute create operation to create user
URPC Code: repo({entity: "user", source: "memory"}).create({data: {...}})
```

## Testing

```bash
npm run test
```

Tests cover:
- User CRUD operations
- Post CRUD operations
- Natural language understanding
- URPC code generation

## Contributing

1. Fork this project
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Mastra](https://mastra.ai) - AI Agent framework
- [URPC](https://urpc.io) - Unified Remote Procedure Call
- [OpenRouter](https://openrouter.ai) - AI model API provider
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - CSS framework

---

**Built with ❤️ by URPC Team** 