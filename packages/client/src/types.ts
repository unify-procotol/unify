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