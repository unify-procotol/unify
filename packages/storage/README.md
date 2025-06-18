# @unify/storage

Storage adapters for the Unify framework.

## Installation

```bash
npm install @unify/storage
# or
yarn add @unify/storage
# or
bun add @unify/storage
```

## Usage

### File Storage

```typescript
import { createSource } from "@unify/server";
import { FileStorage, createStoragePlugin } from "@unify/storage";

const fileStoragePlugin = createStoragePlugin(
  "file-storage",
  new FileStorage("./data")
);

const source = createSource({
  options: {
    storage: fileStoragePlugin,
  },
});
```

### PostgreSQL Storage

```typescript
import { createSource } from "@unify/server";
import { PGStorage, createStoragePlugin } from "@unify/storage";

const pgStoragePlugin = createStoragePlugin(
  "pg-storage",
  new PGStorage({
    host: "localhost",
    port: 5432,
    database: "mydb",
    user: "user",
    password: "password",
  })
);

const source = createSource({
  options: {
    storage: pgStoragePlugin,
  },
});
```

### Custom Storage Implementation

You can create your own storage adapter by implementing the `Storage` interface:

```typescript
import { Storage, createStoragePlugin } from "@unify/storage";

class MyCustomStorage implements Storage {
  async create(sourceId: string, tableName: string, args: CreateArgs) {
    // Your implementation
    return {};
  }

  async findMany(sourceId: string, tableName: string, args?: QueryArgs) {
    // Your implementation
    return [];
  }

  async findOne(sourceId: string, tableName: string, args: FindOneArgs) {
    // Your implementation
    return null;
  }

  async update(sourceId: string, tableName: string, args: UpdateArgs) {
    // Your implementation
    return null;
  }

  async delete(sourceId: string, tableName: string, args: DeleteArgs) {
    // Your implementation
    return false;
  }

  async truncate(sourceId: string, tableName: string) {
    // Your implementation
  }

  async tableExists(sourceId: string, tableName: string) {
    // Your implementation
    return true;
  }

  async close?() {
    // Optional cleanup
  }
}

const customPlugin = createStoragePlugin("my-storage", new MyCustomStorage());
```

## API Reference

### Storage Interface

The `Storage` interface defines the contract that all storage adapters must implement:

- `create(sourceId: string, tableName: string, args: CreateArgs): Promise<Record<string, any>>`
- `findMany(sourceId: string, tableName: string, args?: QueryArgs): Promise<Record<string, any>[]>`
- `findOne(sourceId: string, tableName: string, args: FindOneArgs): Promise<Record<string, any> | null>`
- `update(sourceId: string, tableName: string, args: UpdateArgs): Promise<Record<string, any> | null>`
- `delete(sourceId: string, tableName: string, args: DeleteArgs): Promise<boolean>`
- `truncate(sourceId: string, tableName: string): Promise<void>`
- `tableExists(sourceId: string, tableName: string): Promise<boolean>`
- `close?(): Promise<void>` (optional)

### Built-in Storage Adapters

#### FileStorage

Stores data in JSON files on the filesystem.

```typescript
new FileStorage(dataDir?: string = "./data")
```

#### PGStorage

Stores data in a PostgreSQL database.

```typescript
new PGStorage(config: PGStorageConfig)
```

Where `PGStorageConfig` extends the standard `pg.PoolConfig`.

## Migration from Previous Versions

If you were using the built-in storage options in `@unify/server`, you'll need to:

1. Install `@unify/storage`: `npm install @unify/storage`
2. Update your code to use storage plugins:

**Before:**
```typescript
const source = createSource({
  options: {
    storage: {
      type: "file",
      dataDir: "./data"
    }
  }
});
```

**After:**
```typescript
import { FileStorage, createStoragePlugin } from "@unify/storage";

const source = createSource({
  options: {
    storage: createStoragePlugin("file-storage", new FileStorage("./data"))
  }
});
```

## Migrations

The package also includes database migration utilities for PostgreSQL:

```typescript
import { createPgTablesFromConfig, SourceConfig } from "@unify/storage";

const sourceConfigs: SourceConfig[] = [
  {
    id: "blog",
    entities: {
      users: {
        table: {
          name: "users",
          schema: "public",
          columns: {
            id: {
              type: "integer",
              nullable: false,
              unique: true,
              default: "AUTO_INCREMENT",
            },
            email: {
              type: "varchar",
              nullable: false,
              unique: true,
            },
            name: {
              type: "varchar",
              nullable: false,
            },
            created_at: {
              type: "timestamp",
              nullable: false,
              default: "CURRENT_TIMESTAMP",
            },
          },
        },
      },
    },
  },
];

// Run migrations
await createPgTablesFromConfig(sourceConfigs, process.env.DATABASE_URL);
```

### Separate Import for Migrations

You can also import migrations separately:

```typescript
import { createPgTablesFromConfig } from "@unify/storage/migrations";
```

## License

MIT 