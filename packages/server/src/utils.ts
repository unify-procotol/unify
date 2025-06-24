import type { Context } from "hono";
import type { BaseEntity, DataSourceAdapter } from "@unilab/core";

// 适配器注册表
export const adapterRegistry = new Map<string, () => DataSourceAdapter<any>>();

// 注册适配器
export function registerAdapter<T extends BaseEntity>(
  source: string,
  adapterFactory: () => DataSourceAdapter<T>
) {
  adapterRegistry.set(source, adapterFactory);
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

// 新的关联数据加载函数 - 支持回调函数
export async function loadRelations<T extends BaseEntity>(
  entity: T,
  include?: { [key: string]: (ids: string[] | string) => Promise<any> }
): Promise<T> {
  if (!include) {
    return entity;
  }

  const result = { ...entity } as any;

  // 并行处理所有关联查询
  const relationPromises = Object.entries(include).map(
    async ([propertyKey, callback]) => {
      try {
        // 根据实体的id字段调用回调函数
        const entityId = (entity as any).id;
        if (entityId) {
          const relatedData = await callback(entityId);
          return { propertyKey, relatedData };
        }
      } catch (error) {
        console.warn(`Failed to load relation ${propertyKey}:`, error);
        return { propertyKey, relatedData: null };
      }
      return { propertyKey, relatedData: null };
    }
  );

  // 等待所有关联查询完成
  const relationResults = await Promise.all(relationPromises);

  // 将结果合并到实体中
  relationResults.forEach(({ propertyKey, relatedData }) => {
    result[propertyKey] = relatedData;
  });

  return result;
}

// 批量加载关联数据 - 用于findMany操作
export async function loadRelationsForMany<T extends BaseEntity>(
  entities: T[],
  include?: { [key: string]: (ids: string[] | string) => Promise<any> }
): Promise<T[]> {
  if (!include || entities.length === 0) {
    return entities;
  }

  const results = [...entities] as any[];

  // 并行处理所有关联查询
  const relationPromises = Object.entries(include).map(
    async ([propertyKey, callback]) => {
      try {
        // 收集所有id
        const ids = entities.map((entity: any) => entity.id).filter(Boolean);
        if (ids.length > 0) {
          const relatedData = await callback(ids);
          return { propertyKey, relatedData };
        }
      } catch (error) {
        console.warn(`Failed to load relation ${propertyKey}:`, error);
        return { propertyKey, relatedData: null };
      }
      return { propertyKey, relatedData: null };
    }
  );

  // 等待所有关联查询完成
  const relationResults = await Promise.all(relationPromises);

  // 将结果分配到对应的实体中
  relationResults.forEach(({ propertyKey, relatedData }) => {
    if (Array.isArray(relatedData)) {
      // 如果返回的是数组，需要根据外键分组
      results.forEach((entity, index) => {
        const entityId = entity.id;
        // 这里需要根据具体的关联逻辑来匹配数据
        // 对于一对多关系，relatedData应该是按userId分组的
        if (Array.isArray(relatedData)) {
          entity[propertyKey] = relatedData.filter((item: any) => {
            // 假设关联数据有userId字段指向主实体
            return item.userId === entityId;
          });
        } else {
          entity[propertyKey] = relatedData;
        }
      });
    } else {
      // 如果返回的不是数组，直接分配
      results.forEach((entity) => {
        entity[propertyKey] = relatedData;
      });
    }
  });

  return results;
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
