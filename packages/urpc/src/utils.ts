import {
  simplifyEntityName,
  getRepo,
  extractEntityClassName,
  MethodsForGet,
  MethodsForPost,
} from "@unilab/urpc-core";
import type {
  LocalConfig,
  HttpClientConfig,
  HybridConfig,
  URPCConfig,
  HttpRequestOptions,
  RepoOptions,
} from "./types";

export function isHttpClientConfig(
  config: URPCConfig
): config is HttpClientConfig {
  return "baseUrl" in config && !("plugins" in config);
}

export function isLocalConfig(config: URPCConfig): config is LocalConfig {
  return "plugins" in config && !("baseUrl" in config);
}

export function isHybridConfig(config: URPCConfig): config is HybridConfig {
  return "plugins" in config && "baseUrl" in config;
}

export function getEntityName(entity: any): string {
  return simplifyEntityName(
    isEntityClass(entity) ? extractEntityClassName(entity) : entity
  );
}

export function isEntityClass(entity: any) {
  return typeof entity != "string";
}

export function createEntityInstance<T extends Record<string, any>>(
  entity: any,
  data: T
): T {
  if (isEntityClass(entity)) {
    if (entity.prototype.constructor.length > 0) {
      return new entity(data);
    } else {
      const entityInstance = new entity();
      Object.assign(entityInstance, data);
      return entityInstance;
    }
  }
  return data;
}

export function createEntityInstances<T extends Record<string, any>>(
  entity: any,
  data: T[]
): T[] {
  return data.map((item) => {
    return createEntityInstance(entity, item);
  });
}

export async function makeHttpRequest<T = any>(
  options: HttpRequestOptions,
  httpConfig: HttpClientConfig,
  returnRawResponse?: boolean
): Promise<T | Response> {
  const { method, url, params, data, headers } = options;

  const baseUrl = httpConfig.baseUrl.endsWith("/")
    ? httpConfig.baseUrl.slice(0, -1)
    : httpConfig.baseUrl;
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  const fullUrl = new URL(`${baseUrl}/${cleanUrl}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === "object") {
          fullUrl.searchParams.set(key, JSON.stringify(value));
        } else {
          fullUrl.searchParams.set(key, String(value));
        }
      }
    });
  }

  const requestInit: RequestInit = {
    method,
    headers: {
      ...httpConfig.headers,
      ...headers,
      // Add Content-Type for streaming requests
      ...(returnRawResponse && data
        ? { "Content-Type": "application/json" }
        : {}),
    },
  };

  if (data && (method === "POST" || method === "PATCH")) {
    requestInit.body = JSON.stringify(data);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), httpConfig.timeout);

  const response = await fetch(fullUrl.toString(), {
    ...requestInit,
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${response.statusText}`
    );
  }

  // If the raw response is needed (for streaming), return the Response object directly.
  if (returnRawResponse) {
    return response as Response;
  }

  //  Otherwise, parse JSON and return the data field.
  const result = await response.json();
  return result.data;
}

export async function loadRelations<T extends Record<string, any>>(
  entity: T,
  include: { [key: string]: (entity: T) => Promise<any> }
): Promise<T> {
  const result = { ...entity } as any;
  const relationPromises = Object.entries(include).map(
    async ([propertyKey, callback]) => {
      try {
        const relatedData = await callback(entity);
        return { propertyKey, relatedData };
      } catch (error) {
        console.warn(`Failed to load relation ${propertyKey}:`, error);
        return { propertyKey, relatedData: null };
      }
    }
  );

  const relationResults = await Promise.all(relationPromises);

  relationResults.forEach(({ propertyKey, relatedData }) => {
    result[propertyKey] = relatedData;
  });

  return result;
}

export async function loadRelationsForMany<T extends Record<string, any>>(
  entities: T[],
  include: { [key: string]: (entities: T[]) => Promise<any> }
): Promise<T[]> {
  const results = [...entities] as any[];
  const relationPromises = Object.entries(include).map(
    async ([propertyKey, callback]) => {
      try {
        const relationPromise = callback(entities);
        const relationMapping = (relationPromise as any).__relationMapping;
        const relatedData = await relationPromise;
        return { propertyKey, relatedData, relationMapping };
      } catch (error) {
        console.warn(`Failed to load relation ${propertyKey}:`, error);
        return { propertyKey, relatedData: null, relationMapping: null };
      }
    }
  );

  const relationResults = await Promise.all(relationPromises);
  relationResults.forEach(({ propertyKey, relatedData, relationMapping }) => {
    if (Array.isArray(relatedData)) {
      results.forEach((entity) => {
        const mapping = relationMapping;
        if (mapping) {
          const localValue = entity[mapping.localField];
          entity[propertyKey] = relatedData.filter((item: any) => {
            return item[mapping.foreignField] === localValue;
          });
        } else {
          entity[propertyKey] = relatedData;
        }
      });
    } else {
      results.forEach((entity) => {
        entity[propertyKey] = relatedData;
      });
    }
  });

  return results;
}

export async function executeRemoteMethod({
  entity,
  entityName,
  source,
  funcName,
  args,
  context,
  httpConfig,
}: {
  entity: RepoOptions<any>["entity"];
  entityName: string;
  source: string | undefined;
  funcName: string;
  args: any;
  context: any;
  httpConfig: HttpClientConfig;
}) {
  if (MethodsForGet.includes(funcName)) {
    const result = await makeHttpRequest(
      {
        method: "GET",
        url: `/${entityName}/${funcName}`,
        params: {
          source,
          context,
          ...args,
        },
      },
      httpConfig
    );

    if (funcName === "findMany") {
      if (args?.include && result && result.length > 0) {
        const resultWithRelations = await loadRelationsForMany(
          result,
          args.include
        );
        return createEntityInstances(entity, resultWithRelations);
      }
      return createEntityInstances(entity, result);
    }

    if (funcName === "findOne") {
      if (args?.include && result) {
        const resultWithRelations = await loadRelations(result, args.include);
        return createEntityInstance(entity, resultWithRelations);
      }
      return result ? createEntityInstance(entity, result) : null;
    }

    return result ? createEntityInstance(entity, result) : null;
  } else {
    const result = await makeHttpRequest(
      {
        method: "POST",
        url: `/${entityName}/${funcName}`,
        params: { source, context },
        data: args,
      },
      httpConfig,
      context?.stream
    );
    return result ? createEntityInstance(entity, result) : null;
  }
}

export async function executeLocalMethod({
  entity,
  entityName,
  source,
  funcName,
  args,
  context,
}: {
  entity: RepoOptions<any>["entity"];
  entityName: string;
  source: string;
  funcName: string;
  args: any;
  context: any;
}) {
  const repo = getRepo(entityName, source);
  if (!repo) {
    throw new Error(`Unknown data source: ${source} for entity ${entityName}`);
  }

  if (MethodsForGet.includes(funcName) || MethodsForPost.includes(funcName)) {
    // @ts-ignore
    const result = await repo[funcName](args, {
      entity: entityName,
      source,
      context,
    });

    if (funcName === "findMany") {
      if (args?.include && result && result.length > 0) {
        const resultWithRelations = await loadRelationsForMany(
          result,
          args.include
        );
        return createEntityInstances(entity, resultWithRelations);
      }
      return createEntityInstances(entity, result);
    }

    if (funcName === "findOne") {
      if (args?.include && result) {
        const resultWithRelations = await loadRelations(result, args.include);
        return createEntityInstance(entity, resultWithRelations);
      }
      return result ? createEntityInstance(entity, result) : null;
    }

    return result ? createEntityInstance(entity, result) : null;
  } else {
    const result = await repo.customMethod(funcName, args, {
      entity: entityName,
      source,
      context,
    });
    return result ? createEntityInstance(entity, result) : null;
  }
}

export function shouldFallbackToHttp(
  entityName: string,
  source: string | undefined
): boolean {
  if (!source) return true;

  const repo = getRepo(entityName, source);
  if (!repo) {
    console.log(
      `Local adapter not found for ${entityName}:${source}, falling back to HTTP`
    );
    return true;
  }

  return false;
}

export function logHttpFallbackWarning(
  entityName: string,
  operation: string,
  error: any
): void {
  console.warn(`HTTP fallback failed for ${operation} ${entityName}:`, error);
}
