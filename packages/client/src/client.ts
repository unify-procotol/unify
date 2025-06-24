import type {
  BaseEntity,
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  Repository,
} from "@unify/core";
import type { ClientConfig, HttpRequestOptions, ApiResponse } from "./types";

export class UnifyClient {
  private config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = {
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
      ...config,
    };
  }

  private async request<T>(options: HttpRequestOptions): Promise<T> {
    const { method, url, params, data, headers } = options;

    // 构建完整的 URL
    const baseUrl = this.config.baseUrl.endsWith("/")
      ? this.config.baseUrl.slice(0, -1)
      : this.config.baseUrl;
    const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
    const fullUrl = new URL(`${baseUrl}/${cleanUrl}`);

    // 添加查询参数
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object") {
            fullUrl.searchParams.set(key, JSON.stringify(value));
          } else {
            fullUrl.searchParams.set(key, String(value));
          }
        }
      });
    }

    // 准备请求配置
    const requestInit: RequestInit = {
      method,
      headers: {
        ...this.config.headers,
        ...headers,
      },
    };

    // 添加请求体
    if (data && (method === "POST" || method === "PATCH")) {
      requestInit.body = JSON.stringify(data);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(fullUrl.toString(), {
        ...requestInit,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Handle error responses
      if (result.error) {
        throw new Error(result.error);
      }

      // Return the data field from the response
      return result.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request failed: ${error.message}`);
      }
      throw error;
    }
  }

  createRepositoryProxy<T extends BaseEntity>(
    entityName: string,
    source: string
  ): Repository<T> {
    return new Proxy({} as Repository<T>, {
      get: (target, prop: string) => {
        switch (prop) {
          case "findMany":
            return async (args: FindManyArgs<T> = {}) => {
              const params: Record<string, any> = { source };

              if (args.where) params.where = args.where;
              if (args.order_by) params.order_by = args.order_by;
              if (args.limit) params.limit = args.limit;
              if (args.offset) params.offset = args.offset;

              // 不发送include到服务器，在客户端处理
              const result = await this.request<T[]>({
                method: "GET",
                url: `/${entityName}/list`,
                params,
              });

              // 如果有include回调函数，在客户端执行关联查询
              if (args.include && result && result.length > 0) {
                return await this.loadRelationsForMany(result, args.include);
              }

              return result;
            };

          case "findOne":
            return async (args: FindOneArgs<T>) => {
              const params: Record<string, any> = {
                source,
                where: args.where,
              };

              // 不发送include到服务器，在客户端处理
              const result = await this.request<T | null>({
                method: "GET",
                url: `/${entityName}/find_one`,
                params,
              });

              // 如果有include回调函数，在客户端执行关联查询
              if (args.include && result) {
                return await this.loadRelations(result, args.include);
              }

              return result;
            };

          case "create":
            return async (args: CreationArgs<T>) => {
              return this.request<T>({
                method: "POST",
                url: `/${entityName}/create`,
                params: { source },
                data: { data: args.data },
              });
            };

          case "update":
            return async (args: UpdateArgs<T>) => {
              return this.request<T>({
                method: "PATCH",
                url: `/${entityName}/update`,
                params: { source },
                data: {
                  where: args.where,
                  data: args.data,
                },
              });
            };

          case "delete":
            return async (args: DeletionArgs<T>) => {
              const result = await this.request<{ success: boolean }>({
                method: "DELETE",
                url: `/${entityName}/delete`,
                params: {
                  source,
                  where: args.where,
                },
              });
              return result.success;
            };

          default:
            throw new Error(`Method ${prop} is not supported`);
        }
      },
    });
  }

  // 客户端关联数据加载 - 单个实体
  private async loadRelations<T extends BaseEntity>(
    entity: T,
    include: { [key: string]: (entity: T) => Promise<any> }
  ): Promise<T> {
    const result = { ...entity } as any;

    // 并行处理所有关联查询
    const relationPromises = Object.entries(include).map(
      async ([propertyKey, callback]) => {
        try {
          const relatedData = await callback(entity);
          return { propertyKey, relatedData };
        } catch (error) {
          console.warn(`Failed to load relation ${propertyKey}:`, error);
          return { propertyKey, relatedData: null };
        }
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

  // 客户端关联数据加载 - 多个实体
  private async loadRelationsForMany<T extends BaseEntity>(
    entities: T[],
    include: { [key: string]: (entities: T[]) => Promise<any> }
  ): Promise<T[]> {
    const results = [...entities] as any[];

    // 并行处理所有关联查询
    const relationPromises = Object.entries(include).map(
      async ([propertyKey, callback]) => {
        try {
          const relatedData = await callback(entities);
          return { propertyKey, relatedData };
        } catch (error) {
          console.warn(`Failed to load relation ${propertyKey}:`, error);
          return { propertyKey, relatedData: null };
        }
      }
    );

    // 等待所有关联查询完成
    const relationResults = await Promise.all(relationPromises);

    // 将结果分配到对应的实体中
    relationResults.forEach(({ propertyKey, relatedData }) => {
      if (Array.isArray(relatedData)) {
        // 如果返回的是数组，需要根据外键分组
        results.forEach((entity) => {
          const entityId = entity.id;
          // 根据关联逻辑匹配数据
          entity[propertyKey] = relatedData.filter((item: any) => {
            // 假设关联数据有userId字段指向主实体
            return item.userId === entityId;
          });
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

  // 全局客户端实例
  private static globalClient: UnifyClient | null = null;

  // 初始化全局客户端
  static init(config: ClientConfig): void {
    UnifyClient.globalClient = new UnifyClient(config);
  }

  // 获取全局客户端实例
  private static getGlobalClient(): UnifyClient {
    if (!UnifyClient.globalClient) {
      throw new Error(
        "UnifyClient not initialized. Call UnifyClient.init() first."
      );
    }
    return UnifyClient.globalClient;
  }

  // 静态 Repo 方法
  static repo<T extends BaseEntity>(
    entityName: string,
    source: string
  ): Repository<T> {
    return UnifyClient.getGlobalClient().createRepositoryProxy<T>(
      entityName,
      source
    );
  }
}

// 便捷的全局 repo 函数（向后兼容）
export function repo<T extends BaseEntity>(
  entityName: string,
  source: string
): Repository<T> {
  return UnifyClient.repo<T>(entityName, source);
}
