import type { Context } from "hono";
import type { BaseEntity, DataSourceAdapter } from "@unify/core";
import { Relations } from "@unify/core";

// 适配器注册表
export const adapterRegistry = new Map<string, () => DataSourceAdapter<any>>();

// 注册适配器
export function registerAdapter<T extends BaseEntity>(
  name: string,
  adapterFactory: () => DataSourceAdapter<T>
) {
  adapterRegistry.set(name, adapterFactory);
}

// 获取适配器
export function getAdapter<T extends BaseEntity>(
  source: string
): DataSourceAdapter<T> {
  const adapterFactory = adapterRegistry.get(source);
  if (!adapterFactory) {
    throw new Error(`Unknown data source: ${source}`);
  }
  return adapterFactory();
}

// 解析查询参数
export function parseQueryParams<T extends BaseEntity>(c: Context) {
  const query = c.req.query();
  const params: any = {};

  // 解析 JSON 参数
  const jsonParams = ["where", "order_by", "include"];
  for (const param of jsonParams) {
    if (query[param]) {
      try {
        params[param] = JSON.parse(query[param]);
      } catch (e) {
        // 特殊处理 order_by 的简单格式
        if (param === "order_by") {
          const [field, direction] = query[param].split(":");
          if (field && (direction === "asc" || direction === "desc")) {
            params[param] = { [field]: direction };
            continue;
          }
        }
        throw new Error(`Invalid ${param} parameter`);
      }
    }
  }

  // 解析数字参数
  if (query.limit) {
    const limit = parseInt(query.limit, 10);
    if (isNaN(limit) || limit <= 0) {
      throw new Error("Invalid limit parameter");
    }
    params.limit = limit;
  }

  if (query.offset) {
    const offset = parseInt(query.offset, 10);
    if (isNaN(offset) || offset < 0) {
      throw new Error("Invalid offset parameter");
    }
    params.offset = offset;
  }

  return params;
}

// 通用错误处理
export function handleError(error: unknown, c: Context) {
  return c.json(
    { error: error instanceof Error ? error.message : "Unknown error" },
    500
  );
}

// 验证必需参数
export function validateSource(source: string | undefined, c: Context) {
  if (!source) {
    return c.json({ error: "source parameter is required" }, 400);
  }
  return null;
}

export interface AdapterRegistration {
  source: string;
  adapter: DataSourceAdapter<any>;
}

// 加载关系数据
export async function loadRelations<T extends BaseEntity>(
  entity: T,
  entityName: string,
  include?: { [key: string]: boolean }
): Promise<T> {
  if (!include) {
    return entity;
  }

  const relations = Relations.getAllRelationMetadata(entityName);
  if (!relations) {
    return entity;
  }

  const result = { ...entity } as any;

  for (const [propertyKey, shouldLoad] of Object.entries(include)) {
    if (!shouldLoad) continue;

    const relationMetadata = relations.get(propertyKey);
    if (!relationMetadata) continue;

    try {
      if (relationMetadata.type === "toOne") {
        // 处理一对一关系
        const foreignKey = relationMetadata.foreignKey;

        if (
          foreignKey &&
          typeof foreignKey === "string" &&
          (entity as any)[foreignKey]
        ) {
          // 尝试从不同的适配器获取关联数据
          const relatedEntityName = getEntityNameFromTarget(
            relationMetadata.target
          );
          const adapter = tryGetAdapter(relatedEntityName);

          if (adapter) {
            const foreignKeyValue = (entity as any)[foreignKey];
            const whereCondition = { id: foreignKeyValue };

            const relatedEntity = await adapter.findOne({
              where: whereCondition,
            });

            result[propertyKey] = relatedEntity;
          }
        }
      } else if (relationMetadata.type === "toMany") {
        // 处理一对多关系
        const config = relationMetadata.config;
        if (config?.fields) {
          const relatedEntityName = getEntityNameFromTarget(
            relationMetadata.target
          );
          const adapter = tryGetAdapter(relatedEntityName);
          if (adapter) {
            // 构建查询条件
            const whereCondition: any = {};
            for (const [localField, foreignField] of Object.entries(
              config.fields
            )) {
              if ((entity as any)[localField]) {
                whereCondition[foreignField] = (entity as any)[localField];
              }
            }

            const findManyArgs: any = { where: whereCondition };
            if (config.findOptions) {
              if (config.findOptions.limit)
                findManyArgs.limit = config.findOptions.limit;
              if (config.findOptions.orderBy)
                findManyArgs.order_by = config.findOptions.orderBy;
              if (config.findOptions.where) {
                findManyArgs.where = {
                  ...findManyArgs.where,
                  ...config.findOptions.where,
                };
              }
            }

            const relatedEntities = await adapter.findMany(findManyArgs);
            result[propertyKey] = relatedEntities;
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to load relation ${propertyKey}:`, error);
      // 继续处理其他关系，不因为一个关系失败而中断
    }
  }

  return result;
}

// 从目标函数获取实体名称
function getEntityNameFromTarget(target: (() => any) | any): string {
  try {
    let entityName = "";

    if (typeof target === "function") {
      // 如果 target 是函数，调用它获取类或实例
      const result = target();
      if (typeof result === "function") {
        // 如果返回的是构造函数
        entityName = result.name;
      } else {
        // 如果返回的是实例
        entityName = result.constructor.name;
      }
    } else {
      // 如果 target 本身就是实例
      entityName = target.constructor.name;
    }

    // 将 "UserEntity" 转换为 "user"
    return entityName.toLowerCase().replace("entity", "");
  } catch (error) {
    return "";
  }
}

// 尝试获取适配器（不抛出错误）
function tryGetAdapter(source: string): DataSourceAdapter<any> | null {
  try {
    return getAdapter(source);
  } catch (error) {
    return null;
  }
}
