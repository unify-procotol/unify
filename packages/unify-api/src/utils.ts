import { Context } from "hono";
import { QueryArgs } from "./types";

/**
 * 从 URL 查询参数和请求体中解析参数
 */
export async function parseRequestArgs(c: any): Promise<QueryArgs> {
  const query = c.req.query();
  const args: QueryArgs = {};

  // 首先添加所有查询参数
  Object.assign(args, query);

  // 解析 limit
  if (query.limit) {
    const limit = parseInt(query.limit, 10);
    if (!isNaN(limit)) {
      args.limit = limit;
    }
  }

  // 解析 offset
  if (query.offset) {
    const offset = parseInt(query.offset, 10);
    if (!isNaN(offset)) {
      args.offset = offset;
    }
  }

  // 解析 select 字段
  if (query.select) {
    args.select = query.select.split(",").map((s: string) => s.trim());
  }

  // 解析 where 条件
  if (query.where) {
    try {
      args.where = JSON.parse(query.where);
    } catch {
      // 如果不是 JSON，则作为简单的键值对处理
      args.where = { [query.where]: query[query.where] };
    }
  }

  // 解析 order_by
  if (query.order_by) {
    try {
      args.order_by = JSON.parse(query.order_by);
    } catch {
      // 简单格式：field:asc 或 field:desc
      const [field, direction] = query.order_by.split(":");
      if (field && (direction === "asc" || direction === "desc")) {
        args.order_by = { [field]: direction };
      }
    }
  }

  // 对于 POST/PUT/PATCH 请求，合并请求体
  if (["POST", "PUT", "PATCH"].includes(c.req.method)) {
    try {
      const body = await c.req.json();
      Object.assign(args, body);
    } catch {
      // 忽略解析错误
    }
  }

  return args;
}

/**
 * 构建 REST API 路径
 */
export function buildRestPath({
  entityName,
  pathSuffix,
}: {
  sourceId?: string;
  entityName: string;
  pathSuffix?: string;
}): string {
  const basePath = `/${entityName}`;
  return pathSuffix ? basePath + pathSuffix : basePath;
}

/**
 * 标准化响应数据
 */
export function normalizeResponse(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  return data;
}

/**
 * 处理错误响应
 */
export function handleError(error: any): {
  error: string;
  message: string;
  status: number;
} {
  if (error.status && error.message) {
    return {
      error: error.name || "Error",
      message: error.message,
      status: error.status,
    };
  }

  return {
    error: "Internal Server Error",
    message: typeof error === "string" ? error : "An unexpected error occurred",
    status: 500,
  };
}
