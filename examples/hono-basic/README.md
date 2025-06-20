# Hono Basic Example

This example demonstrates how to use `@unify/server` and `@unify/client` with Hono to create a simple REST API server and client.

## Features

- 🚀 **Hono-based server** with automatic REST API generation
- 👤 **User entity** with CRUD operations
- 🗄️ **Mock database adapter** for demonstration
- 📡 **Type-safe client** with full TypeScript support
- 🧪 **Comprehensive examples** of all CRUD operations

## Project Structure

```
hono-basic/
├── package.json      # Dependencies and scripts
├── server.ts         # Hono server with Unify integration
├── client.ts         # Client demo showing all operations
└── README.md         # This file
```

## Quick Start

### 1. Install Dependencies

```bash
# From the project root directory
bun install
```

### 2. Start the Server

```bash
cd examples/hono-basic
bun run dev
```

The server will start on `http://localhost:3001` and display available endpoints.

### 3. Test with Client (New Terminal)

```bash
cd examples/hono-basic
bun run client
```

This will run a comprehensive demo of all CRUD operations.

### 4. Manual Testing with curl

You can also test the API manually:

```bash
# Get all users
curl http://localhost:3001/users/list?source=mock

# Get user by ID
curl "http://localhost:3001/users/find_one?source=mock&where=%7B%22id%22%3A%221%22%7D"

# Create a new user
curl -X POST "http://localhost:3001/users/create?source=mock" \
  -H "Content-Type: application/json" \
  -d '{"data":{"name":"New User","email":"new@example.com","age":28}}'

# Update a user
curl -X PATCH "http://localhost:3001/users/update?source=mock" \
  -H "Content-Type: application/json" \
  -d '{"where":{"id":"1"},"data":{"age":26}}'

# Delete a user
curl -X DELETE "http://localhost:3001/users/delete?source=mock" \
  -H "Content-Type: application/json" \
  -d '{"where":{"id":"2"}}'

# Health check
curl http://localhost:3001/health
```

## API Endpoints

The server automatically generates the following REST endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/list` | Find multiple users |
| GET | `/users/find_one` | Find a single user |
| POST | `/users/create` | Create a new user |
| PATCH | `/users/update` | Update an existing user |
| DELETE | `/users/delete` | Delete a user |
| GET | `/health` | Health check |
| GET | `/` | API documentation |

### Query Parameters

All endpoints require a `source` parameter to specify the data adapter:
- `source=mock` - Uses the mock in-memory database

#### List Users (`/users/list`)
- `limit` - Maximum number of results
- `offset` - Number of results to skip
- `where` - JSON filter conditions
- `order_by` - JSON sort specification
- `select` - JSON array of fields to return

Example:
```
/users/list?source=mock&limit=10&where={"age":25}&order_by={"name":"asc"}&select=["name","email"]
```

#### Find One User (`/users/find_one`)
- `where` - JSON filter conditions (required)
- `select` - JSON array of fields to return

Example:
```
/users/find_one?source=mock&where={"id":"1"}&select=["name","email"]
```

## Code Examples

### Server Setup

```typescript
import { createUnifyServer, registerAdapter } from "@unify/server";

// Create server
const app = createUnifyServer();

// Register data adapter
registerAdapter("mock", () => new MockUserAdapter());

// Start server
await startUnifyServer({ port: 3001 });
```

### Client Usage

```typescript
import { UnifyClient } from "@unify/client";

// Initialize client
const client = new UnifyClient({
  baseUrl: "http://localhost:3001"
});

// Create repository
const userRepo = client.createRepositoryProxy<User>("users", "mock");

// Use repository
const users = await userRepo.findMany({ limit: 10 });
const user = await userRepo.findOne({ where: { id: "1" } });
const newUser = await userRepo.create({ data: { name: "John", email: "john@example.com" } });
```

### Alternative: Global Client

```typescript
import { UnifyClient } from "@unify/client";

// Initialize global client
UnifyClient.init({ baseUrl: "http://localhost:3001" });

// Use static Repo method
const userRepo = UnifyClient.Repo<User>("users", "mock");
const users = await userRepo.findMany({});
```

## User Entity

```typescript
interface User extends BaseEntity {
  id: string;
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Data Adapter

The example includes a `MockUserAdapter` that implements the `DataSourceAdapter<User>` interface:

- `findMany(args)` - Find multiple records with filtering, sorting, pagination
- `findOne(args)` - Find a single record
- `create(args)` - Create a new record
- `update(args)` - Update an existing record
- `delete(args)` - Delete a record

## Development

### Available Scripts

```bash
# Start development server
bun run dev

# Start production server
bun run start

# Run client demo
bun run client
```

### Adding New Entities

1. Define your entity interface extending `BaseEntity`
2. Create an adapter implementing `DataSourceAdapter<YourEntity>`
3. Register the adapter with `registerAdapter()`
4. The REST endpoints will be automatically available

### Custom Routes

You can add custom routes to the Hono app:

```typescript
const app = createUnifyServer();

app.get("/custom", (c) => {
  return c.json({ message: "Custom endpoint" });
});
```

## Next Steps

- Try integrating with a real database (PostgreSQL, MongoDB, etc.)
- Add authentication and authorization
- Implement data validation and schemas
- Add error handling and logging
- Deploy to production

## Related Examples

- [Next.js App Router Example](../nextjs-app-router/) - Full-stack Next.js integration
- [Next.js Pages Router Example](../nextjs-pages-router/) - Pages router integration 