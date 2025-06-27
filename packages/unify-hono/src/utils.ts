import type { Context } from "hono";

export function parseQueryParams(c: Context) {
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
