# @unilab/server

A simplified server package for building unified APIs with multiple data source adapters.

## Features

- 🚀 **Simple API**: One-line adapter registration
- 🔌 **Multiple Adapters**: Support for various data sources
- 🎯 **Type Safe**: Full TypeScript support
- 🌐 **Hono Integration**: Built on top of Hono web framework
- 📦 **Modular**: Use with or without custom Hono app

## Installation

```bash
npm install @unilab/server
# For Web3 adapters
npm install @unilab/uniweb3
```

## Quick Start

### Basic Usage

```typescript
import { Unify } from "@unilab/server";
import { SolanaAdapter, EVMAdapter } from "@unilab/uniweb3";

// Initialize Unify (creates internal Hono app)
const app = Unify.init();

// Register adapters and get the server
Unify.register([
  { source: "solana", adapter: new SolanaAdapter() },
  { source: "evm", adapter: new EVMAdapter() }
]);

// Start server
export default {
  port: 3000,
  fetch: app.fetch,
};
```

### With Custom Hono App

```typescript
import { Unify } from "@unilab/server";
import { SolanaAdapter, EVMAdapter } from "@unilab/uniweb3";
import { Hono } from "hono";

// Create custom Hono app
const app = new Hono();

// Add custom routes
app.get("/custom", (c) => {
  return c.json({ message: "Custom endpoint!" });
});

// Initialize Unify with custom app
Unify.init({ app });

// Register adapters
Unify.register([
  { source: "solana", adapter: new SolanaAdapter() },
  { source: "evm", adapter: new EVMAdapter() }
]);

export const GET = app.fetch;
export const POST = app.fetch;
```

### Next.js App Router Example

```typescript
// app/api/[...route]/route.ts
import { Unify } from "@unilab/server";
import { SolanaAdapter, EVMAdapter } from "@unilab/uniweb3";
import { Hono } from "hono";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

Unify.init({ app });

Unify.register([
  { source: "solana", adapter: new SolanaAdapter() },
  { source: "evm", adapter: new EVMAdapter() }
]);

export const GET = app.fetch;
export const POST = app.fetch;
```

## API Reference

### Unify Class

#### `Unify.init(config?: UnifyConfig)`

Initializes Unify with static methods.

**Parameters:**
- `config.app?: Hono` - Optional custom Hono app instance

**Returns:** `Hono` - The Hono app instance

#### `Unify.register(adapters: AdapterRegistration[])`

Registers multiple adapters and sets up routes.

**Parameters:**
- `adapters` - Array of adapter registrations

**Returns:** `Hono` - The Hono app instance

#### `Unify.getApp()`

Gets the current Hono app instance.

**Returns:** `Hono` - The Hono app instance

### Types

```typescript
interface UnifyConfig {
  app?: Hono;
}

interface AdapterRegistration {
  source: string;
  adapter: DataSourceAdapter<any>;
}
```

## Available Endpoints

Once adapters are registered, the following REST endpoints are available:

- `GET /{entity}/list` - Find multiple records
- `GET /{entity}/find_one` - Find single record  
- `POST /{entity}/create` - Create new record
- `PATCH /{entity}/update` - Update existing record
- `DELETE /{entity}/delete` - Delete record
- `GET /health` - Health check

### Query Parameters

- `source` - The adapter source name (required)
- `where` - JSON filter conditions
- `select` - Fields to return
- `limit` - Maximum number of records
- `offset` - Number of records to skip
- `order_by` - Sorting configuration

### Example Requests

```bash
# Get Solana wallet balance
curl "http://localhost:3000/wallet/find_one?source=solana&where={\"address\":\"your_wallet_address\"}"

# Get EVM wallet balance
curl "http://localhost:3000/wallet/find_one?source=evm&where={\"address\":\"your_wallet_address\",\"network\":\"ethereum\"}"

# Health check
curl "http://localhost:3000/health"
```

## Migration Guide

### From Instance-based API

**Before:**
```typescript
import { Unify } from "@unilab/server";
import { SolanaAdapter, EVMAdapter } from "@unilab/uniweb3";

const unify = new Unify();
unify.init({ app });
const server = unify.register([
  { source: "solana", adapter: new SolanaAdapter() },
  { source: "evm", adapter: new EVMAdapter() }
]);
```

**After:**
```typescript
import { Unify } from "@unilab/server";
import { SolanaAdapter, EVMAdapter } from "@unilab/uniweb3";

Unify.init({ app });
Unify.register([
  { source: "solana", adapter: new SolanaAdapter() },
  { source: "evm", adapter: new EVMAdapter() }
]);
```

## License

MIT 