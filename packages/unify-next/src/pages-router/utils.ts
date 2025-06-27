import type { NextApiRequest, NextApiResponse } from "next";

// Parse query parameters for NextApiRequest
export function parseQueryParams(request: NextApiRequest) {
  const params: any = {};

  // Parse JSON parameters
  const jsonParams = ["where", "order_by", "include"];
  for (const param of jsonParams) {
    const value = Array.isArray(request.query[param])
      ? request.query[param][0]
      : request.query[param];

    if (value && typeof value === "string") {
      try {
        params[param] = JSON.parse(value);
      } catch (e) {
        // Special handling for order_by simple format
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

  // Parse numeric parameters
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

// Generic error response for Pages Router
export function handleError(error: unknown, res: NextApiResponse) {
  return res.status(500).json({
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

// Validate required parameters for Pages Router
export function validateSource(
  source: string | null | undefined,
  res: NextApiResponse
): boolean {
  if (!source) {
    res.status(400).json({
      error: "source parameter is required",
    });
    return false;
  }
  return true;
}

// Get source from query parameters
export function getSourceFromQuery(request: NextApiRequest): string | null {
  const source = Array.isArray(request.query.source)
    ? request.query.source[0]
    : request.query.source;

  return source || null;
}
