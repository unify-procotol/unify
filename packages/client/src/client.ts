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
    const baseUrl = this.config.baseUrl.endsWith('/') 
      ? this.config.baseUrl.slice(0, -1) 
      : this.config.baseUrl;
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
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
              if (args.select) params.select = args.select;
              if (args.order_by) params.order_by = args.order_by;
              if (args.limit) params.limit = args.limit;
              if (args.offset) params.offset = args.offset;

              return this.request<T[]>({
                method: "GET",
                url: `/${entityName}/list`,
                params,
              });
            };

          case "findOne":
            return async (args: FindOneArgs<T>) => {
              const params: Record<string, any> = {
                source,
                where: args.where,
              };

              if (args.select) params.select = args.select;

              return this.request<T | null>({
                method: "GET",
                url: `/${entityName}/find_one`,
                params,
              });
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
                  where: args.where 
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
  static Repo<T extends BaseEntity>(
    entityName: string,
    source: string
  ): Repository<T> {
    return UnifyClient.getGlobalClient().createRepositoryProxy<T>(
      entityName,
      source
    );
  }
}

// 便捷的全局 Repo 函数（向后兼容）
export function Repo<T extends BaseEntity>(
  entityName: string,
  source: string
): Repository<T> {
  return UnifyClient.Repo<T>(entityName, source);
}
