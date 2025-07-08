export interface ClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface HttpRequestOptions {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

// 扩展 RepoOptions 类型来支持 context
export interface RepoOptions {
  entity: string;
  source: string;
  context?: {
    language?: string;
    [key: string]: any;
  };
}
