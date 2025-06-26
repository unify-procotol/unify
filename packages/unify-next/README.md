# @unilab/unify-next

Next.js adapter for Unify, supporting both App Router and Pages Router.

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

For App Router, use `AppUnify` with `NextRequest`:

```typescript
// app/api/[...route]/route.ts
import { NextRequest } from "next/server";
import { AppUnify } from "@unilab/unify-next";

// Initialize with your configuration
AppUnify.init({
  plugins: [
    // your plugins
  ],
  middleware: [
    // your middleware
  ],
});

export async function GET(request: NextRequest, { params }: { params: { route: string[] } }) {
  return AppUnify.handler(request, { params });
}

export async function POST(request: NextRequest, { params }: { params: { route: string[] } }) {
  return AppUnify.handler(request, { params });
}

export async function PATCH(request: NextRequest, { params }: { params: { route: string[] } }) {
  return AppUnify.handler(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: { route: string[] } }) {
  return AppUnify.handler(request, { params });
}
```

### Pages Router (Next.js 12+)

For Pages Router, use `PagesUnify` with `NextApiRequest`:

```typescript
// pages/api/[...unify].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PagesUnify } from "@unilab/unify-next";

// Initialize with your configuration
PagesUnify.init({
  plugins: [
    // your plugins
  ],
  middleware: [
    // your middleware
  ],
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await PagesUnify.handler(req, res);
}
```

Or use the convenience function:

```typescript
// pages/api/[...unify].ts
import { createPagesHandler, PagesUnify } from "@unilab/unify-next";

// Initialize with your configuration
PagesUnify.init({
  plugins: [
    // your plugins
  ],
  middleware: [
    // your middleware
  ],
});

export default createPagesHandler();
```

## API Differences

### App Router (`AppUnify`)
- Uses `NextRequest` and `NextResponse`
- Handler returns `Promise<NextResponse>`
- Route parameters come from the dynamic segment: `{ params: { route: string[] } }`
- Query parameters accessed via `request.url` and `URLSearchParams`

### Pages Router (`PagesUnify`)
- Uses `NextApiRequest` and `NextApiResponse`
- Handler returns `Promise<void>` (writes directly to response)
- Route parameters come from `req.query.unify` or `req.query.route`
- Query parameters accessed via `req.query`

## Configuration

Both handlers support the same configuration interface:

```typescript
interface UnifyConfig {
  plugins?: Plugin[];
  middleware?: Middleware<any>[];
}
```

## Examples

See the `examples/` directory for complete working examples:
- `examples/nextjs-app-router/` - App Router example
- `examples/nextjs-pages-router/` - Pages Router example

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

## Features

- **Type-safe**: Built with TypeScript for better development experience
- **Flexible**: Support for multiple data sources and custom adapters
- **Middleware support**: Add custom logic before/after operations
- **Next.js optimized**: Designed specifically for Next.js applications
- **Plugin system**: Easily extend functionality with plugins

## License

MIT 