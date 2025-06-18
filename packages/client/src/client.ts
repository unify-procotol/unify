import {
  SourceConfig,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  DeleteArgs,
  CreateArgs,
} from "@unify/core";

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
    this.baseURL = options.baseURL.replace(/\/$/, "");
    this.timeout = options.timeout || 30000;
    this.defaultHeaders = options.headers || {};
  }

  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const { method, url, params = {}, data, headers = {} } = config;

    let fullUrl = `${this.baseURL}${url}`;

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

    const finalHeaders = {
      "Content-Type": "application/json",
      ...this.defaultHeaders,
      ...headers,
    };

    const fetchOptions: RequestInit = {
      method,
      headers: finalHeaders,
      signal: AbortSignal.timeout(this.timeout),
    };

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

export class UnifyClient {
  private httpClient: HttpClient;
  private entities: Record<string, EntityClient> = {};

  constructor(options: ClientOptions) {
    this.httpClient = new HttpClient(options);
  }

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

export function createClient(options: ClientOptions): UnifyClient {
  return new UnifyClient(options);
}

export function createTypedClient<TSourceConfig extends SourceConfig>(
  options: ClientOptions
): TypedClient<TSourceConfig> {
  const client = new UnifyClient(options);
  return new Proxy({} as TypedClient<TSourceConfig>, {
    get(_, entityName: string | symbol) {
      if (typeof entityName === "string") {
        return client.getEntity("default", entityName);
      }
      return undefined;
    },
  });
}

type ExtractEntityTypes<T extends SourceConfig> = {
  [K in keyof T["entities"]]: EntityClient<any>;
};

export type TypedClient<T extends SourceConfig> = ExtractEntityTypes<T>;
export type { ApiResponse };
export { EntityClient, HttpClient };
