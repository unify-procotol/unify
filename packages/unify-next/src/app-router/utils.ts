import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function parseQueryParams(request: NextRequest) {
  const url = new URL(request.url);
  const params: any = {};

  // Parse JSON parameters
  const jsonParams = ["where", "order_by", "include"];
  for (const param of jsonParams) {
    const value = url.searchParams.get(param);
    if (value) {
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
  const limitParam = url.searchParams.get("limit");
  if (limitParam) {
    const limit = parseInt(limitParam, 10);
    if (isNaN(limit) || limit <= 0) {
      throw new Error("Invalid limit parameter");
    }
    params.limit = limit;
  }

  const offsetParam = url.searchParams.get("offset");
  if (offsetParam) {
    const offset = parseInt(offsetParam, 10);
    if (isNaN(offset) || offset < 0) {
      throw new Error("Invalid offset parameter");
    }
    params.offset = offset;
  }

  return params;
}

// Generic error handling
export function handleError(error: unknown): NextResponse {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Unknown error" },
    { status: 500 }
  );
}

// Validate required parameters
export function validateSource(source: string | null): NextResponse | null {
  if (!source) {
    return NextResponse.json(
      { error: "source parameter is required" },
      { status: 400 }
    );
  }
  return null;
}
