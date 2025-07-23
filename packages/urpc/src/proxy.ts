import { type EntityConfigs } from "@unilab/urpc-core";
import type { HttpClientConfig, ProxyRepo, RepoOptions } from "./types";
import {
  getEntityName,
  shouldFallbackToHttp,
  executeLocalMethod,
  executeRemoteMethod,
} from "./utils";

export function createHttpRepositoryProxy<T extends Record<string, any>>(
  options: RepoOptions<T>,
  entityConfigs: EntityConfigs,
  httpConfig: HttpClientConfig
): ProxyRepo<T> {
  return new Proxy({} as ProxyRepo<T>, {
    get: (target, funcName: string) => {
      const { entity, context } = options;
      const entityName = getEntityName(entity);
      const source = options.source || entityConfigs[entityName]?.defaultSource;
      return async (args: any) => {
        return executeRemoteMethod({
          entity,
          entityName,
          source,
          funcName,
          args,
          context,
          httpConfig,
        });
      };
    },
  });
}

export function createLocalRepositoryProxy<T extends Record<string, any>>(
  options: RepoOptions<T>,
  entityConfigs: EntityConfigs
): ProxyRepo<T> {
  return new Proxy({} as ProxyRepo<T>, {
    get: (target, funcName: string) => {
      const { entity, context } = options;
      const entityName = getEntityName(entity);
      const source = options.source || entityConfigs[entityName]?.defaultSource;
      if (!source) {
        throw new Error(`Source is required for entity ${entityName}`);
      }
      return async (args: any) => {
        return executeLocalMethod({
          entity,
          entityName,
          source,
          funcName,
          args,
          context,
        });
      };
    },
  });
}

export function createHybridRepositoryProxy<T extends Record<string, any>>(
  options: RepoOptions<T>,
  entityConfigs: EntityConfigs,
  httpConfig: HttpClientConfig
): ProxyRepo<T> {
  return new Proxy({} as ProxyRepo<T>, {
    get: (target, funcName: string) => {
      const { entity, context } = options;
      const entityName = getEntityName(entity);
      const source = options.source || entityConfigs[entityName]?.defaultSource;
      return async (args: any) => {
        if (!shouldFallbackToHttp(entityName, source)) {
          if (!source) {
            throw new Error(`Source is required for entity ${entityName}`);
          }
          return executeLocalMethod({
            entity,
            entityName,
            source,
            funcName,
            args,
            context,
          });
        }
        return executeRemoteMethod({
          entity,
          entityName,
          source,
          funcName,
          args,
          context,
          httpConfig,
        });
      };
    },
  });
}
