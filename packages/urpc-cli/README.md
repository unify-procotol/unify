# URPC CLI

A beautiful CLI tool for creating URPC projects with ease.

## Features

- 🎨 **Beautiful Interface** - Colorful and interactive CLI experience
- 🚀 **Multiple Templates** - Choose from Hono, Next.js App Router, or Next.js Pages Router
- 📦 **Auto Download** - Downloads templates directly from GitHub
- 🔧 **Auto Setup** - Automatically installs dependencies and starts dev server
- 🎯 **Studio Integration** - Automatically opens URPC Studio in your browser
- 📱 **Smart Port Detection** - Finds available ports automatically

## Installation

```bash
# Install globally
npm install -g @unify/urpc-cli

# Or use npx (no installation required)
npx @unify/urpc-cli create my-project
```

## Usage

```bash
# Create a new project
urpc-cli create my-awesome-project

# Or with npx
npx @unify/urpc-cli create my-awesome-project
```

## Available Templates

### 1. Hono Basic
- **Description**: A basic Hono server with URPC integration
- **Perfect for**: API servers, microservices, serverless functions
- **Features**: Fast, lightweight, TypeScript support

### 2. Next.js App Router
- **Description**: Next.js 13+ with App Router and URPC
- **Perfect for**: Full-stack applications, modern web apps
- **Features**: App Router, TypeScript, Tailwind CSS

### 3. Next.js Pages Router
- **Description**: Next.js with Pages Router and URPC
- **Perfect for**: Traditional Next.js applications
- **Features**: Pages Router, TypeScript, Tailwind CSS

## What happens when you create a project?

1. 📋 **Template Selection** - Choose your preferred template
2. 📥 **Download** - Downloads the template from GitHub
3. 🔧 **Configuration** - Updates project name and configuration
4. 📦 **Dependencies** - Installs all required packages
5. 🚀 **Dev Server** - Starts the development server
6. 🎨 **Studio** - Opens URPC Studio in your browser

## Development

```bash
# Clone the repository
git clone https://github.com/unify-procotol/unify.git
cd unify/packages/urpc-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
npm link

# Test the CLI
urpc-cli create test-project
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT License - see the [LICENSE](../../LICENSE.md) file for details.

## Support

- 📚 [Documentation](https://docs.urpc.io)
- 💬 [Discord Community](https://discord.gg/urpc)
- 🐛 [Report Issues](https://github.com/unify-procotol/unify/issues)
- 💡 [Feature Requests](https://github.com/unify-procotol/unify/discussions)

---

Made with ❤️ by the Unify Team 