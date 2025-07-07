import type {
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  Repository,
  RepoOptions,
  JoinRepoOptions,
} from "@unilab/urpc-core";
import type { ClientConfig, HttpRequestOptions } from "./types";

export class URPC {
  private config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = {
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
      ...config,
    };
  }

  private async request<T>(options: HttpRequestOptions): Promise<T> {
    const { method, url, params, data, headers } = options;

    const baseUrl = this.config.baseUrl.endsWith("/")
      ? this.config.baseUrl.slice(0, -1)
      : this.config.baseUrl;
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
        ...this.config.headers,
        ...headers,
      },
    };

    if (data && (method === "POST" || method === "PATCH")) {
      requestInit.body = JSON.stringify(data);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

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

  createRepositoryProxy<T extends Record<string, any>>(
    options: RepoOptions
  ): Repository<T> {
    return new Proxy({} as Repository<T>, {
      get: (target, prop: string) => {
        const { entity, source } = options;
        const _entity = entity.replace(/Entity$/i, "").toLowerCase();
        switch (prop) {
          case "findMany":
            return async (args: FindManyArgs<T> = {}) => {
              const params: Record<string, any> = { source };

              if (args.where) params.where = args.where;
              if (args.order_by) params.order_by = args.order_by;
              if (args.limit) params.limit = args.limit;
              if (args.offset) params.offset = args.offset;

              const result = await this.request<T[]>({
                method: "GET",
                url: `/${_entity}/list`,
                params,
              });

              if (args.include && result && result.length > 0) {
                return await this.loadRelationsForMany(result, args.include);
              }

              return result;
            };

          case "findOne":
            return async (args: FindOneArgs<T>) => {
              const params: Record<string, any> = {
                source,
                where: args.where,
              };

              const result = await this.request<T | null>({
                method: "GET",
                url: `/${_entity}/find_one`,
                params,
              });

              if (args.include && result) {
                return await this.loadRelations(result, args.include);
              }

              return result;
            };

          case "create":
            return async (args: CreationArgs<T>) => {
              return this.request<T>({
                method: "POST",
                url: `/${_entity}/create`,
                params: { source },
                data: { data: args.data },
              });
            };

          case "update":
            return async (args: UpdateArgs<T>) => {
              return this.request<T>({
                method: "PATCH",
                url: `/${_entity}/update`,
                params: { source },
                data: {
                  where: args.where,
                  data: args.data,
                },
              });
            };

          case "delete":
            return async (args: DeletionArgs<T>) => {
              const result = await this.request<{ success: boolean }>({
                method: "DELETE",
                url: `/${_entity}/delete`,
                params: {
                  source,
                  where: args.where,
                },
              });
              return result.success;
            };

          default:
            throw new Error(`Method ${prop} is not supported`);
        }
      },
    });
  }

  private async loadRelations<T extends Record<string, any>>(
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

  private async loadRelationsForMany<T extends Record<string, any>>(
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

  private static globalClient: URPC | null = null;

  static init(config: ClientConfig): void {
    URPC.globalClient = new URPC(config);
  }

  private static getGlobalClient(): URPC {
    if (!URPC.globalClient) {
      throw new Error(
        "URPC not initialized. Call URPC.init() first."
      );
    }
    return URPC.globalClient;
  }

  static repo<T extends Record<string, any>>(
    options: RepoOptions
  ): Repository<T> {
    return URPC.getGlobalClient().createRepositoryProxy<T>(options);
  }

  static joinRepo<F extends Record<string, any>, L extends Record<string, any>>(
    options: JoinRepoOptions<F, L>
  ): Repository<F> {
    const baseRepo = URPC.repo<F>(options);
    return new Proxy(baseRepo, {
      get: (target, prop: string) => {
        const originalMethod = (target as any)[prop];
        if (prop === "findMany" || prop === "findOne") {
          return (...args: any[]) => {
            const resultPromise = originalMethod.apply(target, args);
            (resultPromise as any).__relationMapping = {
              localField: options.localField,
              foreignField: options.foreignField,
            };
            return resultPromise;
          };
        }
        return originalMethod;
      },
    });
  }
}

export function repo<T extends Record<string, any>>(
  options: RepoOptions
): Repository<T> {
  return URPC.repo<T>(options);
}

export function joinRepo<
  F extends Record<string, any> = Record<string, any>,
  L extends Record<string, any> = Record<string, any>,
>(options: JoinRepoOptions<F, L>): Repository<F> {
  return URPC.joinRepo<F, L>(options);
}
