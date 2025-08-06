import * as fs from "fs";
import * as path from "path";
import { PoolManager, GlobalPoolManager } from "./pool-manager";
import { PgAdapter } from "../adapters/pg-adapter";
import { PoolManagerConfig } from "../type";
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

  const filePath = path.join(
    entitiesDir,
    `${entityName.replace(/([A-Z])/g, "-$1").toLowerCase()}.ts`
  );

  // Check if entity file already exists
  if (fs.existsSync(filePath)) {
    console.log(`Entity file ${filePath} already exists, skipping generation.`);
    return;
  }

  // Filter columns based on requested fields if provided
  const filteredColumns = requestedFields
    ? columns.filter((col) => requestedFields.includes(col.column_name))
    : columns;

  let entityContent = `import { Fields } from "@unilab/urpc-core";
  
export class ${entityClassName} {
  static displayName = "${entityClassName}";

`;

  // Generate field properties with appropriate decorators
  for (const column of filteredColumns) {
    const fieldType = mapPostgresToFieldType(column.data_type);

    if (fieldType != "any") {
      const isOptional = column.is_nullable === "YES";
      const description = `The ${column.column_name} of the ${entityName}`;

      entityContent += `  @Fields.${fieldType}({
    description: "${description}",`;

      if (isOptional) {
        entityContent += `
    optional: true,`;
      }
    }

    entityContent += `
  ${
    fieldType === "any"
      ? `${column.column_name}: any`
      : `})
  ${column.column_name} = ${getDefaultValue(column, fieldType)};`
  }
  
`;
  }

  entityContent += `}`;

  fs.writeFileSync(filePath, entityContent);
}

function mapPostgresToFieldType(
  pgType: string
): "string" | "number" | "boolean" | "any" {
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
  entity,
  needGenerateEntityFile = false,
}: {
  poolConfig: PoolManagerConfig;
  entity: {
    [key: string]: {
      schema: string;
      table: string;
      fields: string[];
    };
  };
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

  // Process each entity configuration
  for (const [entityName, config] of Object.entries(entity)) {
    try {
      // Get table structure from database
      const columns = await getTableColumns(
        poolManager,
        config.schema,
        config.table
      );

      const entityClassName = `${entityName
        .charAt(0)
        .toUpperCase()}${entityName.slice(1)}Entity`;

      // Generate entity class file only if needGenerateEntityFile is true
      if (needGenerateEntityFile) {
        await generateEntityFile({
          entityName,
          entityClassName,
          columns,
          requestedFields: config.fields,
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
    const _entity = Object.keys(entity).reduce((acc, key) => {
      acc[simplifyEntityName(key)] = entity[key];
      return acc;
    }, {} as Record<string, any>);
    const entityName = simplifyEntityName(entityClassName);
    return new PgAdapter(
      poolManager,
      _entity[entityName].table,
      _entity[entityName].schema
    );
  };

  // Return pool manager for monitoring and graceful shutdown
  return {
    entities,
    factory,
  };
};
