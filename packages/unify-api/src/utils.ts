import { Context } from "hono";
import { EntityFunctionName } from "./types";
import { ContentfulStatusCode } from "hono/utils/http-status";

// 解析 JSON 或返回默认值
function parseJsonOrDefault(value: string, defaultValue: any = undefined): any {
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

// 解析整数参数
function parseIntParam(value: string): number | undefined {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

// 解析 where 条件
function parseWhereCondition(whereStr: string): any {
  const parsed = parseJsonOrDefault(whereStr);
  if (parsed !== undefined) return parsed;

  // 如果不是 JSON，暂时返回 undefined
  // 原始代码的简单键值对处理逻辑不完整
  return undefined;
}

// 解析排序条件
function parseOrderBy(orderStr: string): any {
  const parsed = parseJsonOrDefault(orderStr);
  if (parsed !== undefined) return parsed;

  // 简单格式：field:asc 或 field:desc
  const [field, direction] = orderStr.split(":");
  if (field && (direction === "asc" || direction === "desc")) {
    return { [field]: direction };
  }
  return undefined;
}

export async function parseRequestArgs(
  c: Context,
  entityFunction: EntityFunctionName
) {
  const method = c.req.method;
  const args: Record<string, any> = {};

  if (method === "GET") {
    const query = c.req.query();
    args.source_id = query.source_id;

    // 通用查询参数解析（findMany 和 findOne 都支持）
    if (["findMany", "findOne"].includes(entityFunction)) {
      if (query.where) {
        const where = parseWhereCondition(query.where);
        if (where !== undefined) {
          args.where = where;
        }
      }

      if (query.select) {
        const select = parseJsonOrDefault(query.select);
        if (select !== undefined) {
          args.select = select;
        }
      }
    }

    // findMany 特有参数
    if (entityFunction === "findMany") {
      if (query.limit) {
        const limit = parseIntParam(query.limit);
        if (limit !== undefined) {
          args.limit = limit;
        }
      }

      if (query.offset) {
        const offset = parseIntParam(query.offset);
        if (offset !== undefined) {
          args.offset = offset;
        }
      }

      if (query.order_by) {
        const orderBy = parseOrderBy(query.order_by);
        if (orderBy !== undefined) {
          args.order_by = orderBy;
        }
      }
    }
  } else if (["POST", "PATCH", "DELETE"].includes(method)) {
    try {
      const body = await c.req.json();
      args.source_id = body.source_id;
      switch (entityFunction) {
        case "create":
          args.data = body.data;
          break;
        case "update":
          args.where = body.where;
          args.data = body.data;
          break;
        case "delete":
          args.where = body.where;
          break;
      }
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
  status: ContentfulStatusCode;
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
