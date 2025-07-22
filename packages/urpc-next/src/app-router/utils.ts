import { URPCError } from "@unilab/urpc-core";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function parseQueryParams(request: NextRequest) {
  const url = new URL(request.url);
  const params: any = {};

  const jsonParams = ["where", "order_by", "include"];
  for (const param of jsonParams) {
    const value = url.searchParams.get(param);
    if (value) {
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

export function parseContext(
  request: NextRequest
): Record<string, any> | undefined {
  const url = new URL(request.url);
  const contextParam = url.searchParams.get("context");
  if (contextParam) {
    try {
      return JSON.parse(contextParam);
    } catch (e) {
      console.warn("Invalid context parameter", e);
    }
  }
  return undefined;
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof URPCError) {
    return NextResponse.json({ error: error.message }, { status: error.code });
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Unknown error" },
    { status: 500 }
  );
}
