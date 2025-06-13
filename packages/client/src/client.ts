import {
  SourceConfig,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  DeleteArgs,
  CreateArgs,
} from "unify-api";

export interface ClientOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(options: ClientOptions) {
    this.baseURL = options.baseURL.replace(/\/$/, ""); // 移除末尾斜杠
    this.timeout = options.timeout || 30000;
    this.defaultHeaders = options.headers || {};
  }

  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const { method, url, params = {}, data, headers = {} } = config;

    // 构建完整URL
    let fullUrl = `${this.baseURL}${url}`;

    // 处理查询参数
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object") {
            searchParams.append(key, JSON.stringify(value));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      fullUrl += `?${searchParams.toString()}`;
    }

    // 合并headers
    const finalHeaders = {
      "Content-Type": "application/json",
      ...this.defaultHeaders,
      ...headers,
    };

    // 准备fetch选项
    const fetchOptions: RequestInit = {
      method,
      headers: finalHeaders,
      signal: AbortSignal.timeout(this.timeout),
    };

    // 添加请求体（非GET请求）
    if (method !== "GET" && data) {
      fetchOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(fullUrl, fetchOptions);

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData: T;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        responseData = (await response.json()) as T;
      } else {
        responseData = (await response.text()) as T;
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}. ${
            typeof responseData === "string"
              ? responseData
              : JSON.stringify(responseData)
          }`
        );
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request failed: ${error.message}`);
      }
      throw error;
    }
  }
}

// 实体客户端基类
class EntityClient<TEntity = any> {
  constructor(
    private httpClient: HttpClient,
    private sourceId: string,
    private entityName: string
  ) {}

  async findMany(args: FindManyArgs): Promise<ApiResponse<TEntity[]>> {
    args.source_id = this.sourceId;
    return this.httpClient.request<TEntity[]>({
      method: "GET",
      url: `/${this.entityName}/list`,
      params: args,
    });
  }

  async findOne(args: FindOneArgs): Promise<ApiResponse<TEntity>> {
    args.source_id = this.sourceId;
    return this.httpClient.request<TEntity>({
      method: "GET",
      url: `/${this.entityName}/find_one`,
      params: args,
    });
  }

  async create(args: CreateArgs): Promise<ApiResponse<TEntity>> {
    args.source_id = this.sourceId;
    return this.httpClient.request<TEntity>({
      method: "POST",
      url: `/${this.entityName}/create`,
      data: args,
    });
  }

  async update(args: UpdateArgs): Promise<ApiResponse<TEntity>> {
    args.source_id = this.sourceId;
    return this.httpClient.request<TEntity>({
      method: "PATCH",
      url: `/${this.entityName}/update`,
      data: args,
    });
  }

  async delete(args: DeleteArgs): Promise<ApiResponse<void>> {
    args.source_id = this.sourceId;
    return this.httpClient.request<void>({
      method: "DELETE",
      url: `/${this.entityName}/delete`,
      data: args,
    });
  }
}

export class UnifyApiClient {
  private httpClient: HttpClient;
  private entities: Record<string, EntityClient> = {};

  constructor(options: ClientOptions) {
    this.httpClient = new HttpClient(options);
  }

  // 注册实体
  registerEntity<TEntity = any>(
    sourceId: string,
    entityName: string
  ): EntityClient<TEntity> {
    const key = `${sourceId}.${entityName}`;
    if (!this.entities[key]) {
      this.entities[key] = new EntityClient<TEntity>(
        this.httpClient,
        sourceId,
        entityName
      );
    }
    return this.entities[key] as EntityClient<TEntity>;
  }

  // 获取实体客户端
  getEntity<TEntity = any>(
    sourceId: string,
    entityName: string
  ): EntityClient<TEntity> {
    const key = `${sourceId}.${entityName}`;
    if (!this.entities[key]) {
      this.entities[key] = new EntityClient<TEntity>(
        this.httpClient,
        sourceId,
        entityName
      );
    }
    return this.entities[key] as EntityClient<TEntity>;
  }
}

// SDK工厂函数
export function createClient(options: ClientOptions): UnifyApiClient {
  return new UnifyApiClient(options);
}

// 从SourceConfig生成类型化SDK的工厂函数
export function createTypedClient<TSourceConfig extends SourceConfig>(
  options: ClientOptions
): TypedClient<TSourceConfig> {
  const client = new UnifyApiClient(options);
  return new Proxy({} as TypedClient<TSourceConfig>, {
    get(_, entityName: string | symbol) {
      if (typeof entityName === "string") {
        // 这里需要从某个地方获取sourceId，暂时使用一个默认值
        // 在实际使用中，可以通过配置或其他方式传入
        return client.getEntity("default", entityName);
      }
      return undefined;
    },
  });
}

// 类型推导辅助类型
type ExtractEntityTypes<T extends SourceConfig> = {
  [K in keyof T["entities"]]: EntityClient<any>;
};

// 类型化客户端类型
export type TypedClient<T extends SourceConfig> = ExtractEntityTypes<T>;

// 导出主要类型
export type { ApiResponse };
export { EntityClient, HttpClient };
