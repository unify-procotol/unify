# Hono Basic Example - Cloudflare Workers Deployment

This example demonstrates how to deploy a Hono URPC server to Cloudflare Workers.

## Local Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run dev

# Test the client
bun run client
```

## Deployment to Cloudflare Workers

### Prerequisites

1. Install Cloudflare CLI (wrangler)
2. Have a Cloudflare account
3. Configure Cloudflare authentication

### Steps

1. **Login to Cloudflare**
```bash
npx wrangler login
```

2. **Deploy to Cloudflare Workers**
```bash
# Deploy to production
bun run deploy

# Or deploy to development environment
bun run deploy:dev
```

3. **Test locally with Cloudflare Workers runtime**
```bash
bun run preview
```

### Configuration

The `wrangler.toml` file contains the deployment configuration:
- `name`: The name of your Worker (will be part of the URL)
- `compatibility_date`: Cloudflare Workers compatibility date
- `main`: Entry point file (server.ts)

### Live Demo

The example is deployed at: https://hono-basic-example.uni-labs.org

### Features

- User and Post entities with mock data
- CORS enabled for cross-origin requests
- Type-safe API with URPC
- Cloudflare Workers compatible

### File Structure

```
examples/hono-basic/
├── entities/
│   ├── user.ts          # User entity definition
│   └── post.ts          # Post entity definition
├── server.ts            # Main server file
├── client.ts            # Client example
├── package.json         # Dependencies and scripts
├── wrangler.toml        # Cloudflare Workers config
└── README.md           # This file
```

### Notes

- The server uses mock adapters for demonstration
- CORS is enabled for the URPC Studio to connect
- The deployment is serverless and scales automatically
- No database setup required for this example 