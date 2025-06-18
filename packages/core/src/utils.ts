import { EntityFunctionName } from "./types";

function parseJsonOrDefault(value: string, defaultValue: any = undefined): any {
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

function parseIntParam(value: string): number | undefined {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

function parseWhereCondition(whereStr: string): any {
  const parsed = parseJsonOrDefault(whereStr);
  if (parsed !== undefined) return parsed;

  return undefined;
}

function parseOrderBy(orderStr: string): any {
  const parsed = parseJsonOrDefault(orderStr);
  if (parsed !== undefined) return parsed;

  // Simple format: field:asc or field:desc
  const [field, direction] = orderStr.split(":");
  if (field && (direction === "asc" || direction === "desc")) {
    return { [field]: direction };
  }
  return undefined;
}

export async function parseRequestArgs(
  c: any,
  entityFunction: EntityFunctionName
) {
  const method = c.req.method;
  const args: Record<string, any> = {};

  if (method === "GET") {
    const query = c.req.query();
    args.source_id = query.source_id;

    // Generic query parameter parsing (supported by both findMany and findOne)
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

    // findMany-specific parameters
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
      // Ignore parsing errors
    }
  }

  return args;
}

export function buildRestPath({
  entityName,
  pathSuffix,
}: {
  entityName: string;
  pathSuffix?: string;
}): string {
  const basePath = `/${entityName}`;
  return pathSuffix ? basePath + pathSuffix : basePath;
}

export function normalizeResponse(data: any): any {
  if (data === null || data === undefined) {
    return null;
  }
  return data;
}

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

export const DEFAULT_METHOD_MAPPING: Record<
  string,
  { method: string; pathSuffix?: string }
> = {
  findMany: { method: "GET", pathSuffix: "/list" },
  findOne: { method: "GET", pathSuffix: "/find_one" },
  create: { method: "POST", pathSuffix: "/create" },
  update: { method: "PATCH", pathSuffix: "/update" },
  delete: { method: "DELETE", pathSuffix: "/delete" },
};
