import * as fs from "fs";
import * as path from "path";
import { PoolManager, GlobalPoolManager } from "./pool-manager";
import { PgAdapter } from "../adapters/pg-adapter";
import { EntityConfig, PoolManagerConfig } from "../type";
import { simplifyEntityName } from "@unilab/urpc-core";

interface TableColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
}

async function getTableColumns(
  poolManager: PoolManager,
  schemaName: string,
  tableName: string
): Promise<TableColumn[]> {
  const query = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position;
    `;

  const result = await poolManager.query(query, [schemaName, tableName]);
  return result.rows;
}

export interface DatabaseTable {
  table_schema: string;
  table_name: string;
}

export const getAllTables = async (
  poolManager: PoolManager
): Promise<DatabaseTable[]> => {
  const query = `
    SELECT 
      table_schema,
      table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
    ORDER BY table_schema, table_name;
  `;

  const result = await poolManager.query(query);
  return result.rows;
};

function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

async function generateEntityFile({
  entityName,
  entityClassName,
  columns,
  requestedFields,
}: {
  entityName: string;
  entityClassName: string;
  columns: TableColumn[];
  requestedFields?: string[];
}): Promise<void> {
  // Write entity file to entities directory
  const entitiesDir = path.join(process.cwd(), "entities");

  // Ensure entities directory exists
  if (!fs.existsSync(entitiesDir)) {
    fs.mkdirSync(entitiesDir, { recursive: true });
  }

  entityName = entityName.charAt(0).toLowerCase() + entityName.slice(1);
  const filePath = path.join(
    entitiesDir,
    `${entityName.replace(/([A-Z])/g, "-$1").toLowerCase()}.ts`
  );

  // Check if entity file already exists
  if (fs.existsSync(filePath)) {
    console.log(`Entity file ${filePath} already exists, skipping generation.`);
    return;
  }

  let entityContent = `import { Fields } from "@unilab/urpc-core";
  
export class ${entityClassName} {
  static displayName = "${entityClassName}";

`;

  // Generate field properties with appropriate decorators
  for (const column of columns) {
    const fieldType = mapPostgresToFieldType(column.data_type);

    if (fieldType != "any" && fieldType != "date") {
      const isOptional = column.is_nullable === "YES";
      const description = `The ${column.column_name} of the ${entityName}`;

      entityContent += `  @Fields.${fieldType}({
    description: "${description}",`;

      if (isOptional) {
        entityContent += `
    optional: true,`;
      }
    }

    if (fieldType === "any") {
      entityContent += `
  ${column.column_name}: any;\n
`;
    } else if (fieldType === "date") {
      entityContent += `
  ${column.column_name}: Date = new Date();\n
`;
    } else {
      entityContent += `
  })
  ${column.column_name} = ${getDefaultValue(column, fieldType)};\n
`;
    }
  }

  entityContent += `}`;

  fs.writeFileSync(filePath, entityContent);
}

function mapPostgresToFieldType(
  pgType: string
): "string" | "number" | "boolean" | "any" | "date" {
  switch (pgType.toLowerCase()) {
    case "integer":
    case "bigint":
    case "smallint":
    case "decimal":
    case "numeric":
    case "real":
    case "double precision":
      return "number";
    case "boolean":
      return "boolean";
    case "json":
    case "jsonb":
      return "any";
    case "date":
      return "date";
    case "timestamp":
    case "timestamp with time zone":
    case "timestamp without time zone":
    case "text":
    case "character varying":
    case "varchar":
    case "character":
    case "char":
    case "uuid":
    default:
      return "string";
  }
}

function getDefaultValue(column: TableColumn, fieldType: string): string {
  switch (fieldType) {
    case "number":
      return "0";
    case "boolean":
      return "false";
    case "date":
      return "new Date()";
    default:
      return '""';
  }
}

export const connect = async ({
  poolConfig,
  whitelist,
  entity,
  needGenerateEntityFile = false,
}: {
  poolConfig: PoolManagerConfig;
  whitelist?: {
    schema: string;
    tables: string[];
  }[];
  entity?: EntityConfig;
  needGenerateEntityFile?: boolean;
}) => {
  // Initialize the global pool manager
  const poolManager = GlobalPoolManager.initialize({
    connectionString: poolConfig?.connectionString,
    host: poolConfig?.host,
    port: poolConfig?.port,
    database: poolConfig?.database,
    user: poolConfig?.user,
    password: poolConfig?.password,
    max: poolConfig?.max || 20,
    min: poolConfig?.min || 2,
    idleTimeoutMillis: poolConfig?.idleTimeoutMillis || 30000,
    connectionTimeoutMillis: poolConfig?.connectionTimeoutMillis || 10000,
    acquireTimeoutMillis: poolConfig?.acquireTimeoutMillis || 10000,
    healthCheckInterval: poolConfig?.healthCheckInterval || 60000,
    enableMonitoring: poolConfig?.enableMonitoring ?? true,
    logLevel: poolConfig?.logLevel || "info",
  });

  const entities: string[] = [];

  let entityConfig = entity;

  // If no entity configuration is provided, automatically use all database views
  if (!entityConfig || Object.keys(entityConfig).length === 0) {
    console.log(
      "No entity configuration provided, auto-generating from database tables..."
    );

    if (whitelist) {
      entityConfig = whitelist.reduce((acc, whitelistItem) => {
        whitelistItem.tables.forEach((table) => {
          const entityName = toCamelCase(table.toLowerCase());
          acc[entityName] = {
            schema: whitelistItem.schema,
            table: table,
          };
        });
        return acc;
      }, {} as EntityConfig);
    } else {
      const tables = await getAllTables(poolManager);
      entityConfig = tables.reduce((acc, table) => {
        const entityName = toCamelCase(table.table_name.toLowerCase());
        acc[entityName] = {
          schema: table.table_schema,
          table: table.table_name,
        };
        return acc;
      }, {} as EntityConfig);
    }

    console.log(`Entities: ${Object.keys(entityConfig).join(", ")}`);
  }

  // Process each entity configuration
  for (const [entityName, config] of Object.entries(entityConfig)) {
    try {
      const entityClassName = `${entityName.charAt(0).toUpperCase()}${entityName
        .replace("Entity", "")
        .slice(1)}Entity`;

      // Generate entity class file only if needGenerateEntityFile is true
      if (needGenerateEntityFile) {
        const columns = await getTableColumns(
          poolManager,
          config.schema,
          config.table
        );

        await generateEntityFile({
          entityName,
          entityClassName,
          columns,
        });
      }

      entities.push(entityClassName);
    } catch (error) {
      console.error(`Error processing entity ${entityName}:`, error);
      // Close the pool manager on error
      await GlobalPoolManager.shutdown();
      throw error;
    }
  }

  // Factory function to return adapter instances
  const factory = (entityClassName: string) => {
    const _entity = Object.keys(entityConfig).reduce((acc, key) => {
      acc[simplifyEntityName(key)] = entityConfig[key];
      return acc;
    }, {} as Record<string, any>);
    const entityName = simplifyEntityName(entityClassName);
    return new PgAdapter(
      poolManager,
      _entity[entityName].table,
      _entity[entityName].schema
    );
  };

  return {
    entities,
    factory,
  };
};
