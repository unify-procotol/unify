import { URPCError } from "@unilab/urpc-core";
import type { NextApiRequest, NextApiResponse } from "next";

export function parseQueryParams(request: NextApiRequest) {
  const params: any = {};

  const jsonParams = ["where", "order_by", "include"];
  for (const param of jsonParams) {
    const value = Array.isArray(request.query[param])
      ? request.query[param][0]
      : request.query[param];

    if (value && typeof value === "string") {
      try {
        params[param] = JSON.parse(value);
      } catch (e) {
        if (param === "order_by") {
          const [field, direction] = value.split(":");
          if (field && (direction === "asc" || direction === "desc")) {
            params[param] = { [field]: direction };
            continue;
          }
        }
        throw new Error(`Invalid ${param} parameter`);
      }
    }
  }

  const limitParam = Array.isArray(request.query.limit)
    ? request.query.limit[0]
    : request.query.limit;

  if (limitParam && typeof limitParam === "string") {
    const limit = parseInt(limitParam, 10);
    if (isNaN(limit) || limit <= 0) {
      throw new Error("Invalid limit parameter");
    }
    params.limit = limit;
  }

  const offsetParam = Array.isArray(request.query.offset)
    ? request.query.offset[0]
    : request.query.offset;

  if (offsetParam && typeof offsetParam === "string") {
    const offset = parseInt(offsetParam, 10);
    if (isNaN(offset) || offset < 0) {
      throw new Error("Invalid offset parameter");
    }
    params.offset = offset;
  }

  return params;
}

export function parseContext(
  request: NextApiRequest
): Record<string, any> | undefined {
  const contextParam = Array.isArray(request.query.context)
    ? request.query.context[0]
    : request.query.context;
  if (contextParam) {
    try {
      return JSON.parse(contextParam);
    } catch (e) {}
  }
  return undefined;
}

export function handleError(error: any, res: NextApiResponse) {
  if ("message" in error && "code" in error) {
    return res.status(error.code).json({
      error: error.message,
    });
  }
  return res.status(500).json({
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

export function getSourceFromQuery(request: NextApiRequest): string | null {
  const source = Array.isArray(request.query.source)
    ? request.query.source[0]
    : request.query.source;

  return source || null;
}
