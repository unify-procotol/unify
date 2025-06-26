# @unify/client

Type-safe HTTP client for Unify API that automatically maps entity methods to REST endpoints using Proxy.

## 🎨 Unify Studio

**new feature** now includes a visual database browser like Prisma Studio:

```bash
# start Unify Studio
npx unify-studio
```

Studio provides:
- 🔍 view all entities and adapters
- 📊 browse and display data tables  
- 🎨 modern UI interface
- ⚡ real-time data loading

Detailed information please refer to [Studio documentation](./studio/README.md).

## Installation

```bash
npm install @unify/client @unify/core
# or
yarn add @unify/client @unify/core
# or
pnpm add @unify/client @unify/core
```

## Quick Start

```typescript
import { UnifyClient } from "@unify/client";
import type { WalletEntity } from "@unify/core";

// 初始化全局客户端（在应用初始化时调用一次）
UnifyClient.init({
  baseUrl: "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Authorization": "Bearer your-token-here",
  },
});

// 在应用的任何地方使用
const wallets = await UnifyClient.Repo<WalletEntity>("wallet", "evm").findMany({ 
  limit: 2,
  where: { network: "ethereum" },
  select: ["address", "balance"],
  order_by: { balance: "desc" }
});
```

## API Reference

### Client Configuration

```typescript
interface ClientConfig {
  baseUrl: string;           // API base URL
  timeout?: number;          // Request timeout in ms (default: 5000)
  headers?: Record<string, string>; // Default headers
}
```

### Initialize Global Client

```typescript
import { UnifyClient } from "@unify/client";

UnifyClient.init({
  baseUrl: "https://api.example.com",
  timeout: 10000,
  headers: {
    "Authorization": "Bearer your-api-token",
    "X-App-Version": "1.0.0",
  },
});
```

### Repository Methods

All repository methods are automatically mapped to HTTP endpoints:

| Method | HTTP Method | Endpoint | Description |
|--------|-------------|----------|-------------|
| `findMany(args)` | GET | `/{entity}/list?source={source}` | Find multiple records |
| `findOne(args)` | GET | `/{entity}/find_one?source={source}` | Find single record |
| `create(args)` | POST | `/{entity}/create?source={source}` | Create new record |
| `update(args)` | PATCH | `/{entity}/update?source={source}` | Update record |
| `delete(args)` | DELETE | `/{entity}/delete?source={source}` | Delete record |

### Query Parameters

All endpoints support these query parameters:

- `where`: Filter conditions (JSON object)
- `select`: Select specific fields (array of strings)  
- `order_by`: Sort results (JSON object with field:asc/desc)
- `limit`: Limit number of results
- `offset`: Skip number of results

## Usage Examples

### Find Many

```typescript
import { UnifyClient } from "@unify/client";
import type { WalletEntity } from "@unify/core";

const wallets = await UnifyClient.Repo<WalletEntity>("wallet", "evm").findMany({
  limit: 10,
  offset: 0,
  where: { network: "ethereum" },
  select: ["address", "balance"],
  order_by: { balance: "desc" }
});
```

**HTTP Request:**
```
GET /wallet/list?source=evm&limit=10&offset=0&where={"network":"ethereum"}&select=["address","balance"]&order_by={"balance":"desc"}
```

### Find One

```typescript
const wallet = await UnifyClient.Repo<WalletEntity>("wallet", "evm").findOne({
  where: { address: "0x123..." },
  select: ["address", "balance", "tokens"]
});
```

**HTTP Request:**
```
GET /wallet/find_one?source=evm&where={"address":"0x123..."}&select=["address","balance","tokens"]
```

### Create

```typescript
const newWallet = await UnifyClient.Repo<WalletEntity>("wallet", "evm").create({
  data: {
    address: "0x456...",
    balance: "1000000000000000000",
    network: "ethereum"
  }
});
```

**HTTP Request:**
```
POST /wallet/create?source=evm
Content-Type: application/json

{
  "address": "0x456...",
  "balance": "1000000000000000000", 
  "network": "ethereum"
}
```

### Update

```typescript
const updatedWallet = await UnifyClient.Repo<WalletEntity>("wallet", "evm").update({
  where: { address: "0x456..." },
  data: { balance: "2000000000000000000" }
});
```

**HTTP Request:**
```
PATCH /wallet/update?source=evm
Content-Type: application/json

{
  "where": { "address": "0x456..." },
  "data": { "balance": "2000000000000000000" }
}
```

### Delete

```typescript
const deleted = await UnifyClient.Repo<WalletEntity>("wallet", "evm").delete({
  where: { address: "0x456..." }
});
```

**HTTP Request:**
```
DELETE /wallet/delete?source=evm
Content-Type: application/json

{
  "where": { "address": "0x456..." }
}
```

### Multiple Data Sources

```typescript
// EVM wallets
const evmWallets = await UnifyClient.Repo<WalletEntity>("wallet", "evm").findMany({
  limit: 5,
  where: { network: "ethereum" }
});

// Solana wallets
const solanaWallets = await UnifyClient.Repo<WalletEntity>("wallet", "solana").findMany({
  limit: 5
});
```

## Error Handling

The client throws errors for:
- Network failures
- HTTP errors (4xx, 5xx)
- API errors (success: false in response)
- Timeout errors

```typescript
try {
  const wallets = await UnifyClient.Repo<WalletEntity>("wallet", "evm").findMany({ limit: 10 });
} catch (error) {
  console.error("Request failed:", error.message);
}
```

## TypeScript Support

The client is fully typed and provides:
- Type-safe method calls
- Autocomplete for entity fields
- Compile-time validation of query parameters
- Proper return types for all methods

```typescript
// TypeScript will validate these at compile time
const wallets = await UnifyClient.Repo<WalletEntity>("wallet", "evm").findMany({
  select: ["address", "balance"], // ✅ Valid fields
  where: { network: "ethereum" },  // ✅ Valid field
  order_by: { balance: "desc" }    // ✅ Valid field and direction
});

// TypeScript will catch these errors
const invalid = await UnifyClient.Repo<WalletEntity>("wallet", "evm").findMany({
  select: ["invalid_field"],       // ❌ TypeScript error
  where: { invalid_field: "test" }, // ❌ TypeScript error
  order_by: { balance: "invalid" }  // ❌ TypeScript error
});
``` 