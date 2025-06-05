import { PGStorage } from "./pg-storage";
import { SourceConfig } from "./types";

// 创建数据库迁移脚本
export async function createPgTablesFromConfig(
  sourceConfigList: SourceConfig[],
  connectionString: string
) {
  // 确保设置数据库连接字符串
  if (!connectionString) {
    console.error(
      "❌ DATABASE_URL environment variable is required or connectionString parameter must be provided"
    );
    process.exit(1);
  }

  console.log("🚀 Initializing database tables for configuration...");
  console.log("Tables to be created:");

  // 显示将要创建的表
  sourceConfigList.forEach((config) => {
    Object.entries(config.entities).forEach(([entityName, entityConfig]) => {
      if (entityConfig.table) {
        console.log(`- ${config.id}_${entityConfig.table.name}`);
      }
    });
  });

  // 创建PostgreSQL存储实例
  const pgStorage = new PGStorage({
    connectionString: connectionString,
  });

  try {
    // 遍历每个源配置
    for (const config of sourceConfigList) {
      console.log(`\nProcessing configuration: ${config.id}`);

      // 遍历配置中的每个实体，创建对应的表
      for (const [entityName, entityConfig] of Object.entries(
        config.entities
      )) {
        if (entityConfig.table) {
          const tableName = entityConfig.table.name;
          const fullTableName = `${config.id}_${tableName}`;
          
          // 检查表是否已存在
          const tableExists = await pgStorage.tableExists(config.id, tableName);
          
          if (tableExists) {
            console.log(`⚠️  Table already exists, skipping: ${fullTableName}`);
            continue;
          }
          
          console.log(`Creating table for entity: ${entityName}`);

          // 提取列配置，包含所有在SourceConfig中定义的字段
          const columns: Record<
            string,
            {
              type: string;
              nullable?: boolean;
              unique?: boolean;
              default?: any;
            }
          > = {};

          Object.entries(entityConfig.table.columns).forEach(
            ([colName, colConfig]) => {
              const col = colConfig as any; // Type assertion to access all properties

              // 处理默认值，特别是 auto_increment 转换为 PostgreSQL 兼容格式
              let defaultValue = col.default;
              if (col.default === "auto_increment") {
                // PostgreSQL 不支持 auto_increment，需要使用 SERIAL 类型或 IDENTITY
                // 这里设为 undefined，让 SERIAL 类型处理自增
                defaultValue = undefined;
              } else if (col.default === "now()") {
                // PostgreSQL 中使用 CURRENT_TIMESTAMP 或保持 now()
                defaultValue = "CURRENT_TIMESTAMP";
              }

              columns[colName] = {
                type: mapColumnType(col.type, col.default === "auto_increment"),
                nullable: col.nullable !== false,
                unique: col.unique ?? false,
                default: defaultValue,
              };
            }
          );

          try {
            await pgStorage.createTable(
              config.id,
              entityConfig.table.name,
              columns
            );

            console.log(
              `✅ Table created: ${config.id}_${entityConfig.table.name}`
            );
          } catch (createError: any) {
            // 处理序列已存在的错误
            if (createError.message && createError.message.includes('already exists')) {
              console.log(`⚠️  Table or related objects already exist, skipping: ${fullTableName}`);
            } else {
              throw createError;
            }
          }
        }
      }
    }

    console.log("\n✅ All database tables initialized successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    await pgStorage.close();
  }
}

// 映射数据类型到PostgreSQL类型
function mapColumnType(type: string, isAutoIncrement: boolean = false): string {
  // 如果是自增类型，优先使用 SERIAL
  if (isAutoIncrement) {
    if (type.toLowerCase() === "integer") {
      return "SERIAL";
    } else if (type.toLowerCase() === "bigint") {
      return "BIGSERIAL";
    }
  }

  switch (type.toLowerCase()) {
    case "integer":
      return "INTEGER";
    case "bigint":
      return "BIGINT";
    case "varchar":
      return "VARCHAR(255)";
    case "text":
      return "TEXT";
    case "timestamp":
      return "TIMESTAMP";
    case "boolean":
      return "BOOLEAN";
    case "decimal":
      return "DECIMAL";
    case "float":
      return "FLOAT";
    case "json":
      return "JSON";
    case "jsonb":
      return "JSONB";
    case "uuid":
      return "UUID";
    default:
      return "VARCHAR(255)";
  }
}
