import type {
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  CallArgs,
} from "@unilab/urpc-core";
import { simplifyEntityName, getRepo } from "@unilab/urpc-core";
import type {
  LocalConfig,
  HttpClientConfig,
  HybridConfig,
  URPCConfig,
  RepoOptions,
  HttpRequestOptions,
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

export function getEntityName<T extends Record<string, any>>(
  entity: RepoOptions<T>["entity"]
): string {
  const isEntityClass = typeof entity === "function" && "name" in entity;
  return simplifyEntityName(isEntityClass ? entity.name : entity);
}

export function isEntityClass<T extends Record<string, any>>(
  entity: RepoOptions<T>["entity"]
): entity is new () => T {
  return typeof entity === "function" && "name" in entity;
}

export function createEntityInstance<T extends Record<string, any>>(
  entity: RepoOptions<T>["entity"],
  data: T
): T {
  if (isEntityClass(entity)) {
    const entityInstance = new entity();
    Object.assign(entityInstance, data);
    return entityInstance;
  }
  return data;
}

export function createEntityInstances<T extends Record<string, any>>(
  entity: RepoOptions<T>["entity"],
  dataArray: T[]
): T[] {
  if (isEntityClass(entity)) {
    return dataArray.map((item) => {
      const entityInstance = new entity();
      Object.assign(entityInstance, item);
      return entityInstance;
    });
  }
  return dataArray;
}

export async function makeHttpRequest<T>(
  options: HttpRequestOptions,
  httpConfig: HttpClientConfig
): Promise<T> {
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
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

export async function makeStreamRequest(
  options: HttpRequestOptions,
  httpConfig: HttpClientConfig
): Promise<Response> {
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
      "Content-Type": "application/json",
    },
  };

  if (data && (method === "POST" || method === "PATCH")) {
    requestInit.body = JSON.stringify(data);
  }

  const response = await fetch(fullUrl.toString(), requestInit);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
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

export function buildHttpFindManyParams<T extends Record<string, any>>(
  args: FindManyArgs<T>,
  source: string | undefined,
  context: any
): Record<string, any> {
  const params: Record<string, any> = { source, context };

  if (args.where) params.where = args.where;
  if (args.order_by) params.order_by = args.order_by;
  if (args.limit) params.limit = args.limit;
  if (args.offset) params.offset = args.offset;

  return params;
}

export function buildHttpFindOneParams<T extends Record<string, any>>(
  args: FindOneArgs<T>,
  source: string | undefined,
  context: any
): Record<string, any> {
  return {
    source,
    context,
    where: args.where,
  };
}

export async function executeLocalFindMany<T extends Record<string, any>>(
  args: FindManyArgs<T>,
  entityName: string,
  source: string,
  context: any
): Promise<T[]> {
  const repo = getRepo(entityName, source);
  if (!repo) {
    throw new Error(`Unknown data source: ${source} for entity ${entityName}`);
  }

  return await repo.findMany(args, {
    entity: entityName,
    source,
    context,
  });
}

export async function executeLocalFindOne<T extends Record<string, any>>(
  args: FindOneArgs<T>,
  entityName: string,
  source: string,
  context: any
): Promise<T | null> {
  const repo = getRepo(entityName, source);
  if (!repo) {
    throw new Error(`Unknown data source: ${source} for entity ${entityName}`);
  }

  return await repo.findOne(args, {
    entity: entityName,
    source,
    context,
  });
}

export async function executeLocalCreate<T extends Record<string, any>>(
  args: CreationArgs<T>,
  entityName: string,
  source: string
): Promise<T> {
  const repo = getRepo(entityName, source);
  if (!repo) {
    throw new Error(`Unknown data source: ${source} for entity ${entityName}`);
  }

  return await repo.create(args, {
    entity: entityName,
    source,
  });
}

export async function executeLocalUpdate<T extends Record<string, any>>(
  args: UpdateArgs<T>,
  entityName: string,
  source: string
): Promise<T> {
  const repo = getRepo(entityName, source);
  if (!repo) {
    throw new Error(`Unknown data source: ${source} for entity ${entityName}`);
  }

  return await repo.update(args, {
    entity: entityName,
    source,
  });
}

export async function executeLocalDelete<T extends Record<string, any>>(
  args: DeletionArgs<T>,
  entityName: string,
  source: string
): Promise<boolean> {
  const repo = getRepo(entityName, source);
  if (!repo) {
    throw new Error(`Unknown data source: ${source} for entity ${entityName}`);
  }

  return await repo.delete(args, {
    entity: entityName,
    source,
  });
}

export async function executeLocalCall<T extends Record<string, any>>(
  args: CallArgs<T>,
  entityName: string,
  source: string,
  context: any
): Promise<T | Response> {
  const repo = getRepo(entityName, source);
  if (!repo) {
    throw new Error(`Unknown data source: ${source} for entity ${entityName}`);
  }

  return await repo.call(
    args,
    {
      entity: entityName,
      source,
      context,
    },
    {
      stream: context?.stream,
    }
  );
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
