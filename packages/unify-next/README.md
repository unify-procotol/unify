# @unilab/unify-next

A Next.js-based SDK that maps entity configurations to REST API endpoints, built on top of `@unilab/core`.

## Installation

```bash
npm install @unilab/unify-next
# or
pnpm add @unilab/unify-next
# or
bun add @unilab/unify-next
```

## Usage

### App Router (Next.js 13+)

Create a catch-all API route at `src/app/api/[...route]/route.ts`:

```typescript
import { Unify } from "@unilab/unify-next";
import { WalletPlugin } from "@unilab/uniweb3";

// Initialize Unify with your plugins
Unify.init({
  plugins: [WalletPlugin],
});

// Export the handler for different HTTP methods
export async function GET(request: Request, context: { params: { route: string[] } }) {
  return Unify.handler(request, context);
}

export async function POST(request: Request, context: { params: { route: string[] } }) {
  return Unify.handler(request, context);
}

export async function PATCH(request: Request, context: { params: { route: string[] } }) {
  return Unify.handler(request, context);
}

export async function DELETE(request: Request, context: { params: { route: string[] } }) {
  return Unify.handler(request, context);
}
```

### Pages Router (Next.js 12 and below)

Create a catch-all API route at `pages/api/[...route].ts`:

```typescript
import { Unify } from "@unilab/unify-next";
import { WalletPlugin } from "@unilab/uniweb3";
import type { NextApiRequest, NextApiResponse } from "next";

// Initialize Unify with your plugins
Unify.init({
  plugins: [WalletPlugin],
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Convert Next.js API route to our format
  const request = new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: req.headers as any,
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  });

  const route = Array.isArray(req.query.route) ? req.query.route : [req.query.route];
  const response = await Unify.handler(request, { params: { route } });
  
  const data = await response.json();
  res.status(response.status).json(data);
}
```

## API Endpoints

Once configured, your API will automatically provide the following endpoints:

### Find Multiple Records
```
GET /api/{entity}/list?source={source}
```

Parameters:
- `source`: Data source identifier
- `limit`: Maximum number of records to return
- `offset`: Number of records to skip
- `where`: JSON-encoded filter conditions
- `order_by`: JSON-encoded sorting criteria

### Find Single Record
```
GET /api/{entity}/find_one?source={source}&where={conditions}
```

### Create Record
```
POST /api/{entity}/create?source={source}
Content-Type: application/json

{
  "data": {
    // record data
  }
}
```

### Update Record
```
PATCH /api/{entity}/update?source={source}
Content-Type: application/json

{
  "where": {
    // filter conditions
  },
  "data": {
    // updated data
  }
}
```

### Delete Record
```
DELETE /api/{entity}/delete?source={source}&where={conditions}
```

## Configuration

### Plugins

The `Unify.init()` method accepts a configuration object with the following options:

```typescript
interface UnifyConfig {
  plugins?: Plugin[];
  middleware?: Middleware<any>[];
}
```

### Middleware

You can add global middleware that will be applied to all operations:

```typescript
import { Unify } from "@unilab/unify-next";
import { loggingMiddleware } from "@unilab/core/middleware";

Unify.init({
  plugins: [/* your plugins */],
  middleware: [loggingMiddleware],
});
```

## Features

- **Type-safe**: Built with TypeScript for better development experience
- **Flexible**: Support for multiple data sources and custom adapters
- **Middleware support**: Add custom logic before/after operations
- **Next.js optimized**: Designed specifically for Next.js applications
- **Plugin system**: Easily extend functionality with plugins

## License

MIT 