import type {
  FindManyArgs,
  FindOneArgs,
  CreationArgs,
  UpdateArgs,
  DeletionArgs,
  EntityConfigs,
  CallArgs,
} from "@unilab/urpc-core";
import type { HttpClientConfig, ProxyRepo, RepoOptions } from "./types";
import {
  getEntityName,
  createEntityInstance,
  createEntityInstances,
  buildHttpFindManyParams,
  buildHttpFindOneParams,
  executeLocalFindMany,
  executeLocalFindOne,
  executeLocalCreate,
  executeLocalUpdate,
  executeLocalDelete,
  executeLocalCall,
  shouldFallbackToHttp,
  logHttpFallbackWarning,
  loadRelations,
  loadRelationsForMany,
  makeHttpRequest,
  makeStreamRequest,
} from "./utils";

export function createHttpRepositoryProxy<T extends Record<string, any>>(
  options: RepoOptions<T>,
  entityConfigs: EntityConfigs,
  httpConfig: HttpClientConfig
): ProxyRepo<T> {
  return new Proxy({} as ProxyRepo<T>, {
    get: (target, prop: string) => {
      const { entity, context } = options;
      const entityName = getEntityName(entity);
      const source = options.source || entityConfigs[entityName]?.defaultSource;

      switch (prop) {
        case "findMany":
          return async (args: FindManyArgs<T> = {}) => {
            const params = buildHttpFindManyParams(args, source, context);
            const result = await makeHttpRequest<T[]>(
              {
                method: "GET",
                url: `/${entityName}/list`,
                params,
              },
              httpConfig
            );

            if (args.include && result && result.length > 0) {
              const resultWithRelations = await loadRelationsForMany(
                result,
                args.include
              );
              return createEntityInstances(entity, resultWithRelations);
            }

            return createEntityInstances(entity, result);
          };

        case "findOne":
          return async (args: FindOneArgs<T>) => {
            const params = buildHttpFindOneParams(args, source, context);
            const result = await makeHttpRequest<T | null>(
              {
                method: "GET",
                url: `/${entityName}/find_one`,
                params,
              },
              httpConfig
            );

            if (args.include && result) {
              const resultWithRelations = await loadRelations(
                result,
                args.include
              );
              return createEntityInstance(entity, resultWithRelations);
            }

            return result ? createEntityInstance(entity, result) : null;
          };

        case "create":
          return async (args: CreationArgs<T>) => {
            const result = await makeHttpRequest<T>(
              {
                method: "POST",
                url: `/${entityName}/create`,
                params: { source, context },
                data: { data: args.data },
              },
              httpConfig
            );
            return createEntityInstance(entity, result);
          };

        case "update":
          return async (args: UpdateArgs<T>) => {
            const result = await makeHttpRequest<T>(
              {
                method: "PATCH",
                url: `/${entityName}/update`,
                params: { source, context },
                data: {
                  where: args.where,
                  data: args.data,
                },
              },
              httpConfig
            );
            return createEntityInstance(entity, result);
          };

        case "delete":
          return async (args: DeletionArgs<T>) => {
            const result = await makeHttpRequest<{ success: boolean }>(
              {
                method: "DELETE",
                url: `/${entityName}/delete`,
                params: {
                  source,
                  context,
                  where: args.where,
                },
              },
              httpConfig
            );
            return result.success;
          };

        case "call":
          return async (args: CallArgs<T>) => {
            // For stream requests, we need to handle the response differently
            if (context?.stream) {
              return await makeStreamRequest(
                {
                  method: "POST",
                  url: `/${entityName}/call`,
                  params: { source, context },
                  data: { data: args },
                },
                httpConfig
              );
            } else {
              const result = await makeHttpRequest<T>(
                {
                  method: "POST",
                  url: `/${entityName}/call`,
                  params: { source, context },
                  data: { data: args },
                },
                httpConfig
              );
              return result;
            }
          };

        default:
          throw new Error(`Method ${prop} is not supported`);
      }
    },
  });
}

export function createLocalRepositoryProxy<T extends Record<string, any>>(
  options: RepoOptions<T>,
  entityConfigs: EntityConfigs
): ProxyRepo<T> {
  return new Proxy({} as ProxyRepo<T>, {
    get: (target, prop: string) => {
      const { entity, context } = options;
      const entityName = getEntityName(entity);
      const source = options.source || entityConfigs[entityName]?.defaultSource;

      if (!source) {
        throw new Error(`Source is required for entity ${entityName}`);
      }

      switch (prop) {
        case "findMany":
          return async (args: FindManyArgs<T> = {}) => {
            const result = await executeLocalFindMany(
              args,
              entityName,
              source,
              context
            );

            if (args.include && result && result.length > 0) {
              const resultWithRelations = await loadRelationsForMany(
                result,
                args.include
              );
              return createEntityInstances(entity, resultWithRelations);
            }

            return createEntityInstances(entity, result);
          };

        case "findOne":
          return async (args: FindOneArgs<T>) => {
            const result = await executeLocalFindOne(
              args,
              entityName,
              source,
              context
            );

            if (args.include && result) {
              const resultWithRelations = await loadRelations(
                result,
                args.include
              );
              return createEntityInstance(entity, resultWithRelations);
            }

            return result ? createEntityInstance(entity, result) : null;
          };

        case "create":
          return async (args: CreationArgs<T>) => {
            const result = await executeLocalCreate(args, entityName, source);
            return createEntityInstance(entity, result);
          };

        case "update":
          return async (args: UpdateArgs<T>) => {
            const result = await executeLocalUpdate(args, entityName, source);
            return createEntityInstance(entity, result);
          };

        case "delete":
          return async (args: DeletionArgs<T>) => {
            return await executeLocalDelete(args, entityName, source);
          };

        case "call":
          return async (args: CallArgs<T>) => {
            return await executeLocalCall(args, entityName, source, context);
          };

        default:
          throw new Error(`Method ${prop} is not supported`);
      }
    },
  });
}

export function createHybridRepositoryProxy<T extends Record<string, any>>(
  options: RepoOptions<T>,
  entityConfigs: EntityConfigs,
  httpConfig: HttpClientConfig
): ProxyRepo<T> {
  return new Proxy({} as ProxyRepo<T>, {
    get: (target, prop: string) => {
      const { entity, context } = options;
      const entityName = getEntityName(entity);
      const source = options.source || entityConfigs[entityName]?.defaultSource;

      switch (prop) {
        case "findMany":
          return async (args: FindManyArgs<T> = {}) => {
            // Try Local First
            if (!shouldFallbackToHttp(entityName, source)) {
              try {
                const localResult = await executeLocalFindMany(
                  args,
                  entityName,
                  source!,
                  context
                );

                if (localResult && localResult.length > 0) {
                  if (args.include && localResult.length > 0) {
                    const resultWithRelations = await loadRelationsForMany(
                      localResult,
                      args.include
                    );
                    return createEntityInstances(entity, resultWithRelations);
                  }
                  return createEntityInstances(entity, localResult);
                }
              } catch (error) {
                console.warn(`Local findMany failed for ${entityName}:`, error);
              }
            }

            // Fallback to request remote api
            try {
              const params = buildHttpFindManyParams(args, source, context);
              const httpResult = await makeHttpRequest<T[]>(
                {
                  method: "GET",
                  url: `/${entityName}/list`,
                  params,
                },
                httpConfig
              );

              if (args.include && httpResult && httpResult.length > 0) {
                const resultWithRelations = await loadRelationsForMany(
                  httpResult,
                  args.include
                );
                return createEntityInstances(entity, resultWithRelations);
              }

              return createEntityInstances(entity, httpResult);
            } catch (httpError) {
              logHttpFallbackWarning(entityName, "findMany", httpError);
              return [];
            }
          };

        case "findOne":
          return async (args: FindOneArgs<T>) => {
            if (!shouldFallbackToHttp(entityName, source)) {
              try {
                const localResult = await executeLocalFindOne(
                  args,
                  entityName,
                  source!,
                  context
                );

                if (localResult) {
                  if (args.include) {
                    const resultWithRelations = await loadRelations(
                      localResult,
                      args.include
                    );
                    return createEntityInstance(entity, resultWithRelations);
                  }
                  return createEntityInstance(entity, localResult);
                }
              } catch (error) {
                console.warn(`Local findOne failed for ${entityName}:`, error);
              }
            }

            try {
              const params = buildHttpFindOneParams(args, source, context);
              const httpResult = await makeHttpRequest<T | null>(
                {
                  method: "GET",
                  url: `/${entityName}/find_one`,
                  params,
                },
                httpConfig
              );

              if (args.include && httpResult) {
                const resultWithRelations = await loadRelations(
                  httpResult,
                  args.include
                );
                return createEntityInstance(entity, resultWithRelations);
              }

              return httpResult
                ? createEntityInstance(entity, httpResult)
                : null;
            } catch (httpError) {
              logHttpFallbackWarning(entityName, "findOne", httpError);
              return null;
            }
          };

        case "create":
          return async (args: CreationArgs<T>) => {
            if (!shouldFallbackToHttp(entityName, source)) {
              try {
                const localResult = await executeLocalCreate(
                  args,
                  entityName,
                  source!
                );
                return createEntityInstance(entity, localResult);
              } catch (error) {
                console.warn(`Local create failed for ${entityName}:`, error);
              }
            }

            try {
              const httpResult = await makeHttpRequest<T>(
                {
                  method: "POST",
                  url: `/${entityName}/create`,
                  params: { source, context },
                  data: { data: args.data },
                },
                httpConfig
              );
              return createEntityInstance(entity, httpResult);
            } catch (httpError) {
              logHttpFallbackWarning(entityName, "create", httpError);
              throw httpError;
            }
          };

        case "update":
          return async (args: UpdateArgs<T>) => {
            if (!shouldFallbackToHttp(entityName, source)) {
              try {
                const localResult = await executeLocalUpdate(
                  args,
                  entityName,
                  source!
                );
                return createEntityInstance(entity, localResult);
              } catch (error) {
                console.warn(`Local update failed for ${entityName}:`, error);
              }
            }

            try {
              const httpResult = await makeHttpRequest<T>(
                {
                  method: "PATCH",
                  url: `/${entityName}/update`,
                  params: { source, context },
                  data: {
                    where: args.where,
                    data: args.data,
                  },
                },
                httpConfig
              );
              return createEntityInstance(entity, httpResult);
            } catch (httpError) {
              logHttpFallbackWarning(entityName, "update", httpError);
              throw httpError;
            }
          };

        case "delete":
          return async (args: DeletionArgs<T>) => {
            if (!shouldFallbackToHttp(entityName, source)) {
              try {
                return await executeLocalDelete(args, entityName, source!);
              } catch (error) {
                console.warn(`Local delete failed for ${entityName}:`, error);
              }
            }

            try {
              return await makeHttpRequest<boolean>(
                {
                  method: "DELETE",
                  url: `/${entityName}/delete`,
                  params: { source, context },
                  data: { where: args.where },
                },
                httpConfig
              );
            } catch (httpError) {
              logHttpFallbackWarning(entityName, "delete", httpError);
              throw httpError;
            }
          };

        case "call":
          return async (args: CallArgs<T>) => {
            if (!shouldFallbackToHttp(entityName, source)) {
              try {
                return await executeLocalCall(
                  args,
                  entityName,
                  source!,
                  context
                );
              } catch (error) {
                console.warn(`Local call failed for ${entityName}:`, error);
              }
            }

            try {
              // For stream requests, we need to handle the response differently
              if (context?.stream) {
                return await makeStreamRequest(
                  {
                    method: "POST",
                    url: `/${entityName}/call`,
                    params: { source, context },
                    data: { data: args },
                  },
                  httpConfig
                );
              } else {
                const result = await makeHttpRequest<T>(
                  {
                    method: "POST",
                    url: `/${entityName}/call`,
                    params: { source, context },
                    data: args,
                  },
                  httpConfig
                );
                return result;
              }
            } catch (httpError) {
              logHttpFallbackWarning(entityName, "call", httpError);
              throw httpError;
            }
          };

        default:
          throw new Error(`Method ${prop} is not supported`);
      }
    },
  });
}
