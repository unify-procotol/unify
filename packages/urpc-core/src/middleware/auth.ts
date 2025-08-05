import {
  AuthUser,
  Middleware,
  MiddlewareContext,
  MiddlewareNext,
  PermissionRule,
} from "../types";
import { getMiddlewareManager } from "../middleware-manager";
import { Allow } from "../allow";
import { ErrorCodes, URPCError } from "../error";

export interface AuthOptions {
  getUser: (context: any) => AuthUser | null | Promise<AuthUser | null>;
}

export function auth(options: AuthOptions): Middleware {
  const fn = async (context: MiddlewareContext, next: MiddlewareNext) => {
    const metadata = context.metadata;
    const entityName = metadata?.entity;
    const operation = context.operation;

    if (!entityName) {
      throw new URPCError(ErrorCodes.BAD_REQUEST, "No entity specified");
    }

    const entityConfigs = getMiddlewareManager().entityConfigs;
    const entityConfig = entityConfigs[entityName];

    if (!entityConfig) {
      // No config found for entity, skipping auth check
      return await next();
    }

    let authUser: AuthUser | null = null;
    if (options.getUser) {
      if (metadata?.honoCtx) {
        authUser = await options.getUser(metadata.honoCtx);
      }
      if (metadata?.nextApiRequest) {
        authUser = await options.getUser(metadata.nextApiRequest);
      }
      if (metadata?.nextRequest) {
        authUser = await options.getUser(metadata.nextRequest);
      }
    }

    context.user = authUser;

    const { data, ok } = await checkPermission(
      entityConfig,
      operation,
      context.args,
      authUser,
      next
    );

    if (ok && data) {
      return data;
    }

    return await next();
  };

  return {
    fn,
    name: "AuthMiddleware",
  };
}

async function checkPermission(
  entityConfig: any,
  operation: string,
  args: any,
  authUser: AuthUser | null,
  next: () => Promise<any>
): Promise<{
  data: any;
  ok: boolean;
}> {
  const permissionMap: Record<string, string[]> = {
    findOne: ["allowApiRead", "allowApiCrud"],
    findMany: ["allowApiRead", "allowApiCrud"],
    create: ["allowApiCreate", "allowApiCrud"],
    createMany: ["allowApiCreate", "allowApiCrud"],
    update: ["allowApiUpdate", "allowApiCrud"],
    updateMany: ["allowApiUpdate", "allowApiCrud"],
    upsert: ["allowApiUpdate", "allowApiCreate", "allowApiCrud"],
    delete: ["allowApiDelete", "allowApiCrud"],
    deleteMany: ["allowApiDelete", "allowApiCrud"],
  };

  const permissionFields = permissionMap[operation] || [];

  // Check if any permission rules are defined for this operation
  const hasPermissionRules = permissionFields.some(
    (field) => entityConfig[field] !== undefined
  );

  // If no permission rules are defined, allow by default
  if (!hasPermissionRules) {
    return {
      data: null,
      ok: true,
    };
  }

  // Check if any rule allows everyone (true or Allow.everyone)
  const allowsEveryone = permissionFields.some((field) => {
    const rule = entityConfig[field];
    return rule === true || rule === Allow.everyone;
  });

  // If any rule allows everyone, no need to check authentication
  if (allowsEveryone) {
    return {
      data: null,
      ok: true,
    };
  }

  // If there are permission rules that require authentication but no authenticated user, throw 401
  if (!authUser) {
    throw new URPCError(ErrorCodes.UNAUTHORIZED, "Unauthorized");
  }

  // Check each applicable permission field
  for (const field of permissionFields) {
    const rule = entityConfig[field];
    if (rule !== undefined) {
      const { hasPermission, data } = await evaluatePermissionRule(
        rule,
        args?.data,
        authUser,
        next
      );
      if (hasPermission) {
        return {
          data: data,
          ok: hasPermission,
        };
      }
    }
  }

  // If we reach here, permission was denied
  throw new URPCError(
    ErrorCodes.FORBIDDEN,
    `Access denied: Insufficient permissions`
  );
}

async function evaluatePermissionRule(
  rule: PermissionRule,
  entity: any,
  authUser: AuthUser | null,
  next: () => Promise<any>
): Promise<{
  hasPermission: boolean;
  data: any;
}> {
  if (typeof rule === "boolean") {
    return {
      hasPermission: rule,
      data: null,
    };
  }

  if (typeof rule === "string") {
    return {
      hasPermission: Allow.hasRole(rule)(authUser),
      data: null,
    };
  }

  if (Array.isArray(rule)) {
    // Multiple roles check
    return {
      hasPermission: Allow.hasAnyRole(rule)(authUser),
      data: null,
    };
  }

  if (typeof rule === "function") {
    try {
      if (rule.length === 2) {
        const data = await next();
        const result = rule(authUser, data);
        return {
          data,
          hasPermission: result,
        };
      } else {
        // @ts-ignore
        const result = rule(authUser);
        return {
          data: null,
          hasPermission: result,
        };
      }
    } catch (error) {
      return {
        hasPermission: false,
        data: null,
      };
    }
  }

  return {
    hasPermission: false,
    data: null,
  };
}
